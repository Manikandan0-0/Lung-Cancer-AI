"""
Pydantic response and request schemas for all FastAPI endpoints.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from config import MEDICAL_DISCLAIMER


# ---------------------------------------------------------------------------
# Shared / base schemas
# ---------------------------------------------------------------------------

class ProbabilitiesSchema(BaseModel):
    """Per-class probability percentages rounded to two decimal places."""

    adenocarcinoma: float = Field(..., ge=0.0, le=100.0)
    large_cell_carcinoma: float = Field(..., alias="large.cell.carcinoma", ge=0.0, le=100.0)
    normal: float = Field(..., ge=0.0, le=100.0)
    squamous_cell_carcinoma: float = Field(..., alias="squamous.cell.carcinoma", ge=0.0, le=100.0)

    model_config = {"populate_by_name": True}


# ---------------------------------------------------------------------------
# Root endpoint
# ---------------------------------------------------------------------------

class RootResponse(BaseModel):
    app_name: str
    status: str
    version: str
    disclaimer: str = MEDICAL_DISCLAIMER


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    num_classes: int
    model_path: str
    disclaimer: str = MEDICAL_DISCLAIMER


# ---------------------------------------------------------------------------
# Prediction endpoint
# ---------------------------------------------------------------------------

class PredictionResponse(BaseModel):
    predicted_class: str
    probabilities: dict[str, float]
    processing_status: str = "success"
    disclaimer: str = MEDICAL_DISCLAIMER


# ---------------------------------------------------------------------------
# Explain endpoint
# ---------------------------------------------------------------------------

class ExplainResponse(BaseModel):
    predicted_class: str
    probabilities: dict[str, float]
    target_class: str
    original_image_b64: str = Field(..., description="Base64-encoded original image (PNG)")
    gradcam_heatmap_b64: str = Field(..., description="Base64-encoded Grad-CAM heatmap (PNG)")
    gradcam_overlay_b64: str = Field(..., description="Base64-encoded Grad-CAM overlay on original (PNG)")
    processing_status: str = "success"
    disclaimer: str = MEDICAL_DISCLAIMER
    gradcam_note: str = (
        "Grad-CAM highlights image regions that most influenced the model prediction. "
        "It does not provide confirmed tumour localisation or pathological segmentation."
    )


# ---------------------------------------------------------------------------
# Error schema
# ---------------------------------------------------------------------------

class ErrorResponse(BaseModel):
    detail: str
    status_code: int
