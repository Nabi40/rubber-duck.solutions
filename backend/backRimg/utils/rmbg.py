from PIL import Image
import numpy as np
import torch
import torch.nn.functional as F
from torchvision.transforms.functional import normalize
from transformers import AutoModelForImageSegmentation

import cv2  # requires opencv-contrib-python for ximgproc
from skimage.morphology import erosion, disk


# -----------------------------
# Model init (load once)
# -----------------------------
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

RMBG_MODEL = AutoModelForImageSegmentation.from_pretrained(
    "briaai/RMBG-1.4",
    trust_remote_code=True
).to(device)
RMBG_MODEL.eval()


# -----------------------------
# Helpers
# -----------------------------
def preprocess_image_letterbox(im: np.ndarray, size: int):
    """
    Keep aspect ratio, pad to (size,size).
    Returns:
      tensor (1,3,size,size), pad_info=(top,left,new_h,new_w), original_shape=(H,W)
    """
    H, W = im.shape[:2]
    scale = size / max(H, W)
    new_h = int(round(H * scale))
    new_w = int(round(W * scale))

    im_resized = Image.fromarray(im).resize((new_w, new_h), Image.BILINEAR)

    canvas = Image.new("RGB", (size, size), (0, 0, 0))
    top = (size - new_h) // 2
    left = (size - new_w) // 2
    canvas.paste(im_resized, (left, top))

    im_np = np.array(canvas)

    t = torch.tensor(im_np, dtype=torch.float32).permute(2, 0, 1).unsqueeze(0)  # 1,3,H,W
    t = t / 255.0
    t = normalize(t, [0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
    return t, (top, left, new_h, new_w), (H, W)


def pick_mask_tensor(output):
    """
    RMBG output can be list/tuple/dict. Pick the most mask-like tensor.
    """
    tensors = []

    def walk(x):
        if torch.is_tensor(x):
            tensors.append(x)
        elif isinstance(x, (list, tuple)):
            for i in x:
                walk(i)
        elif isinstance(x, dict):
            for v in x.values():
                walk(v)

    walk(output)
    if not tensors:
        return None

    def score(t: torch.Tensor):
        if t.dim() == 2:
            h, w = t.shape
            c = 1
        elif t.dim() == 3:
            c, h, w = t.shape
        elif t.dim() == 4:
            _, c, h, w = t.shape
        else:
            return -1
        if h < 64 or w < 64:
            return -1
        area = h * w
        channel_bonus = 2 if c == 1 else 0
        return area + channel_bonus * 10_000_000

    best = max(tensors, key=score)
    return best if score(best) >= 0 else None


def to_alpha01(mask: torch.Tensor, out_hw):
    """
    Convert mask tensor to numpy float alpha in [0,1] at out_hw.
    mask may be (H,W) / (C,H,W) / (N,C,H,W)
    """
    H, W = out_hw

    if mask.dim() == 2:
        mask = mask.unsqueeze(0).unsqueeze(0)  # 1,1,h,w
    elif mask.dim() == 3:
        mask = mask.unsqueeze(0)               # 1,c,h,w
    elif mask.dim() == 4:
        pass
    else:
        raise ValueError(f"Unexpected mask shape: {mask.shape}")

    if mask.size(1) > 1:
        mask = mask[:, :1, :, :]

    mask = F.interpolate(mask, size=(H, W), mode="bilinear", align_corners=False)
    m = mask[0, 0].detach().cpu().float().numpy()

    # Decide sigmoid vs clamp
    m_min, m_max = float(m.min()), float(m.max())
    if m_min < 0.0 or m_max > 1.0:
        m = 1.0 / (1.0 + np.exp(-m))
    else:
        m = np.clip(m, 0.0, 1.0)

    # Invert if it looks like "everything foreground"
    if m.mean() > 0.90:
        m = 1.0 - m

    return m.astype(np.float32)


def guided_refine(rgb_image: np.ndarray, alpha01: np.ndarray):
    """
    Edge-align alpha using guided filter + edge-only smoothing + slight sharpening.
    Requires: opencv-contrib-python for cv2.ximgproc.guidedFilter
    """
    alpha = alpha01.astype(np.float32)

    # If no ximgproc, just do light edge smoothing + sharpen
    if not hasattr(cv2, "ximgproc"):
        edge = (alpha > 0.15) & (alpha < 0.85)
        alpha_blur = cv2.GaussianBlur(alpha, (5, 5), 0)
        alpha[edge] = alpha_blur[edge]
        alpha = np.clip((alpha - 0.03) * 1.10, 0, 1)
        return alpha.astype(np.float32)

    gray = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
    src = (alpha * 255.0).astype(np.float32)

    refined = cv2.ximgproc.guidedFilter(
        guide=gray,
        src=src,
        radius=12,
        eps=1e-6
    )
    alpha = (refined / 255.0).astype(np.float32)
    alpha = np.clip(alpha, 0.0, 1.0)

    # Edge-only smoothing (keeps face sharp, softens hair boundary nicely)
    edge = (alpha > 0.15) & (alpha < 0.85)
    alpha_blur = cv2.GaussianBlur(alpha, (5, 5), 0)
    alpha[edge] = alpha_blur[edge]

    # Slight matte sharpening (improves hairline clarity)
    alpha = np.clip((alpha - 0.03) * 1.10, 0.0, 1.0)

    return alpha.astype(np.float32)


def remove_halo(alpha01: np.ndarray):
    """
    Gentle halo cleanup. Avoid strong erosion (kills hair).
    """
    out = alpha01.copy()

    # Only trim *very* faint fringe
    fringe = (out > 0.02) & (out < 0.12)
    out[fringe] *= 0.6  # reduce faint halo without cutting hair

    return np.clip(out, 0, 1).astype(np.float32)


# -----------------------------
# Main API: alpha from RMBG (improved)
# -----------------------------
def rmbg_alpha(orig_np_rgb: np.ndarray) -> np.ndarray:
    """
    Returns alpha mask (H,W) float32 in [0,1]
    with:
      - letterbox (no stretch)
      - multi-scale (1024 + 768)
      - guided filter refinement
      - halo reduction
    """
    H, W = orig_np_rgb.shape[:2]

    # Pass 1 (1024)
    inp1, pad1, _ = preprocess_image_letterbox(orig_np_rgb, size=1024)
    with torch.inference_mode():
        out1 = RMBG_MODEL(inp1.to(device))
    m1 = pick_mask_tensor(out1)
    if m1 is None:
        raise ValueError("RMBG: could not find mask tensor (pass1)")
    alpha1 = to_alpha01(m1, out_hw=(1024, 1024))

    # Unpad alpha1 back to original aspect then resize to (H,W)
    top, left, new_h, new_w = pad1
    alpha1 = alpha1[top:top + new_h, left:left + new_w]
    alpha1 = np.array(Image.fromarray((alpha1 * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)) / 255.0
    alpha1 = alpha1.astype(np.float32)

    # Pass 2 (768) for stability
    inp2, pad2, _ = preprocess_image_letterbox(orig_np_rgb, size=768)
    with torch.inference_mode():
        out2 = RMBG_MODEL(inp2.to(device))
    m2 = pick_mask_tensor(out2)
    if m2 is None:
        raise ValueError("RMBG: could not find mask tensor (pass2)")
    alpha2 = to_alpha01(m2, out_hw=(768, 768))

    top, left, new_h, new_w = pad2
    alpha2 = alpha2[top:top + new_h, left:left + new_w]
    alpha2 = np.array(Image.fromarray((alpha2 * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)) / 255.0
    alpha2 = alpha2.astype(np.float32)

    # Combine
    alpha = 0.6 * alpha1 + 0.4 * alpha2
    alpha = np.clip(alpha, 0.0, 1.0)

    # Edge refinement
    alpha = guided_refine(orig_np_rgb, alpha)

    # Halo reduction
    alpha = remove_halo(alpha)

    return alpha.astype(np.float32)