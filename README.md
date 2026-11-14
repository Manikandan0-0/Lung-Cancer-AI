# Lung Cancer Detection with Explainable AI 

> **Medical Disclaimer:** This application is an experimental AI research prototype. Its predictions and Grad-CAM visualisations are **not** medical diagnoses. Results must not be used to make clinical decisions. Interpretation by a qualified medical professional is required.

---

## Overview

Production-style FastAPI backend for CT-scan lung cancer classification using a trained ResNet50 transfer-learning model with Grad-CAM explainability.

| Property | Value |
|---|---|
| Model | ResNet50 (transfer learning, frozen backbone) |
| Input | 224 × 224 × 3 RGB |
| Classes | adenocarcinoma · large.cell.carcinoma · normal · squamous.cell.carcinoma |
| Test accuracy | ≈ 79.68 % |
| Preprocessing | `tensorflow.keras.applications.resnet50.preprocess_input` (channel-wise mean subtraction; **not** ÷255) |

---

## Project Structure

```
backend/
├── main.py                  # FastAPI app, endpoints
├── model.py                 # Model loading & validation
├── preprocessing.py         # Image preprocessing
├── gradcam.py               # Grad-CAM implementation
├── schemas.py               # Pydantic response schemas
├── config.py                # All configuration constants
├── requirements.txt
├── .env.example
│
├── models/
│   ├── lung_cancer_resnet50.keras   # Trained model (do not overwrite)
│   ├── class_mapping.json
│   └── preprocessing_config.json
│
├── services/
│   ├── prediction_service.py
│   └── image_service.py
│
├── utils/
│   └── image_utils.py
│
└── tests/
    ├── conftest.py
    ├── test_health.py
    ├── test_prediction.py
    └── test_gradcam.py
```

---

## Prerequisites

- Python 3.10 – 3.12
- All packages in `requirements.txt`

The packages most relevant to the existing environment are pre-installed:

| Package | Version (confirmed) |
|---|---|
| tensorflow | 2.22.0rc0 |
| keras-nightly | 3.16.0 dev |
| fastapi | 0.135.2 |
| numpy | 2.3.5 |
| pillow | 12.0.0 |
| opencv-python | 4.13.0.92 |

---

## Setup & Installation

```bash
# 1. Navigate to the backend directory
cd "Lung Cancer AI/backend"

# 2. (Optional) Create a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy and configure environment variables
copy .env.example .env
# Edit .env as needed
```

---

## Starting the Server

```bash
# From the backend/ directory
python main.py
```

Or via uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server starts on **http://localhost:8000**.

---

## API Documentation

| URL | Description |
|---|---|
| http://localhost:8000/docs | Swagger UI (interactive) |
| http://localhost:8000/redoc | ReDoc documentation |

---

## API Endpoints

### `GET /`
Returns application name, status, and version.

### `GET /health`
Returns model loading status and number of output classes.

### `POST /predict`
Upload a lung CT scan image → returns predicted class + all four probabilities.

**Request:** `multipart/form-data`
- `file`: JPEG or PNG image (max 10 MB)

**Response example:**
```json
{
  "predicted_class": "adenocarcinoma",
  "probabilities": {
    "adenocarcinoma": 87.01,
    "large.cell.carcinoma": 0.80,
    "normal": 2.37,
    "squamous.cell.carcinoma": 9.82
  },
  "processing_status": "success",
  "disclaimer": "..."
}
```

### `POST /explain`
Upload a CT scan → prediction + three Base64-encoded PNG images.

**Request:** `multipart/form-data`
- `file`: JPEG or PNG image (max 10 MB)
- `target_class` *(optional)*: class name for Grad-CAM. Defaults to predicted class.

**Response includes:**
- `original_image_b64` – original CT scan
- `gradcam_heatmap_b64` – Grad-CAM heatmap only
- `gradcam_overlay_b64` – heatmap blended onto original image

---

## Running Tests

```bash
# From the backend/ directory
pytest tests/ -v
```

Expected test coverage:
- Root and health endpoints
- Valid image prediction (mocked model)
- Probability range and sum validation
- Invalid file type, empty upload, corrupt image rejection
- Grad-CAM response schema
- Target class selection and rejection of invalid classes

---

## Frontend Integration (React + Vite + Tailwind CSS)

Configure your Vite proxy or use the CORS origins in `.env`:

```js
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

Decode Base64 images in the browser:
```js
<img src={`data:image/png;base64,${response.original_image_b64}`} />
```

---

## Security Notes

- Uploaded images are processed in memory and never persisted to disk.
- No patient information is logged.
- File type, extension, and size are validated before processing.
- CORS is restricted to configured origins.
- Model weights are never modified at runtime.

---

## Known Architecture Details (Grad-CAM)

The saved model contains a nested structure:

```
functional (outer)
  └── functional (ResNet50 backbone)  → output: (None, 7, 7, 2048)
  └── BatchNormalization
  └── GlobalAveragePooling2D / pooling
  └── Dropout
  └── Flatten
  └── dense_3  → output: (None, 4)
```

The Grad-CAM implementation avoids Keras 3 connectivity errors by splitting the model into two separate `tf.keras.Model` objects (feature extractor + classifier head) and using `tf.GradientTape` to compute gradients between them.

---

## Streamlit Cloud Deployment

A dedicated standalone Streamlit web application is available in `app.py`.

### 1. Run Locally
```bash
python -m streamlit run app.py
```
Open [http://localhost:8501](http://localhost:8501) in your browser.

### 2. Deploy to Streamlit Community Cloud
1. Go to [share.streamlit.io](https://share.streamlit.io/) and sign in with GitHub.
2. Click **Create app**.
3. Select your repository: `Manikandan0-0/Lung-Cancer-AI`.
4. Main file path: `app.py`.
5. *(Optional for weights)*: In **Advanced settings > Secrets**, add:
   ```toml
   MODEL_URL = "https://your-public-model-link/lung_cancer_resnet50.keras"
   ```
   Or attach `lung_cancer_resnet50.keras` as a [GitHub Release](https://github.com/Manikandan0-0/Lung-Cancer-AI/releases) asset.
6. Click **Deploy!**




