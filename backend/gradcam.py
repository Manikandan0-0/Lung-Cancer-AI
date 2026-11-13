"""
Grad-CAM implementation compatible with Keras 3 and the nested ResNet50 model.

Architecture notes (from training notebook):
  - The outer model is named "functional".
  - Layer 0 of the outer model is the ResNet50 backbone (also named "functional").
  - The backbone output shape is (None, 7, 7, 2048).
  - After the backbone the classification head contains:
        BatchNormalization → GlobalAveragePooling2D (or similar pooling) →
        Dropout → Flatten → Dense(4, softmax) named "dense_3"
  - The model is NOT retrained; weights are read-only.

Approach:
  Rather than combining saved_model outputs with nested-layer outputs directly
  (which causes Keras 3 connectivity errors), we:
    1. Extract the ResNet50 backbone sub-model.
    2. Build a tf.keras.Model that maps backbone_input → backbone_output.
    3. Use tf.GradientTape to record gradients of the target class score with
       respect to the last convolutional feature maps.
    4. Compute the class-specific CAM and postprocess it.
"""

from __future__ import annotations

import logging
from typing import Optional, Tuple

import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras

import config

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _build_gradcam_model(full_model: keras.Model) -> Tuple[keras.Model, keras.Model]:
    """
    Build two sub-models:
      - ``feature_model``: input → last conv feature map (None, 7, 7, 2048)
      - ``classifier_model``: last conv feature map → class scores (None, 4)

    This avoids Keras 3 connectivity errors that arise from mixing saved_model
    outputs with nested layer outputs in a single Model() call.

    Returns
    -------
    feature_model : keras.Model
    classifier_model : keras.Model
    """
    # -----------------------------------------------------------------
    # Identify the ResNet50 backbone (the first nested sub-model)
    # -----------------------------------------------------------------
    backbone: Optional[keras.Model] = None
    for layer in full_model.layers:
        if isinstance(layer, keras.Model):
            backbone = layer
            break

    if backbone is None:
        raise RuntimeError(
            "Could not find a nested sub-model (ResNet50 backbone) inside "
            "the loaded model. Ensure the saved model is the original trained "
            "ResNet50 transfer-learning model."
        )

    logger.info(
        "Identified backbone '%s' with output shape %s.",
        backbone.name,
        backbone.output_shape,
    )

    # -----------------------------------------------------------------
    # Feature model: backbone_input → backbone_output (last conv maps)
    # -----------------------------------------------------------------
    feature_model = keras.Model(
        inputs=backbone.input,
        outputs=backbone.output,
        name="gradcam_feature_model",
    )

    # -----------------------------------------------------------------
    # Classifier model: backbone_output → final logits
    # We replay every layer that comes AFTER the backbone in the outer model.
    # -----------------------------------------------------------------
    # Collect post-backbone layers (exclude the backbone itself and input)
    post_backbone_layers = []
    backbone_found = False
    for layer in full_model.layers:
        if layer is backbone:
            backbone_found = True
            continue
        if backbone_found and not isinstance(layer, keras.layers.InputLayer):
            post_backbone_layers.append(layer)

    if not post_backbone_layers:
        raise RuntimeError(
            "No classification head layers found after the backbone. "
            "Cannot build Grad-CAM classifier sub-model."
        )

    # Build classifier sub-model by passing a symbolic input through each layer
    backbone_out_shape = backbone.output_shape[1:]  # e.g. (7, 7, 2048)
    cls_input = keras.Input(shape=backbone_out_shape, name="gradcam_cls_input")
    x = cls_input
    for layer in post_backbone_layers:
        try:
            x = layer(x)
        except Exception as exc:
            logger.warning(
                "Skipping layer '%s' during Grad-CAM classifier build: %s",
                layer.name,
                exc,
            )

    classifier_model = keras.Model(
        inputs=cls_input,
        outputs=x,
        name="gradcam_classifier_model",
    )

    logger.info(
        "Grad-CAM models built: feature_output=%s, classifier_output=%s",
        feature_model.output_shape,
        classifier_model.output_shape,
    )

    return feature_model, classifier_model


