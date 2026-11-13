"""
Image service.

Orchestrates preprocessing, Grad-CAM generation, and image encoding
for the /explain endpoint.
"""

from __future__ import annotations

import logging
from typing import Tuple

import numpy as np

import model as model_module
from gradcam import generate_gradcam
from utils.image_utils import numpy_to_base64_png

logger = logging.getLogger(__name__)


def build_explain_images(
    preprocessed_batch: np.ndarray,
    original_rgb: np.ndarray,
    class_index: int,
) -> Tuple[str, str, str]:
    """
    Generate Grad-CAM images for the given class and encode them as Base64 PNGs.

    Parameters
    ----------
    preprocessed_batch : np.ndarray
        Shape (1, 224, 224, 3), ready for model inference.
    original_rgb : np.ndarray
        Shape (224, 224, 3) uint8, before preprocessing.
    class_index : int
        Target class index for Grad-CAM (0–3).

    Returns
    -------
    original_b64 : str
        Base64-encoded PNG of the original image.
    heatmap_b64 : str
        Base64-encoded PNG of the Grad-CAM heatmap.
    overlay_b64 : str
        Base64-encoded PNG of the heatmap overlaid on the original.
    """
    if model_module.loaded_model is None:
        raise RuntimeError("Model not loaded.")

    original_arr, heatmap_arr, overlay_arr = generate_gradcam(
        full_model=model_module.loaded_model,
        preprocessed_batch=preprocessed_batch,
        original_rgb=original_rgb,
        class_index=class_index,
    )

    original_b64 = numpy_to_base64_png(original_arr)
    heatmap_b64 = numpy_to_base64_png(heatmap_arr)
    overlay_b64 = numpy_to_base64_png(overlay_arr)

    logger.info(
        "Grad-CAM images generated for class_index=%d. "
        "original=%d chars, heatmap=%d chars, overlay=%d chars",
        class_index,
        len(original_b64),
        len(heatmap_b64),
        len(overlay_b64),
    )

    return original_b64, heatmap_b64, overlay_b64
