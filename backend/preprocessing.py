"""
Image preprocessing module.

Reproduces the exact preprocessing used during training:
  1. Open image with Pillow → convert to RGB
  2. Resize to 224 × 224 (bilinear interpolation, same as Keras default)
  3. Convert to float32 NumPy array
  4. Apply tensorflow.keras.applications.resnet50.preprocess_input
     (channel-wise mean subtraction in BGR order, NOT simple /255)
  5. Add batch dimension → shape (1, 224, 224, 3)

The preprocessing function is verified against preprocessing_config.json
at startup.  If the config records a different function, an error is raised
rather than silently applying wrong normalisation.
"""

from __future__ import annotations

import logging
from io import BytesIO
from typing import Tuple

import numpy as np
from PIL import Image, UnidentifiedImageError
from tensorflow.keras.applications.resnet50 import preprocess_input

import config

logger = logging.getLogger(__name__)

EXPECTED_PREPROCESS_FN = "tensorflow.keras.applications.resnet50.preprocess_input"


def validate_preprocessing_config(cfg: dict) -> None:
    """
    Check that the saved preprocessing config matches the implemented function.

    Raises ValueError if there is a mismatch so the developer is informed
    immediately rather than getting silent wrong predictions.
    """
    recorded_fn = cfg.get("preprocessing_function", "")
    if recorded_fn and recorded_fn != EXPECTED_PREPROCESS_FN:
        raise ValueError(
            f"preprocessing_config.json records preprocessing_function="
            f"'{recorded_fn}' but this module implements "
            f"'{EXPECTED_PREPROCESS_FN}'. Align the config or the code."
        )
    logger.info("Preprocessing config validated against implementation.")


def validate_upload(file_bytes: bytes, filename: str) -> None:
    """
    Validate uploaded file before any processing.

    Raises:
        ValueError: for empty uploads, unsupported extensions, or size violations.
    """
    if not file_bytes:
        raise ValueError("Uploaded file is empty.")

    suffix = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if suffix not in config.ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file extension '{suffix}'. "
            f"Accepted: {sorted(config.ALLOWED_EXTENSIONS)}"
        )

    if len(file_bytes) > config.MAX_UPLOAD_SIZE_BYTES:
        raise ValueError(
            f"File size {len(file_bytes) / 1024 / 1024:.1f} MB exceeds "
            f"the {config.MAX_UPLOAD_SIZE_MB} MB limit."
        )


def preprocess_image(
    file_bytes: bytes,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Preprocess raw image bytes into a model-ready batch tensor.

    Parameters
    ----------
    file_bytes : bytes
        Raw bytes of the uploaded image (JPEG or PNG).

    Returns
    -------
    preprocessed_batch : np.ndarray
        Shape (1, 224, 224, 3), dtype float32, ready for model.predict().
    original_rgb : np.ndarray
        Shape (H, W, 3), dtype uint8, the original image resized to 224×224
        (before preprocessing).  Kept for Grad-CAM overlay generation.

    Raises
    ------
    ValueError
        If the image cannot be decoded or has an unexpected shape.
    """
    try:
        pil_img = Image.open(BytesIO(file_bytes))
    except UnidentifiedImageError as exc:
        raise ValueError(
            f"Cannot decode image. Ensure the file is a valid JPEG or PNG. "
            f"Detail: {exc}"
        ) from exc

    # Convert to RGB (handles RGBA, greyscale, palette-mode images)
    if pil_img.mode != "RGB":
        pil_img = pil_img.convert("RGB")

    # Resize to model input dimensions (Lanczos == high-quality bilinear)
    pil_img = pil_img.resize(
        (config.INPUT_WIDTH, config.INPUT_HEIGHT), Image.LANCZOS
    )

    # Save the uint8 original for overlay generation (before float conversion)
    original_rgb: np.ndarray = np.array(pil_img, dtype=np.uint8)

    # Convert to float32 array
    img_array = np.array(pil_img, dtype=np.float32)

    # Safety check
    if img_array.shape != config.EXPECTED_INPUT_SHAPE:
        raise ValueError(
            f"Unexpected image array shape {img_array.shape} after resize. "
            f"Expected {config.EXPECTED_INPUT_SHAPE}."
        )

    # Add batch dimension: (224, 224, 3) → (1, 224, 224, 3)
    img_batch = np.expand_dims(img_array, axis=0)

    # Apply ResNet50 preprocessing:
    # Converts RGB → BGR, then subtracts ImageNet channel means:
    #   B: 103.939,  G: 116.779,  R: 123.68
    # This is NOT a simple /255 normalisation.
    preprocessed_batch = preprocess_input(img_batch)

    # Validate numerical properties
    if np.any(np.isnan(preprocessed_batch)) or np.any(np.isinf(preprocessed_batch)):
        raise ValueError(
            "Preprocessing produced NaN or Inf values. "
            "The input image may be corrupt."
        )

    logger.debug(
        "Image preprocessed: shape=%s dtype=%s min=%.3f max=%.3f",
        preprocessed_batch.shape,
        preprocessed_batch.dtype,
        float(preprocessed_batch.min()),
        float(preprocessed_batch.max()),
    )

    return preprocessed_batch, original_rgb