def _compute_gradcam(
    feature_model: keras.Model,
    classifier_model: keras.Model,
    preprocessed_batch: np.ndarray,
    class_index: int,
) -> np.ndarray:
    """
    Compute raw Grad-CAM heatmap for ``class_index``.

    Returns
    -------
    heatmap : np.ndarray
        Shape (7, 7), values in [0, 1].
    """
    img_tensor = tf.cast(preprocessed_batch, tf.float32)

    with tf.GradientTape() as tape:
        # Watch the intermediate feature maps
        feature_maps = feature_model(img_tensor, training=False)
        tape.watch(feature_maps)

        # Pass feature maps through the classifier head
        predictions = classifier_model(feature_maps, training=False)
        # Score for the target class
        class_score = predictions[:, class_index]

    # Gradients of class score w.r.t. feature maps
    grads = tape.gradient(class_score, feature_maps)  # (1, 7, 7, 2048)

    if grads is None:
        raise RuntimeError(
            "GradientTape returned None gradients. The computational graph "
            "may be disconnected."
        )

    # Global average pooling over spatial dims to get neuron importances
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))  # (2048,)

    # Weight feature maps by pooled gradients
    feature_maps_np = feature_maps[0].numpy()          # (7, 7, 2048)
    pooled_grads_np = pooled_grads.numpy()              # (2048,)
    weighted = feature_maps_np * pooled_grads_np        # (7, 7, 2048)

    # Sum across channels → (7, 7)
    heatmap = np.sum(weighted, axis=-1)

    # Apply ReLU (keep only positive influences)
    heatmap = np.maximum(heatmap, 0)

    # Normalise to [0, 1]
    max_val = heatmap.max()
    if max_val > 0:
        heatmap /= max_val

    return heatmap.astype(np.float32)


def _heatmap_to_colormap(heatmap: np.ndarray, target_size: Tuple[int, int]) -> np.ndarray:
    """
    Resize heatmap and apply JET colormap.

    Parameters
    ----------
    heatmap : (H_small, W_small) float32 in [0, 1]
    target_size : (width, height) of the output image

    Returns
    -------
    coloured : (target_height, target_width, 3) uint8 RGB
    """
    w, h = target_size
    heatmap_uint8 = np.uint8(255 * heatmap)
    heatmap_resized = cv2.resize(heatmap_uint8, (w, h), interpolation=cv2.INTER_LINEAR)
    coloured_bgr = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
    coloured_rgb = cv2.cvtColor(coloured_bgr, cv2.COLOR_BGR2RGB)
    return coloured_rgb


def _overlay_heatmap(
    original_rgb: np.ndarray,
    coloured_heatmap: np.ndarray,
    alpha: float = 0.4,
) -> np.ndarray:
    """
    Blend heatmap onto the original image.

    Parameters
    ----------
    original_rgb : (H, W, 3) uint8
    coloured_heatmap : (H, W, 3) uint8
    alpha : weight of the heatmap (original weight = 1 - alpha)

    Returns
    -------
    overlay : (H, W, 3) uint8 RGB
    """
    overlay = cv2.addWeighted(
        coloured_heatmap.astype(np.uint8), alpha,
        original_rgb.astype(np.uint8), 1 - alpha,
        0,
    )
    return overlay


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

# Cache the split models after the first call (avoid rebuilding each request)
_feature_model: Optional[keras.Model] = None
_classifier_model: Optional[keras.Model] = None


def generate_gradcam(
    full_model: keras.Model,
    preprocessed_batch: np.ndarray,
    original_rgb: np.ndarray,
    class_index: int,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Generate Grad-CAM visualisations for a given class index.

    Parameters
    ----------
    full_model : keras.Model
        The loaded trained model (not modified).
    preprocessed_batch : np.ndarray
        Shape (1, 224, 224, 3), result of preprocessing.preprocess_image().
    original_rgb : np.ndarray
        Shape (224, 224, 3) uint8, used for overlay generation.
    class_index : int
        Index of the target class (0–3).

    Returns
    -------
    original_rgb : np.ndarray
        (224, 224, 3) uint8 – unchanged original image.
    heatmap_rgb : np.ndarray
        (224, 224, 3) uint8 – coloured Grad-CAM heatmap.
    overlay_rgb : np.ndarray
        (224, 224, 3) uint8 – heatmap blended onto original image.
    """
    global _feature_model, _classifier_model

    # Build sub-models once and cache them
    if _feature_model is None or _classifier_model is None:
        logger.info("Building Grad-CAM sub-models (first call).")
        _feature_model, _classifier_model = _build_gradcam_model(full_model)

    # Compute raw heatmap
    heatmap = _compute_gradcam(
        _feature_model, _classifier_model, preprocessed_batch, class_index
    )

    # Convert to coloured image sized to match the original
    h, w = original_rgb.shape[:2]
    heatmap_rgb = _heatmap_to_colormap(heatmap, target_size=(w, h))

    # Blend onto original
    overlay_rgb = _overlay_heatmap(original_rgb, heatmap_rgb)

    return original_rgb, heatmap_rgb, overlay_rgb
