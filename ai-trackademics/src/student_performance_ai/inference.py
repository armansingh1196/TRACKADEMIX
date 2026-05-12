"""Reusable inference helpers for single-student predictions."""

from __future__ import annotations

from typing import Any

import joblib
import pandas as pd

from .config import FEATURE_COLUMNS, MODEL_PATH
from .recommendations import build_recommendations


def load_model():
    """Load the trained pipeline from disk."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found at {MODEL_PATH}. Run `python -m src.student_performance_ai.training` first."
        )
    return joblib.load(MODEL_PATH)


def predict_student(student_data: dict[str, Any]) -> dict[str, Any]:
    """Predict a single student's performance band and recommendation summary."""
    model = load_model()
    student_frame = pd.DataFrame([{column: student_data[column] for column in FEATURE_COLUMNS}])

    predicted_band = model.predict(student_frame)[0]
    probabilities = model.predict_proba(student_frame)[0]
    class_probabilities = {
        label: float(probability)
        for label, probability in zip(model.classes_, probabilities, strict=False)
    }
    confidence = max(class_probabilities.values())
    predicted_risk = "Yes" if predicted_band == "Low" else "No"

    enriched_row = student_frame.iloc[0].copy()
    recommendations = build_recommendations(enriched_row)

    return {
        "predicted_band": predicted_band,
        "predicted_risk": predicted_risk,
        "confidence": confidence,
        "class_probabilities": class_probabilities,
        "recommendations": recommendations,
    }
