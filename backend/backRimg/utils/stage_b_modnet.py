import os
import threading
import numpy as np
import torch
import torch.nn.functional as F

MODNET_MODEL = None
MODNET_LOCK = threading.Lock()


def load_modnet(device):
    """
    Loads MODNet once. If torch.hub cache is broken, raises a clear error.
    """
    global MODNET_MODEL
    if MODNET_MODEL is not None:
        return MODNET_MODEL

    with MODNET_LOCK:
        if MODNET_MODEL is not None:
            return MODNET_MODEL

        # Force hub to use a deterministic cache dir (optional)
        # os.environ["TORCH_HOME"] = os.path.expanduser("~/.cache/torch")

        model = torch.hub.load(
            "ZHKKKe/MODNet",
            "modnet_photographic_portrait_matting",
            pretrained=True,
            force_reload=False,   # set True only if you want to re-download
            trust_repo=True       # avoids prompts / issues with new torch warnings
        )

        model.to(device)
        model.eval()
        MODNET_MODEL = model
        return MODNET_MODEL


def modnet_alpha(orig_np_rgb: np.ndarray, device, ref_size=512) -> np.ndarray:
    """
    Returns alpha matte (H,W) float32 in [0,1]
    """
    modnet = load_modnet(device)
    H, W = orig_np_rgb.shape[:2]

    im = torch.from_numpy(orig_np_rgb).float().permute(2, 0, 1).unsqueeze(0) / 255.0
    im = F.interpolate(im, size=(ref_size, ref_size), mode="bilinear", align_corners=False).to(device)

    with torch.inference_mode():
        _, _, matte = modnet(im, True)

    matte = F.interpolate(matte, size=(H, W), mode="bilinear", align_corners=False)
    a = matte[0, 0].detach().cpu().numpy().astype(np.float32)
    return np.clip(a, 0.0, 1.0)