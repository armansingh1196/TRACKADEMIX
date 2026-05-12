"""Turn analytics and predictions into review-friendly student interventions."""

from __future__ import annotations

from typing import List

import pandas as pd


def build_recommendations(student_row: pd.Series) -> List[str]:
    recommendations: List[str] = []

    if float(student_row["attendance_rate"]) < 70:
        recommendations.append("Schedule attendance mentoring and alert the advisor.")
    if float(student_row["internal_exam_score"]) < 55:
        recommendations.append("Provide remedial support for internal exam preparation.")
    if float(student_row["assignment_average"]) < 60:
        recommendations.append("Track assignment completion weekly and offer deadline coaching.")
    if float(student_row["quiz_average"]) < 60:
        recommendations.append("Recommend additional topic-wise quiz practice.")
    if float(student_row["study_hours_per_week"]) < 8:
        recommendations.append("Encourage a structured weekly self-study plan.")
    if float(student_row["lms_logins_per_week"]) < 6:
        recommendations.append("Increase LMS engagement through digital learning prompts.")
    if student_row["internet_access"] == "No":
        recommendations.append("Offer offline material access or campus connectivity support.")
    if student_row["part_time_job"] == "Yes":
        recommendations.append("Review workload balance and suggest time-management support.")

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
