from pathlib import Path
from PIL import Image
import numpy as np

from .rmbg import rmbg_alpha
from .mask_ops import edge_band, refine_alpha


def remove_bg(input_image_path: str, output_dir: str) -> str:
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    orig_rgb = Image.open(input_image_path).convert("RGB")
    orig_np = np.array(orig_rgb)  # uint8 RGB

    # Stage A (RMBG)
    alpha_a = rmbg_alpha(orig_np)

    # Stage B (Xenova/modnet ONNX) - safe fallback
    alpha = alpha_a
    try:
        from .stage_b_modnet_onnx import modnet_alpha
        alpha_b = modnet_alpha(orig_np)  # returns (H,W) float32 [0..1]

        band = edge_band(alpha_a, low=0.15, high=0.85, grow=6)
        alpha = alpha_a.copy()
        alpha[band] = alpha_b[band]
    except Exception as e:
        print("MODNet(ONNX) Stage-B skipped:", repr(e))

    alpha_u8 = refine_alpha(alpha)

    orig_rgba = Image.open(input_image_path).convert("RGBA")
    out = orig_rgba.copy()
    out.putalpha(Image.fromarray(alpha_u8))

    output_path = Path(output_dir) / f"{Path(input_image_path).stem}_no_bg.png"
    out.save(output_path)
    return str(output_path)