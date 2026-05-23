"""Turn analytics and predictions into review-friendly student interventions."""

from __future__ import annotations

from typing import List

import pandas as pd
from .config import BASE_SUBJECTS

def build_recommendations(student_row: pd.Series) -> List[str]:
    recommendations: List[str] = []

    if float(student_row.get("attendance_rate", 100)) < 60:
        recommendations.append("Schedule attendance mentoring and alert the advisor.")
    
    if float(student_row.get("previous_gpa", 10)) < 6.0:
        recommendations.append("Review overall academic progress and suggest study skills workshop.")
        
    for sub in BASE_SUBJECTS:
        safe_name = sub.lower().replace(" ", "_")
        internal_key = f"{safe_name}_internal"
        external_key = f"{safe_name}_external"
        att_key = f"{safe_name}_attendance"
        
        # Ensure subject features exist and the student is enrolled (>= 0)
        if internal_key in student_row and student_row[internal_key] >= 0:
            internal = float(student_row[internal_key])
            external = float(student_row[external_key])
            att = float(student_row[att_key])
            
            # Determine max marks based on subject type
            is_practical = "LAB" in sub.upper()
            max_total = 50 if is_practical else 100
            
            total_score = internal + external
            percentage = (total_score / max_total) * 100
            
            if percentage < 40:
                recommendations.append(f"Student is underperforming in {sub} ({percentage:.1f}%). Recommend tutoring and remedial exercises.")
            if att < 75:
                recommendations.append(f"Low attendance in {sub} ({att}%). Schedule counseling session.")

    if not recommendations:
        recommendations.append("Maintain the current support plan and consider advanced enrichment tasks.")

    return recommendations

def attach_recommendations(predictions: pd.DataFrame) -> pd.DataFrame:
    output = predictions.copy()
    output["recommendations"] = output.apply(
        lambda row: " | ".join(build_recommendations(row)),
        axis=1,
    )
    return output
