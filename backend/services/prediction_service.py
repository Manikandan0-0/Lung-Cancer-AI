"""
Prediction service.

Runs model inference and returns structured probability results.
"""

from __future__ import annotations

import logging
from typing import Tuple

import numpy as np

import model as model_module
import config

logger = logging.getLogger(__name__)


def run_prediction(preprocessed_batch: np.ndarray) -> Tuple[str, dict[str, float]]:
    """
    Run model inference and return the predicted class and all probabilities.

    Parameters
    ----------
    preprocessed_batch : np.ndarray
        Shape (1, 224, 224, 3), result of preprocessing.preprocess_image().

    Returns
    -------
    predicted_class : str
        Human-readable class name of the highest-probability class.
    probabilities : dict[str, float]
        Mapping of class name → probability percentage (0.0–100.0),
        rounded to two decimal places.

    Raises
    ------
    RuntimeError
        If the model is not loaded.
    """
    if model_module.loaded_model is None:
        raise RuntimeError(
            "Model is not loaded. Call model.load_model_artifacts() at startup."
        )

    # --- Inference --------------------------------------------------------
    raw_probs: np.ndarray = model_module.loaded_model.predict(
        preprocessed_batch, verbose=0
    )  # shape: (1, 4)

    probs: np.ndarray = raw_probs[0]  # shape: (4,)

    # --- Identify predicted class ----------------------------------------
    predicted_index: int = int(np.argmax(probs))
    predicted_class: str = model_module.class_names[predicted_index]

    # --- Build probability dict (percentages, 2 d.p.) --------------------
    probabilities: dict[str, float] = {
        name: round(float(probs[idx]) * 100.0, 2)
        for idx, name in enumerate(model_module.class_names)
    }

    logger.info(
        "Prediction: class='%s' (index=%d), raw_max=%.4f",
        predicted_class,
        predicted_index,
        float(probs[predicted_index]),
    )

    return predicted_class, probabilities
