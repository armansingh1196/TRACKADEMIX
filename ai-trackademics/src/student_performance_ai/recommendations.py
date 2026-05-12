"""Turn analytics and predictions into review-friendly student interventions."""

from __future__ import annotations

from typing import List

import pandas as pd


def build_recommendations(student_row: pd.Series) -> List[str]:
    recommendations: List[str] = []

    if float(student_row["attendance_rate"]) < 60:
        recommendations.append("Schedule attendance mentoring and alert the advisor.")
    if float(student_row["internal_avg_theory"]) < 12:
        recommendations.append("Provide remedial support for theory internal exam preparation.")
    if float(student_row["external_avg_theory"]) < 28:
        recommendations.append("Offer targeted coaching for theory external exams.")
    if float(student_row["internal_avg_practical"]) < 10:
        recommendations.append("Recommend additional practice in lab sessions.")
    if float(student_row["study_hours_per_week"]) < 10:
        recommendations.append("Encourage a structured weekly self-study plan.")
    if float(student_row["previous_gpa"]) < 6.0:
        recommendations.append("Review overall academic progress and suggest study skills workshop.")

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
