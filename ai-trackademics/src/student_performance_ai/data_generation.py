"""Generate a realistic mock dataset for student performance prediction."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from .config import (
    DATASET_PATH,
    DATASET_SIZE,
    HIGH_PERFORMANCE_THRESHOLD,
    LOW_PERFORMANCE_THRESHOLD,
    PERFORMANCE_LABELS,
    RANDOM_STATE,
)


@dataclass(frozen=True)
class DatasetProfile:
    size: int = DATASET_SIZE
    random_state: int = RANDOM_STATE


def _bounded(values: np.ndarray, low: float, high: float) -> np.ndarray:
    return np.clip(values, low, high)


def generate_mock_dataset(profile: DatasetProfile | None = None) -> pd.DataFrame:
    """Create a structured dataset with patterns a Random Forest can learn."""
    profile = profile or DatasetProfile()
    rng = np.random.default_rng(profile.random_state)

    departments = np.array(["BIT", "BCA", "CS", "SE", "AI"])
    study_modes = np.array(["Regular", "Hybrid"])
    yes_no = np.array(["Yes", "No"])

    department = rng.choice(departments, size=profile.size, p=[0.35, 0.18, 0.2, 0.17, 0.1])
    study_mode = rng.choice(study_modes, size=profile.size, p=[0.8, 0.2])
    internet_access = rng.choice(yes_no, size=profile.size, p=[0.88, 0.12])
    part_time_job = rng.choice(yes_no, size=profile.size, p=[0.28, 0.72])
    extracurricular_activity = rng.choice(yes_no, size=profile.size, p=[0.45, 0.55])

    previous_gpa = _bounded(rng.normal(2.95, 0.55, profile.size), 1.4, 4.0)
    study_hours_per_week = _bounded(rng.normal(13, 4.2, profile.size), 2, 30)
    lms_logins_per_week = _bounded(rng.normal(10, 4.5, profile.size), 1, 30)
    attendance_rate = _bounded(rng.normal(79, 12, profile.size), 35, 100)
    quiz_average = _bounded(rng.normal(68, 14, profile.size), 20, 100)
    assignment_average = _bounded(rng.normal(72, 12, profile.size), 25, 100)
    internal_exam_score = _bounded(rng.normal(66, 15, profile.size), 15, 100)
    lab_performance = _bounded(rng.normal(70, 13, profile.size), 20, 100)
    project_score = _bounded(rng.normal(73, 11, profile.size), 30, 100)

    department_bonus = np.select(
        [department == "AI", department == "CS", department == "SE", department == "BIT", department == "BCA"],
        [2.5, 1.5, 1.0, 0.5, -0.5],
        default=0.0,
    )
    mode_adjustment = np.where(study_mode == "Regular", 1.8, -1.5)
    internet_penalty = np.where(internet_access == "No", -6.0, 0.0)
    job_penalty = np.where(part_time_job == "Yes", -3.5, 0.0)
    activity_bonus = np.where(extracurricular_activity == "Yes", 1.5, 0.0)

    performance_score = (
        attendance_rate * 0.18
        + assignment_average * 0.14
        + quiz_average * 0.12
        + internal_exam_score * 0.2
        + lab_performance * 0.11
        + project_score * 0.08
        + previous_gpa * 12
        + study_hours_per_week * 0.9
        + lms_logins_per_week * 0.7
        + department_bonus
        + mode_adjustment
        + internet_penalty
        + job_penalty
        + activity_bonus
        + rng.normal(0, 2, profile.size)
    )

    performance_band = pd.cut(
        performance_score,
        bins=[-np.inf, LOW_PERFORMANCE_THRESHOLD, HIGH_PERFORMANCE_THRESHOLD, np.inf],
        labels=PERFORMANCE_LABELS,
    ).astype(str)

    at_risk = np.where(
        (attendance_rate < 65)
        | (internal_exam_score < 50)
        | (assignment_average < 55)
        | (performance_band == "Low"),
        "Yes",
        "No",
    )

    data = pd.DataFrame(
        {
            "student_id": [f"STU-{index:04d}" for index in range(1, profile.size + 1)],
            "department": department,
            "study_mode": study_mode,
            "internet_access": internet_access,
            "part_time_job": part_time_job,
            "extracurricular_activity": extracurricular_activity,
            "attendance_rate": np.round(attendance_rate, 2),
            "assignment_average": np.round(assignment_average, 2),
            "quiz_average": np.round(quiz_average, 2),
            "internal_exam_score": np.round(internal_exam_score, 2),
            "lab_performance": np.round(lab_performance, 2),
            "study_hours_per_week": np.round(study_hours_per_week, 2),
            "lms_logins_per_week": np.round(lms_logins_per_week, 2),
            "previous_gpa": np.round(previous_gpa, 2),
            "project_score": np.round(project_score, 2),
            "performance_score": np.round(performance_score, 2),
            "performance_band": performance_band,
            "at_risk": at_risk,
        }
    )
    return data


def save_mock_dataset(profile: DatasetProfile | None = None) -> pd.DataFrame:
    """Generate and persist the dataset for training and demos."""
    dataset = generate_mock_dataset(profile)
    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_csv(DATASET_PATH, index=False)
    return dataset


if __name__ == "__main__":
    frame = save_mock_dataset()
    print(f"Saved dataset with {len(frame)} rows to {DATASET_PATH}")
