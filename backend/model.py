"""
Model loading module.

Loads the trained ResNet50 .keras model exactly once at startup and exposes:
  - ``loaded_model``  – the Keras model object
  - ``class_names``   – ordered list of class labels matching training indices
  - ``preprocessing_config`` – raw dict from preprocessing_config.json

No training occurs here.  Weights are never modified.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Optional

import tensorflow as tf
from tensorflow import keras

import config

logger = logging.getLogger(__name__)

# Module-level singletons populated by ``load_model_artifacts``
loaded_model: Optional[keras.Model] = None
class_names: list[str] = []          # index → class label
preprocessing_config: dict = {}


def _validate_model(model: keras.Model) -> None:
    """Raise ValueError if the loaded model does not match expected architecture."""
    output_shape = model.output_shape  # e.g. (None, 4)
    if len(output_shape) != 2 or output_shape[-1] != config.NUM_CLASSES:
        raise ValueError(
            f"Model output shape {output_shape} does not match expected "
            f"(None, {config.NUM_CLASSES})."
        )

    input_shape = model.input_shape  # e.g. (None, 224, 224, 3)
    expected = (None,) + config.EXPECTED_INPUT_SHAPE
    if input_shape != expected:
        raise ValueError(
            f"Model input shape {input_shape} does not match expected {expected}."
        )

    logger.info("Model validation passed: input=%s output=%s", input_shape, output_shape)


def _load_class_mapping(path: Path) -> list[str]:
    """
    Read class_mapping.json and return a list indexed by class integer.

    Expected format:  {"adenocarcinoma": 0, "large.cell.carcinoma": 1, ...}
    """
    with path.open("r") as fh:
        raw: dict[str, int] = json.load(fh)

    # Build index → name list (sort by integer value)
    pairs = sorted(raw.items(), key=lambda kv: kv[1])
    if [v for _, v in pairs] != list(range(config.NUM_CLASSES)):
        raise ValueError(
            f"class_mapping.json indices {[v for _, v in pairs]} are not "
            f"a contiguous 0..{config.NUM_CLASSES - 1} sequence."
        )
    names = [name for name, _ in pairs]
    logger.info("Class mapping loaded: %s", names)
    return names


def _load_preprocessing_config(path: Path) -> dict:
    """Read preprocessing_config.json and return as dict."""
    with path.open("r") as fh:
        cfg: dict = json.load(fh)
    logger.info("Preprocessing config loaded: %s", cfg)
    return cfg


def load_model_artifacts() -> None:
    """
    Load all model artefacts from disk into module-level singletons.

    Designed to be called once at application startup (FastAPI lifespan).
    Raises FileNotFoundError or ValueError on any problem so the server fails
    fast with a descriptive message rather than silently serving wrong results.
    """
    global loaded_model, class_names, preprocessing_config

    # --- Validate file existence -----------------------------------------
    for path, label in [
        (config.MODEL_PATH, "Keras model"),
        (config.CLASS_MAPPING_PATH, "class mapping"),
        (config.PREPROCESSING_CONFIG_PATH, "preprocessing config"),
    ]:
        if not path.exists():
            raise FileNotFoundError(
                f"{label} file not found at '{path}'. "
                "Place the trained artefacts in backend/models/ before starting."
            )

    # --- Load preprocessing config first (cheap) -------------------------
    preprocessing_config = _load_preprocessing_config(config.PREPROCESSING_CONFIG_PATH)

    # --- Load class mapping -----------------------------------------------
    class_names = _load_class_mapping(config.CLASS_MAPPING_PATH)

    # --- Load Keras model -------------------------------------------------
    logger.info("Loading model from %s …", config.MODEL_PATH)
    try:
        loaded_model = keras.models.load_model(str(config.MODEL_PATH))
    except Exception as exc:
        raise RuntimeError(
            f"Failed to load model from '{config.MODEL_PATH}': {exc}"
        ) from exc

    # --- Validate architecture -------------------------------------------
    _validate_model(loaded_model)
    logger.info("Model loaded successfully from '%s'.", config.MODEL_PATH)
