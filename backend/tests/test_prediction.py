"""
Tests for the /predict endpoint.
"""

import io
from unittest.mock import MagicMock, patch

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image


def _make_png_bytes(width: int = 224, height: int = 224) -> bytes:
    """Create a minimal valid RGB PNG in memory."""
    img = Image.fromarray(
        np.random.randint(0, 255, (height, width, 3), dtype=np.uint8), "RGB"
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


@pytest.fixture(scope="module")
def client():
    with patch("model.load_model_artifacts"), \
         patch("model.preprocessing_config", {"preprocessing_function": "tensorflow.keras.applications.resnet50.preprocess_input"}), \
         patch("model.class_names", FAKE_CLASS_NAMES):

        mock_keras_model = MagicMock()
        mock_keras_model.predict.return_value = FAKE_PROBS

        with patch("model.loaded_model", mock_keras_model):
            from main import app
            yield TestClient(app)


def test_predict_valid_png(client):
    png = _make_png_bytes()
    response = client.post(
        "/predict",
        files={"file": ("ct_scan.png", io.BytesIO(png), "image/png")},
    )
    assert response.status_code == 200


def test_predict_response_schema(client):
    png = _make_png_bytes()
    data = client.post(
        "/predict",
        files={"file": ("ct_scan.png", io.BytesIO(png), "image/png")},
    ).json()
    assert "predicted_class" in data
    assert "probabilities" in data
    assert "disclaimer" in data
    assert "processing_status" in data


def test_predict_probabilities_sum_to_100(client):
    png = _make_png_bytes()
    probs = client.post(
        "/predict",
        files={"file": ("ct_scan.png", io.BytesIO(png), "image/png")},
    ).json()["probabilities"]
    total = sum(probs.values())
    assert abs(total - 100.0) < 0.5, f"Probabilities sum to {total}, expected ~100"


def test_predict_probabilities_as_percentages(client):
    png = _make_png_bytes()
    probs = client.post(
        "/predict",
        files={"file": ("ct_scan.png", io.BytesIO(png), "image/png")},
    ).json()["probabilities"]
    for name, val in probs.items():
        assert 0.0 <= val <= 100.0, f"Probability for '{name}' out of range: {val}"


def test_predict_all_four_classes_present(client):
    png = _make_png_bytes()
    probs = client.post(
        "/predict",
        files={"file": ("ct_scan.png", io.BytesIO(png), "image/png")},
    ).json()["probabilities"]
    for cls in FAKE_CLASS_NAMES:
        assert cls in probs, f"Class '{cls}' missing from probabilities"


def test_predict_rejects_non_image(client):
    response = client.post(
        "/predict",
        files={"file": ("report.pdf", io.BytesIO(b"fake pdf content"), "application/pdf")},
    )
    assert response.status_code in (422, 415)


def test_predict_rejects_empty_file(client):
    response = client.post(
        "/predict",
        files={"file": ("empty.png", io.BytesIO(b""), "image/png")},
    )
    assert response.status_code == 422


def test_predict_rejects_corrupt_image(client):
    response = client.post(
        "/predict",
        files={"file": ("corrupt.png", io.BytesIO(b"not_an_image_xyz"), "image/png")},
    )
    assert response.status_code == 422
