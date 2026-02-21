import numpy as np
import cv2
import onnxruntime as ort
from huggingface_hub import hf_hub_download

# Xenova/modnet ships ONNX files under /onnx (model.onnx, model_fp16.onnx, etc.) :contentReference[oaicite:1]{index=1}
_REPO_ID = "Xenova/modnet"
_ONNX_FILE = "onnx/model.onnx"  # safest on CPU. You can switch to onnx/model_fp16.onnx if desired.

_SESSION = None


def _get_session():
    global _SESSION
    if _SESSION is not None:
        return _SESSION

    model_path = hf_hub_download(repo_id=_REPO_ID, filename=_ONNX_FILE)

    # Prefer CPU (stable everywhere). If you use GPU ORT, you can add providers here.
    providers = ["CPUExecutionProvider"]
    _SESSION = ort.InferenceSession(model_path, providers=providers)
    return _SESSION


def _preprocess_modnet(rgb_uint8: np.ndarray, shortest_edge: int = 512):
    """
    Xenova/modnet preprocessor config: rescale_factor=1/255, normalize with mean/std=0.5,
    resize with shortest_edge=512, and size_divisibility=32. :contentReference[oaicite:2]{index=2}
    """
    h, w = rgb_uint8.shape[:2]

    # resize so shortest edge = 512
    scale = shortest_edge / min(h, w)
    nh, nw = int(round(h * scale)), int(round(w * scale))
    resized = cv2.resize(rgb_uint8, (nw, nh), interpolation=cv2.INTER_LINEAR)

    # pad to multiple of 32 (common for MODNet; config mentions size_divisibility=32) :contentReference[oaicite:3]{index=3}
    pad_h = (32 - nh % 32) % 32
    pad_w = (32 - nw % 32) % 32
    padded = cv2.copyMakeBorder(resized, 0, pad_h, 0, pad_w, borderType=cv2.BORDER_CONSTANT, value=(0, 0, 0))

    # to float, rescale 1/255, normalize (x-0.5)/0.5
    x = padded.astype(np.float32) / 255.0
    x = (x - 0.5) / 0.5

    # NCHW
    x = np.transpose(x, (2, 0, 1))[None, ...]  # (1,3,H,W)
    meta = (h, w, nh, nw, pad_h, pad_w)
    return x, meta


def modnet_alpha(rgb_uint8: np.ndarray) -> np.ndarray:
    """
    Returns alpha (H,W) float32 in [0,1] at original image size.
    """
    sess = _get_session()
    inp, meta = _preprocess_modnet(rgb_uint8, shortest_edge=512)
    H, W, nh, nw, pad_h, pad_w = meta

    input_name = sess.get_inputs()[0].name
    out = sess.run(None, {input_name: inp})[0]  # expect (1,1,h,w) or similar

    # squeeze to HW
    matte = out
    while matte.ndim > 2:
        matte = matte[0]
    matte = matte.astype(np.float32)

    # remove padding
    matte = matte[: nh, : nw]

    # resize back to original
    matte = cv2.resize(matte, (W, H), interpolation=cv2.INTER_LINEAR)
    return np.clip(matte, 0.0, 1.0).astype(np.float32)