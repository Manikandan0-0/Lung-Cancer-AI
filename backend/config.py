"""
Application configuration loaded from environment variables and defaults.

All tuneable settings live here. Other modules import from this file only.
"""

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Base paths
# ---------------------------------------------------------------------------
BASE_DIR: Path = Path(__file__).resolve().parent
MODELS_DIR: Path = BASE_DIR / "models"

# ---------------------------------------------------------------------------
# Model artefacts
# ---------------------------------------------------------------------------
MODEL_PATH: Path = MODELS_DIR / "lung_cancer_resnet50.keras"
CLASS_MAPPING_PATH: Path = MODELS_DIR / "class_mapping.json"
PREPROCESSING_CONFIG_PATH: Path = MODELS_DIR / "preprocessing_config.json"

# ---------------------------------------------------------------------------
# Application metadata
# ---------------------------------------------------------------------------
APP_NAME: str = "Lung Cancer Detection with Explainable AI"
APP_VERSION: str = "1.0.0"
APP_DESCRIPTION: str = (
    "Research-grade FastAPI backend for CT scan classification using a "
    "ResNet50 transfer-learning model and Grad-CAM visualisation."
)

# ---------------------------------------------------------------------------
# CORS – allow the React / Vite frontend on common dev ports
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS: list[str] = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173",
).split(",")

# ---------------------------------------------------------------------------
# Upload limits
# ---------------------------------------------------------------------------
MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
MAX_UPLOAD_SIZE_BYTES: int = MAX_UPLOAD_SIZE_MB * 1024 * 1024
ALLOWED_MIME_TYPES: frozenset[str] = frozenset({"image/jpeg", "image/png", "image/jpg"})
ALLOWED_EXTENSIONS: frozenset[str] = frozenset({".jpg", ".jpeg", ".png"})

# ---------------------------------------------------------------------------
# Model constants (must match training configuration)
# ---------------------------------------------------------------------------
INPUT_HEIGHT: int = 224
INPUT_WIDTH: int = 224
INPUT_CHANNELS: int = 3
NUM_CLASSES: int = 4
EXPECTED_INPUT_SHAPE: tuple[int, int, int] = (INPUT_HEIGHT, INPUT_WIDTH, INPUT_CHANNELS)

# ---------------------------------------------------------------------------
# Uvicorn server defaults (used by main startup block only)
# ---------------------------------------------------------------------------
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))
RELOAD: bool = os.getenv("RELOAD", "false").lower() == "true"

# ---------------------------------------------------------------------------
# Medical disclaimer (included in relevant API responses)
# ---------------------------------------------------------------------------
MEDICAL_DISCLAIMER: str = (
    "This application is an experimental AI research prototype. Its predictions "
    "and Grad-CAM visualisations are not medical diagnoses. Results must not be "
    "used to make clinical decisions. Interpretation by a qualified medical "
    "professional is required."
)
