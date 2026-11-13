"""
PulmoVision AI - FastAPI Backend for Lung CT Classification & Grad-CAM Explainability
Integrates ResNet50 deep learning model with real-time gradient attribution.
"""

import os
import io
import time
import base64
import json
from pathlib import Path
from typing import Optional, Dict, Any, List

# Suppress TensorFlow verbose logging
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["MPLCONFIGDIR"] = os.path.join(os.path.dirname(__file__), ".mpl_cache")

import numpy as np
from PIL import Image
import cv2
import tensorflow as tf
import keras
from keras.applications.resnet50 import preprocess_input as resnet50_preprocess_input
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(
    title="PulmoVision AI Backend",
    description="ResNet50 Lung Cancer Classification and Grad-CAM Explainability API",
    version="1.0.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard class mapping
CLASS_MAP = {
    0: "adenocarcinoma",
    1: "large.cell.carcinoma",
    2: "normal",
    3: "squamous.cell.carcinoma",
}

CLASS_DISPLAY = {
    "adenocarcinoma": "Adenocarcinoma",
    "large.cell.carcinoma": "Large Cell Carcinoma",
    "normal": "Normal",
    "squamous.cell.carcinoma": "Squamous Cell Carcinoma",
}

# Load class mapping file if present
CLASS_MAPPING_FILE = Path(__file__).parent / "class_mapping.json"
if CLASS_MAPPING_FILE.exists():
    try:
        with open(CLASS_MAPPING_FILE, "r") as f:
            mapping = json.load(f)
            # invert {class_name: idx} to {idx: class_name}
            CLASS_MAP = {int(v): k for k, v in mapping.items()}
    except Exception as e:
        print(f"Warning loading class_mapping.json: {e}")

MODEL_PATHS = [
    Path(__file__).parent / "models" / "lung_cancer_resnet50.keras",
    Path(__file__).parent / "models" / "ct_resnet_best_model.keras",
    Path("C:/Users/suven/lung_cancer_resnet50.keras"),
    Path("C:/Users/suven/ct_resnet_best_model.keras"),
]

model = None
backbone = None
top_layers = []


def load_ai_model():
    global model, backbone, top_layers
    if model is not None:
        return

    chosen_path = None
    for p in MODEL_PATHS:
        if p.exists():
            chosen_path = p
            break

    if not chosen_path:
        raise RuntimeError("No ResNet50 model found in backend/models or parent directory.")

    print(f"Loading ResNet50 model from {chosen_path}...")
    model = keras.models.load_model(str(chosen_path), compile=False)
    print("ResNet50 model loaded successfully!")

    # Separate functional backbone from top dense layers for Grad-CAM
    if hasattr(model, "layers") and len(model.layers) > 0:
        backbone = model.layers[0]  # functional ResNet50 backbone
        top_layers = model.layers[1:]
    else:
        backbone = model
        top_layers = []


# Initialize model on startup
@app.on_event("startup")
async def startup_event():
    try:
        load_ai_model()
    except Exception as e:
        print(f"Error during model loading: {e}")


def preprocess_image(image_bytes: bytes) -> tuple[np.ndarray, Image.Image]:
    """Reads image bytes, converts to RGB, resizes to 224x224, and normalizes."""
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")

    # Resize to model input shape
    resized_pil = pil_img.resize((224, 224))
    img_array = np.array(resized_pil, dtype=np.float32)

    # Use ResNet50 preprocessing (caffe style: zero-centering w.r.t ImageNet dataset without scaling)
    # Do NOT use simple division by 255.0
    img_array = resnet50_preprocess_input(img_array)
    tensor = np.expand_dims(img_array, axis=0)

    return tensor, pil_img


def generate_gradcam_overlay(
    img_tensor: np.ndarray,
    original_pil: Image.Image,
    target_class_idx: int,
) -> tuple[str, str]:
    """
    Computes Grad-CAM heatmap using gradient tape and superimposes it onto the original CT slice.
    Returns: (heatmap_base64_data_uri, overlay_base64_data_uri)
    """
    with tf.GradientTape() as tape:
        conv_outputs = backbone(img_tensor, training=False)
        tape.watch(conv_outputs)

        x = conv_outputs
        for layer in top_layers:
            x = layer(x, training=False)

        preds = x
        target_score = preds[:, target_class_idx]

    # Calculate gradients of target class w.r.t. feature maps
    grads = tape.gradient(target_score, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weight the 2048 feature map channels
    conv_outputs_val = conv_outputs[0].numpy()
    pooled_grads_val = pooled_grads.numpy()

    for i in range(pooled_grads_val.shape[-1]):
        conv_outputs_val[:, :, i] *= pooled_grads_val[i]

    # Average across channels and apply ReLU
    heatmap = np.mean(conv_outputs_val, axis=-1)
    heatmap = np.maximum(heatmap, 0)

    max_val = np.max(heatmap)
    if max_val > 0:
        heatmap /= max_val
    else:
        heatmap = np.zeros_like(heatmap)

    orig_width, orig_height = original_pil.size
    # Resize heatmap to original image dimensions
    heatmap_resized = cv2.resize(heatmap, (orig_width, orig_height))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)

    # Apply JET colormap for high-contrast medical heat map visualization
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_colored_rgb = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    orig_np = np.array(original_pil)
    # Blend original CT slice and heatmap
    overlay_np = cv2.addWeighted(orig_np, 0.65, heatmap_colored_rgb, 0.35, 0)

    # Convert heatmap image to Base64 PNG
    heatmap_pil = Image.fromarray(heatmap_colored_rgb)
    buf_heatmap = io.BytesIO()
    heatmap_pil.save(buf_heatmap, format="PNG")
    heatmap_b64 = "data:image/png;base64," + base64.b64encode(buf_heatmap.getvalue()).decode("utf-8")

    # Convert overlay image to Base64 PNG
    overlay_pil = Image.fromarray(overlay_np)
    buf_overlay = io.BytesIO()
    overlay_pil.save(buf_overlay, format="PNG")
    overlay_b64 = "data:image/png;base64," + base64.b64encode(buf_overlay.getvalue()).decode("utf-8")

    return heatmap_b64, overlay_b64


@app.get("/")
def get_root():
    return {
        "status": "online",
        "service": "PulmoVision AI Inference API",
        "architecture": "ResNet50 Deep Residual Network",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "explain": "/explain",
        },
    }


