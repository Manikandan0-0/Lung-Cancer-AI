"""
PulmoVision AI - Streamlit Web Application
Lung CT Scan Classification & Grad-CAM Explainable AI Platform
Powered by ResNet50 Transfer Learning
"""

import os
import io
import time
import json
import urllib.request
from pathlib import Path

# Suppress TensorFlow verbose logging
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import streamlit as st
import numpy as np
from PIL import Image
import cv2
import requests
import tensorflow as tf
import keras
from keras.applications.resnet50 import preprocess_input as resnet50_preprocess_input

# ---------------------------------------------------------
# Page Configuration & Styling
# ---------------------------------------------------------
st.set_page_config(
    page_title="PulmoVision AI - Lung CT Diagnostic Platform",
    page_icon="🫁",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
    <style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 800;
        color: #E0FBFC;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1rem;
        color: #9DB4C0;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #1e293b;
        border-radius: 12px;
        padding: 1.2rem;
        border: 1px solid #334155;
    }
    .disclaimer-box {
        background-color: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.4);
        border-radius: 10px;
        padding: 0.8rem 1rem;
        color: #fcd34d;
        font-size: 0.85rem;
        margin-bottom: 1.5rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------
# Constants & Class Mapping
# ---------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent

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

CLASS_DESCRIPTIONS = {
    "Adenocarcinoma": "Most common type of lung cancer, usually originating in the outer peripheral areas of the lung mucus-secreting cells.",
    "Large Cell Carcinoma": "Fast-growing lung cancer with large, abnormal-looking cells that can appear in any part of the lung.",
    "Normal": "Healthy lung CT slice with clear parenchyma and no evidence of malignant nodular lesions.",
    "Squamous Cell Carcinoma": "Often arises near the central chest airways (bronchi) and strongly linked with tobacco smoke exposure.",
}

# Load class mapping if present
mapping_candidates = [
    BASE_DIR / "backend" / "models" / "class_mapping.json",
    BASE_DIR / "backend" / "class_mapping.json",
    BASE_DIR / "class_mapping.json",
]
for p in mapping_candidates:
    if p.exists():
        try:
            with open(p, "r") as f:
                raw_map = json.load(f)
                CLASS_MAP = {int(v): k for k, v in raw_map.items()}
                break
        except Exception:
            pass

