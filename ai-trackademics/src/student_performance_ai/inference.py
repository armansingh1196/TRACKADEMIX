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
    """Predict a single student's performance band deterministically."""
    from .config import BASE_SUBJECTS
    
    total_active_subjects = 0
    failed_subjects = 0
    
    for sub in BASE_SUBJECTS:
        safe_name = sub.lower().replace(" ", "_")
        internal = student_data.get(f"{safe_name}_internal", -1.0)
        external = student_data.get(f"{safe_name}_external", -1.0)
        
        # Only evaluate subjects that the student is actually taking (>= 0.0)
        if internal >= 0.0 and external >= 0.0:
            total_active_subjects += 1
            total_marks = internal + external
            
            is_practical = "LAB" in sub.upper()
            max_marks = 50 if is_practical else 100
            percentage = (total_marks / max_marks) * 100
            
            if percentage < 40:
                failed_subjects += 1

    attendance = student_data.get("attendance_rate", 100.0)
    
    # Deterministic Rules (User requested simple, dynamic standards)
    if total_active_subjects > 0 and failed_subjects == 0 and attendance >= 75:
        predicted_band = "High"  # On Track
    elif failed_subjects > 1 or attendance < 60:
        predicted_band = "Low"   # At Risk
    else:
        predicted_band = "Medium" # Needs Effort

    predicted_risk = "Yes" if predicted_band == "Low" else "No"

    # Evaluate recommendations
    student_frame = pd.DataFrame([{column: student_data.get(column, 0.0) for column in FEATURE_COLUMNS}])
    enriched_row = student_frame.iloc[0].copy()
    recommendations = build_recommendations(enriched_row)

    if predicted_band == "High" and not recommendations:
        recommendations.append("Excellent academic and attendance record. You are completely on track! 🚀")

    return {
        "predicted_band": predicted_band,
        "predicted_risk": predicted_risk,
        "confidence": 1.0,
        "class_probabilities": {
            "High": 1.0 if predicted_band=="High" else 0.0, 
            "Medium": 1.0 if predicted_band=="Medium" else 0.0, 
            "Low": 1.0 if predicted_band=="Low" else 0.0
        },
        "recommendations": recommendations,
    }
