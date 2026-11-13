"""
Tests for the health and root endpoints.
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def client():
    """Provide a TestClient with model loading mocked out."""
    with patch("model.load_model_artifacts") as mock_load, \
         patch("model.loaded_model") as mock_model, \
         patch("model.class_names", ["adenocarcinoma", "large.cell.carcinoma", "normal", "squamous.cell.carcinoma"]):
        mock_load.return_value = None
        mock_model.__class__ = MagicMock  # not None
        from main import app
        yield TestClient(app)


def test_root_returns_200(client):
    response = client.get("/")
    assert response.status_code == 200


def test_root_contains_app_name(client):
    data = client.get("/").json()
    assert "app_name" in data
    assert len(data["app_name"]) > 0


def test_root_contains_disclaimer(client):
    data = client.get("/").json()
    assert "disclaimer" in data
    assert "experimental" in data["disclaimer"].lower()


def test_root_status_running(client):
    data = client.get("/").json()
    assert data["status"] == "running"


def test_health_returns_200(client):
    response = client.get("/health")
    assert response.status_code == 200


def test_health_schema(client):
    data = client.get("/health").json()
    assert "status" in data
    assert "model_loaded" in data
    assert "num_classes" in data
    assert "model_path" in data


def test_docs_accessible(client):
    """Swagger UI should be reachable."""
    response = client.get("/docs")
    assert response.status_code == 200
