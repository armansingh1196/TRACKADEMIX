"""Turn analytics and predictions into review-friendly student interventions."""

from __future__ import annotations

from typing import List

import pandas as pd
from .config import BASE_SUBJECTS

def build_recommendations(student_row: pd.Series) -> List[str]:
    recommendations: List[str] = []
    
    # Early Warning Trends
    att_trend = float(student_row.get("attendance_trend", 0))
    if att_trend <= -10:
        recommendations.append(f"CRITICAL: Attendance dropped by {abs(att_trend):.1f}% recently.")
    
    marks_trend = float(student_row.get("marks_trend", 0))
    if marks_trend <= -15:
        recommendations.append(f"CRITICAL: Marks declined significantly ({marks_trend:.1f}%).")

    if float(student_row.get("attendance_rate", 100)) < 60:
        recommendations.append("Overall Attendance Alert: Schedule mentoring.")
    
    if float(student_row.get("previous_gpa", 10)) < 6.0:
        recommendations.append("Low Base GPA: Review overall progress.")
        
    subject_weaknesses = []
    
    for sub in BASE_SUBJECTS:
        safe_name = sub.lower().replace(" ", "_")
        internal_key = f"{safe_name}_internal"
        external_key = f"{safe_name}_external"
        att_key = f"{safe_name}_attendance"
        
        if internal_key in student_row and student_row[internal_key] >= 0:
            internal = float(student_row[internal_key])
            external = float(student_row[external_key])
            att = float(student_row[att_key])
            
            is_practical = "LAB" in sub.upper()
            max_total = 50 if is_practical else 100
            
            max_int = max_total * 0.3
            max_ext = max_total * 0.7
            
            int_pct = (internal / max_int) * 100 if max_int > 0 else 0
            ext_pct = (external / max_ext) * 100 if max_ext > 0 else 0
            
            # Subject Weakness Score (Higher is weaker)
            # Attendance Weight = 30%, Internal Weight = 30%, External Weight = 40%
            weakness_score = ((100 - att) * 0.3) + ((100 - int_pct) * 0.3) + ((100 - ext_pct) * 0.4)
            
            if weakness_score > 40: # threshold for weakness
                subject_weaknesses.append((sub, weakness_score))

    # Sort by weakest
    subject_weaknesses.sort(key=lambda x: x[1], reverse=True)
    
    for i, (sub, score) in enumerate(subject_weaknesses[:3]):
        recommendations.append(f"Priority {i+1}: {sub} (Weakness Score: {score:.1f}/100)")

    if not recommendations:
        recommendations.append("Green/Safe: Maintain the current support plan.")

    return recommendations

def attach_recommendations(predictions: pd.DataFrame) -> pd.DataFrame:
    output = predictions.copy()
    output["recommendations"] = output.apply(
        lambda row: " | ".join(build_recommendations(row)),
        axis=1,
    )
    return output
