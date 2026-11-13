"""
Tests for the /explain endpoint (Grad-CAM generation).
"""

import base64
import io
from unittest.mock import MagicMock, patch

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image


def _make_png_bytes(size: int = 224) -> bytes:
    img = Image.fromarray(
        np.random.randint(0, 255, (size, size, 3), dtype=np.uint8), "RGB"
    )
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


FAKE_CLASS_NAMES = [
    "adenocarcinoma",
    "large.cell.carcinoma",
    "normal",
    "squamous.cell.carcinoma",
]
FAKE_PROBS = np.array([[0.8701, 0.0080, 0.0237, 0.0982]], dtype=np.float32)

# Fake Grad-CAM output: three identical 224×224 RGB images
_FAKE_IMG = np.zeros((224, 224, 3), dtype=np.uint8)


@pytest.fixture(scope="module")
def client():
    with patch("model.load_model_artifacts"), \
         patch("model.preprocessing_config", {"preprocessing_function": "tensorflow.keras.applications.resnet50.preprocess_input"}), \
         patch("model.class_names", FAKE_CLASS_NAMES):

        mock_keras_model = MagicMock()
        mock_keras_model.predict.return_value = FAKE_PROBS

        with patch("model.loaded_model", mock_keras_model), \
             patch(
                 "services.image_service.build_explain_images",
                 return_value=(
                     "FAKEBASE64original",
                     "FAKEBASE64heatmap",
                     "FAKEBASE64overlay",
                 ),
             ):
            from main import app
            yield TestClient(app)


def test_explain_valid_image_returns_200(client):
    png = _make_png_bytes()
    response = client.post(
        "/explain",
        files={"file": ("ct.png", io.BytesIO(png), "image/png")},
    )
    assert response.status_code == 200


def test_explain_response_schema(client):
    png = _make_png_bytes()
    data = client.post(
        "/explain",
        files={"file": ("ct.png", io.BytesIO(png), "image/png")},
    ).json()
    for key in (
        "predicted_class",
        "probabilities",
        "target_class",
        "original_image_b64",
        "gradcam_heatmap_b64",
        "gradcam_overlay_b64",
        "disclaimer",
        "gradcam_note",
    ):
        assert key in data, f"Missing key '{key}' in /explain response"


def test_explain_uses_predicted_class_when_no_target(client):
    png = _make_png_bytes()
    data = client.post(
        "/explain",
        files={"file": ("ct.png", io.BytesIO(png), "image/png")},
    ).json()
    # Without target_class, target_class must equal predicted_class
    assert data["target_class"] == data["predicted_class"]


def test_explain_accepts_valid_target_class(client):
    png = _make_png_bytes()
    response = client.post(
        "/explain",
        files={"file": ("ct.png", io.BytesIO(png), "image/png")},
        data={"target_class": "normal"},
    )
    assert response.status_code == 200
    assert response.json()["target_class"] == "normal"


def test_explain_rejects_invalid_target_class(client):
    png = _make_png_bytes()
    response = client.post(
        "/explain",
        files={"file": ("ct.png", io.BytesIO(png), "image/png")},
        data={"target_class": "unknown_class_xyz"},
    )
    assert response.status_code == 422


def test_explain_disclaimer_present(client):
    png = _make_png_bytes()
    data = client.post(
        "/explain",
        files={"file": ("ct.png", io.BytesIO(png), "image/png")},
    ).json()
    assert "experimental" in data["disclaimer"].lower()
    assert "tumour" in data["gradcam_note"].lower() or "localisation" in data["gradcam_note"].lower()


def test_explain_rejects_empty_upload(client):
    response = client.post(
        "/explain",
        files={"file": ("empty.png", io.BytesIO(b""), "image/png")},
    )
    assert response.status_code == 422
