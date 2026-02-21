from PIL import Image, ImageFilter
import numpy as np
from skimage.morphology import (
    remove_small_objects,
    remove_small_holes,
    binary_closing,
    binary_opening,
    binary_dilation,
    disk,
)
from skimage.measure import label, regionprops


def edge_band(alpha_01: np.ndarray, low=0.15, high=0.85, grow=6) -> np.ndarray:
    band = (alpha_01 > low) & (alpha_01 < high)
    band = binary_dilation(band, disk(grow))
    return band


def refine_alpha(alpha_01: np.ndarray) -> np.ndarray:
    """
    alpha_01: float32 (H,W) [0,1]
    returns uint8 alpha (H,W) [0..255]
    """
    fg = alpha_01 > 0.45  # slightly softer than 0.5

    fg = remove_small_objects(fg, min_size=800)
    fg = remove_small_holes(fg, area_threshold=800)

    fg = binary_opening(fg, disk(2))
    fg = binary_closing(fg, disk(3))

    lab = label(fg)
    if lab.max() > 0:
        regions = regionprops(lab)
        largest = max(regions, key=lambda r: r.area).label
        fg = (lab == largest)

    alpha = alpha_01.copy()
    alpha[~fg] = 0.0

    alpha_u8 = (alpha * 255.0).clip(0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha_u8).filter(ImageFilter.GaussianBlur(radius=1.2))
    return np.array(alpha_img, dtype=np.uint8)