# ---------------------------------------------------------
# Helper: Download Model File with Progress
# ---------------------------------------------------------
def download_model_from_url(url: str, dest_path: Path):
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = dest_path.with_suffix(".tmp")
    response = requests.get(url, stream=True, timeout=180)
    response.raise_for_status()
    total_size = int(response.headers.get("content-length", 0))
    downloaded = 0
    pbar = st.progress(0, text="Downloading ResNet50 neural weights...")
    with open(temp_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    pct = min(1.0, downloaded / total_size)
                    pbar.progress(
                        pct,
                        text=f"Downloading weights: {downloaded / (1024*1024):.1f} MB / {total_size / (1024*1024):.1f} MB ({pct*100:.0f}%)",
                    )
    pbar.empty()
    temp_path.replace(dest_path)

# ---------------------------------------------------------
# Model Resolver & Cached Loader
# ---------------------------------------------------------
def get_resolved_model_path() -> Path | None:
    candidates = [
        BASE_DIR / "backend" / "models" / "lung_cancer_resnet50.keras",
        BASE_DIR / "backend" / "models" / "ct_resnet_best_model.keras",
        BASE_DIR / "lung_cancer_resnet50.keras",
        Path("C:/Users/suven/lung_cancer_resnet50.keras"),
        Path("C:/Users/suven/ct_resnet_best_model.keras"),
    ]
    for c in candidates:
        if c.exists() and c.stat().st_size > 10 * 1024 * 1024:
            return c

    # Check Streamlit secrets or OS env
    cloud_url = None
    try:
        if "MODEL_URL" in st.secrets:
            cloud_url = st.secrets["MODEL_URL"]
    except Exception:
        pass
    if not cloud_url:
        cloud_url = os.environ.get("MODEL_URL", None)

    if cloud_url:
        target = BASE_DIR / "backend" / "models" / "lung_cancer_resnet50.keras"
        try:
            download_model_from_url(cloud_url, target)
            if target.exists() and target.stat().st_size > 10 * 1024 * 1024:
                return target
        except Exception as e:
            st.error(f"Failed to auto-download model from MODEL_URL: {e}")

    return None

model_path = get_resolved_model_path()

if model_path is None:
    st.error("### ⚠️ Model Weights File Not Found")
    st.markdown(
        """
        The ResNet50 neural network weights (`lung_cancer_resnet50.keras`, ~314 MB) are not present in this deployment.
        
        Because GitHub has a 100 MB per-file limit, heavy weights are hosted externally or uploaded directly.
        """
    )
    col_dl1, col_dl2 = st.columns(2)
    with col_dl1:
        st.subheader("Option 1: Direct Download URL")
        url_input = st.text_input(
            "Enter public direct download URL (GitHub Release asset, Hugging Face, or Cloud link):",
            placeholder="https://github.com/.../lung_cancer_resnet50.keras",
        )
        if st.button("Download and Initialize Model", type="primary"):
            if url_input:
                try:
                    target_dest = BASE_DIR / "backend" / "models" / "lung_cancer_resnet50.keras"
                    download_model_from_url(url_input.strip(), target_dest)
                    st.success("Model weights downloaded successfully! Reloading...")
                    time.sleep(1)
                    st.rerun()
                except Exception as ex:
                    st.error(f"Download failed: {ex}")
            else:
                st.warning("Please provide a valid URL.")

    with col_dl2:
        st.subheader("Option 2: Direct File Upload")
        uploaded_weights = st.file_uploader(
            "Upload `lung_cancer_resnet50.keras` from local disk:",
            type=["keras", "h5"],
        )
        if uploaded_weights is not None:
            target_dest = BASE_DIR / "backend" / "models" / "lung_cancer_resnet50.keras"
            target_dest.parent.mkdir(parents=True, exist_ok=True)
            with open(target_dest, "wb") as f:
                f.write(uploaded_weights.getbuffer())
            st.success("Uploaded successfully! Reloading...")
            time.sleep(1)
            st.rerun()

    st.stop()

@st.cache_resource(show_spinner="Loading ResNet50 neural network weights...")
def load_model_and_backbone(path_str: str):
    loaded_model = keras.models.load_model(path_str, compile=False)
    
    # Separate functional backbone from top layers for Grad-CAM
    if hasattr(loaded_model, "layers") and len(loaded_model.layers) > 0:
        bb = loaded_model.layers[0]
        top = loaded_model.layers[1:]
    else:
        bb = loaded_model
        top = []

    return loaded_model, bb, top

model, backbone, top_layers = load_model_and_backbone(str(model_path))

# ---------------------------------------------------------
# Image Preprocessing & Grad-CAM Logic
# ---------------------------------------------------------
def preprocess_ct_image(pil_img: Image.Image) -> tuple[np.ndarray, Image.Image]:
    """Converts image to RGB, resizes to 224x224, and applies ResNet50 preprocessing."""
    rgb_img = pil_img.convert("RGB")
    resized_pil = rgb_img.resize((224, 224))
    img_array = np.array(resized_pil, dtype=np.float32)
    img_array = resnet50_preprocess_input(img_array)
    tensor = np.expand_dims(img_array, axis=0)
    return tensor, rgb_img

def compute_gradcam(img_tensor: np.ndarray, original_pil: Image.Image, target_class_idx: int):
    """Generates Grad-CAM heatmap and blended overlay."""
    with tf.GradientTape() as tape:
        conv_outputs = backbone(img_tensor, training=False)
        tape.watch(conv_outputs)

        x = conv_outputs
        for layer in top_layers:
            x = layer(x, training=False)

        preds = x
        target_score = preds[:, target_class_idx]

    grads = tape.gradient(target_score, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs_val = conv_outputs[0].numpy()
    pooled_grads_val = pooled_grads.numpy()

    for i in range(pooled_grads_val.shape[-1]):
        conv_outputs_val[:, :, i] *= pooled_grads_val[i]

    heatmap = np.mean(conv_outputs_val, axis=-1)
    heatmap = np.maximum(heatmap, 0)

    max_val = np.max(heatmap)
    if max_val > 0:
        heatmap /= max_val
    else:
        heatmap = np.zeros_like(heatmap)

    orig_width, orig_height = original_pil.size
    heatmap_resized = cv2.resize(heatmap, (orig_width, orig_height))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)

    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_colored_rgb = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    orig_np = np.array(original_pil)
    overlay_np = cv2.addWeighted(orig_np, 0.65, heatmap_colored_rgb, 0.35, 0)

    return Image.fromarray(heatmap_colored_rgb), Image.fromarray(overlay_np)

# ---------------------------------------------------------
# Sidebar
# ---------------------------------------------------------
with st.sidebar:
    st.image(
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80",
        caption="PulmoVision AI Diagnostic Engine",
        use_container_width=True,
    )
    st.markdown("### ⚙️ Engine Specifications")
    st.markdown(
        """
        - **Architecture:** ResNet50 Deep Residual Network
        - **Input Resolution:** 224 × 224 px (RGB)
        - **Explainability:** Grad-CAM (Stage-5 Feature Maps)
        - **Target Classes:** 4 Diagnostic Categories
        - **Model Weights:** ResNet50 Transfer Learning (.keras)
        - **Mode:** Clinical Research Prototype
        """
    )
    st.markdown("---")
    st.markdown("### 📋 Supported Pathologies")
    for k, name in CLASS_DISPLAY.items():
        st.markdown(f"- **{name}**")
    
    st.markdown("---")
    st.caption("PulmoVision AI • Research & Educational Platform")

# ---------------------------------------------------------
# Main Page Header & Disclaimer
# ---------------------------------------------------------
st.markdown('<div class="main-header">🫁 PulmoVision AI</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-header">Explainable Lung CT Scan Diagnostic & Grad-CAM Interpretability Platform</div>',
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="disclaimer-box">
        ⚠️ <strong>Clinical Research Disclaimer:</strong> This application is an experimental AI research prototype. 
        Predictions and Grad-CAM visual heatmaps represent algorithmic attention and do not constitute certified medical diagnoses. 
        Always consult a licensed radiologist or healthcare professional for clinical decision-making.
    </div>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------
# Image Upload Section & Sample CT Selector
# ---------------------------------------------------------
uploaded_file = st.file_uploader(
    "Upload Axial Pulmonary CT Slice (PNG, JPG, JPEG):",
    type=["png", "jpg", "jpeg"],
    help="Upload an axial chest CT slice for malignancy classification and Grad-CAM attention localization.",
)

# Sample CT Scans Quick Loader (Repo samples first, fallback to local test dataset)
sample_options = {}

# 1. Bundled demo samples in repository
repo_sample_dir = BASE_DIR / "sample_images"
if repo_sample_dir.exists():
    for f in sorted(repo_sample_dir.glob("*.png")):
        name_clean = f.stem.replace("_", " ").title()
        sample_options[f"Demo: {name_clean}"] = f

# 2. Local test dataset if available on workstation
local_test_dir = Path("C:/Users/suven/data/test")
if local_test_dir.exists():
    for class_folder in sorted(local_test_dir.iterdir()):
        if class_folder.is_dir():
            files = list(class_folder.glob("*.png")) + list(class_folder.glob("*.jpg"))
            if files:
                label = f"Local Dataset: {class_folder.name.replace('.', ' ').title()} ({files[0].name})"
                if label not in sample_options:
                    sample_options[label] = files[0]

selected_sample = None
if sample_options:
    st.markdown("##### Or quickly test with a sample CT scan:")
    col_sample1, col_sample2 = st.columns([3, 1])
    with col_sample1:
        sample_choice = st.selectbox(
            "Select sample:",
            options=["None"] + list(sample_options.keys()),
            label_visibility="collapsed",
        )
        if sample_choice != "None":
            selected_sample = sample_options[sample_choice]

# Resolve active image
active_img = None
active_filename = ""

if uploaded_file is not None:
    try:
        active_img = Image.open(uploaded_file)
        active_filename = uploaded_file.name
    except Exception as e:
        st.error(f"Error opening image: {e}")
elif selected_sample is not None:
    try:
        active_img = Image.open(selected_sample)
        active_filename = selected_sample.name
    except Exception as e:
        st.error(f"Error opening sample image: {e}")

# ---------------------------------------------------------
# Inference & Results
# ---------------------------------------------------------
if active_img is not None:
    st.markdown("---")
    st.subheader("🔍 CT Scan Analysis & Explainability")

    with st.spinner("Processing ResNet50 forward pass and computing Grad-CAM gradients..."):
        start_time = time.perf_counter()
        img_tensor, original_pil = preprocess_ct_image(active_img)

        # Forward pass
        preds = model.predict(img_tensor, verbose=0)[0]
        pred_idx = int(np.argmax(preds))
        confidence = float(preds[pred_idx])
        raw_pred_name = CLASS_MAP.get(pred_idx, f"Class {pred_idx}")
        display_pred_name = CLASS_DISPLAY.get(raw_pred_name, raw_pred_name)

        # Compute Grad-CAM
        heatmap_img, overlay_img = compute_gradcam(img_tensor, original_pil, pred_idx)
        elapsed_ms = round((time.perf_counter() - start_time) * 1000)

    # 1. Top Prediction Banner
    col_pred1, col_pred2 = st.columns([2, 1])
    with col_pred1:
        if display_pred_name == "Normal":
            st.success(f"### Predicted Diagnosis: **{display_pred_name}**")
        else:
            st.error(f"### Predicted Diagnosis: **{display_pred_name}**")
        st.write(f"*{CLASS_DESCRIPTIONS.get(display_pred_name, '')}*")

    with col_pred2:
        st.metric(label="Confidence Score", value=f"{confidence * 100:.2f}%")
        st.caption(f"⏱️ Inference Latency: {elapsed_ms} ms")

    # 2. Probability Breakdown
    st.markdown("#### Probability Distribution")
    prob_cols = st.columns(4)
    for i, p_col in enumerate(prob_cols):
        raw_name = CLASS_MAP.get(i, f"Class {i}")
        disp_name = CLASS_DISPLAY.get(raw_name, raw_name)
        score = float(preds[i])
        with p_col:
            is_winner = (i == pred_idx)
            border_color = "#38bdf8" if is_winner else "#334155"
            st.markdown(
                f"""
                <div style="background-color: #0f172a; padding: 1rem; border-radius: 8px; border: 2px solid {border_color}; text-align: center;">
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">{disp_name}</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: {'#38bdf8' if is_winner else '#f8fafc'};">{score * 100:.1f}%</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown("<br>", unsafe_allow_html=True)

    # 3. Visualizations (Original, Heatmap, Overlay)
    st.markdown("#### 🔬 Grad-CAM Interpretability Triad")
    st.caption("Grad-CAM computes the gradients of the predicted class score with respect to ResNet50 stage-5 convolutional feature maps, pinpointing the anatomical regions that drove the neural network decision.")

    vcol1, vcol2, vcol3 = st.columns(3)
    with vcol1:
        st.image(original_pil, caption=f"Original CT Slice ({active_filename})", use_container_width=True)
    with vcol2:
        st.image(heatmap_img, caption="Grad-CAM Activation Heatmap", use_container_width=True)
    with vcol3:
        st.image(overlay_img, caption="Grad-CAM Diagnostic Overlay", use_container_width=True)

    # 4. Detailed Diagnostic Explanation
    with st.expander("📖 Radiologic & Deep Learning Report"):
        st.markdown(
            f"""
            - **Input File:** `{active_filename}`
            - **Model Classification:** `{display_pred_name}` with **{confidence * 100:.2f}%** confidence.
            - **Attribution Method:** Gradient-weighted Class Activation Mapping (Grad-CAM) applied to final residual bottleneck layer.
            - **Region of Interest:** The warm/red regions in the overlay denote maximal gradient activation where the model detected patterns resembling `{display_pred_name}`.
            """
        )
else:
    st.info("👆 Upload a chest CT scan image above or select a sample image to generate predictions and Grad-CAM interpretability visualizations.")
