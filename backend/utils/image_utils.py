"""
Utility functions for image encoding/decoding.

Keeps image I/O helpers separate from business logic.
"""

from __future__ import annotations

import base64
from io import BytesIO

import numpy as np
from PIL import Image


def numpy_to_base64_png(img_array: np.ndarray) -> str:
    """
    Encode a (H, W, 3) uint8 NumPy array as a Base64-encoded PNG string.

    Parameters
    ----------
    img_array : np.ndarray
        RGB image array with shape (H, W, 3) and dtype uint8.

    Returns
    -------
    str
        Base64-encoded PNG string (without data-URI prefix).
    """
    pil_img = Image.fromarray(img_array.astype(np.uint8), mode="RGB")
    buffer = BytesIO()
    pil_img.save(buffer, format="PNG", optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return encoded


def base64_to_numpy(b64_str: str) -> np.ndarray:
    """
    Decode a Base64 PNG string back into a uint8 NumPy array.

    Primarily used in tests.
    """
    image_bytes = base64.b64decode(b64_str)
    pil_img = Image.open(BytesIO(image_bytes)).convert("RGB")
    return np.array(pil_img, dtype=np.uint8)