@app.get("/health")
def get_health():
    is_loaded = model is not None
    supported_classes = [CLASS_DISPLAY.get(CLASS_MAP.get(i, f"Class {i}"), f"Class {i}") for i in range(4)]
    return {
        "status": "healthy" if is_loaded else "model_loading",
        "model": "ResNet50",
        "architecture": "ResNet50 (Keras/TensorFlow)",
        "version": "1.0.0",
        "model_loaded": is_loaded,
        "supported_classes": supported_classes,
        "gpu_available": len(tf.config.list_physical_devices("GPU")) > 0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.post("/predict")
async def predict_scan(file: Optional[UploadFile] = File(None), image: Optional[UploadFile] = File(None)):
    upload = file or image
    if upload is None:
        raise HTTPException(status_code=400, detail="Missing CT image file. Please provide 'file' or 'image' field.")

    load_ai_model()
    start_time = time.perf_counter()

    contents = await upload.read()
    img_tensor, _ = preprocess_image(contents)

    # Model inference
    preds = model.predict(img_tensor, verbose=0)[0]
    pred_idx = int(np.argmax(preds))
    confidence = float(preds[pred_idx])
    raw_class = CLASS_MAP.get(pred_idx, f"class_{pred_idx}")
    display_class = CLASS_DISPLAY.get(raw_class, raw_class)

    elapsed_ms = round((time.perf_counter() - start_time) * 1000)

    # Format probability dictionary with display names
    probabilities = {}
    for i, score in enumerate(preds):
        raw_name = CLASS_MAP.get(i, f"class_{i}")
        disp_name = CLASS_DISPLAY.get(raw_name, raw_name)
        probabilities[disp_name] = round(float(score), 4)

    return {
        "status": "success",
        "predicted_class": display_class,
        "raw_class": raw_class,
        "target_class": display_class,
        "confidence": confidence,
        "probabilities": probabilities,
        "inference_time_ms": elapsed_ms,
    }


@app.post("/explain")
async def explain_scan(file: Optional[UploadFile] = File(None), image: Optional[UploadFile] = File(None)):
    upload = file or image
    if upload is None:
        raise HTTPException(status_code=400, detail="Missing CT image file. Please provide 'file' or 'image' field.")

    load_ai_model()
    start_time = time.perf_counter()

    contents = await upload.read()
    img_tensor, original_pil = preprocess_image(contents)

    # Forward pass
    preds = model.predict(img_tensor, verbose=0)[0]
    pred_idx = int(np.argmax(preds))
    confidence = float(preds[pred_idx])
    raw_class = CLASS_MAP.get(pred_idx, f"class_{pred_idx}")
    display_class = CLASS_DISPLAY.get(raw_class, raw_class)

    # Grad-CAM attribution
    heatmap_b64, overlay_b64 = generate_gradcam_overlay(img_tensor, original_pil, pred_idx)

    elapsed_ms = round((time.perf_counter() - start_time) * 1000)

    probabilities = {}
    for i, score in enumerate(preds):
        raw_name = CLASS_MAP.get(i, f"class_{i}")
        disp_name = CLASS_DISPLAY.get(raw_name, raw_name)
        probabilities[disp_name] = round(float(score), 4)

    return {
        "status": "success",
        "predicted_class": display_class,
        "raw_class": raw_class,
        "target_class": display_class,
        "confidence": confidence,
        "probabilities": probabilities,
        "heatmap_base64": heatmap_b64,
        "overlay_base64": overlay_b64,
        "gradcam_note": "Grad-CAM uses gradient backpropagation from ResNet50 stage-5 bottleneck features to highlight regions influencing the model prediction.",
        "inference_time_ms": elapsed_ms,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
