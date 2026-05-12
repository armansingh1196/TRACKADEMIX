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

    departments = np.array(["CSE", "ECE", "EEE", "ME", "CE"])
    
    department = rng.choice(departments, size=profile.size, p=[0.4, 0.2, 0.15, 0.15, 0.1])
    
    attendance_rate = _bounded(rng.normal(75, 15, profile.size), 0, 100)
    internal_avg_theory = _bounded(rng.normal(20, 5, profile.size), 0, 30)
    external_avg_theory = _bounded(rng.normal(45, 15, profile.size), 0, 70)
    internal_avg_practical = _bounded(rng.normal(18, 4, profile.size), 0, 25)
    external_avg_practical = _bounded(rng.normal(18, 4, profile.size), 0, 25)
    study_hours_per_week = _bounded(rng.normal(15, 5, profile.size), 0, 30)
    previous_gpa = _bounded(rng.normal(7.5, 1.2, profile.size), 0, 10)

    # Calculate score based on formula
    performance_score = (
        attendance_rate * 0.2
        + (internal_avg_theory / 30 * 100) * 0.15
        + (external_avg_theory / 70 * 100) * 0.25
        + (internal_avg_practical / 25 * 100) * 0.1
        + (external_avg_practical / 25 * 100) * 0.1
        + (previous_gpa / 10 * 100) * 0.15
        + (study_hours_per_week / 30 * 100) * 0.05
        + rng.normal(0, 0.5, profile.size) # Add less noise for higher accuracy
    )

    performance_band = pd.cut(
        performance_score,
        bins=[-np.inf, LOW_PERFORMANCE_THRESHOLD, HIGH_PERFORMANCE_THRESHOLD, np.inf],
        labels=PERFORMANCE_LABELS,
    ).astype(str)

    at_risk = np.where(
        (attendance_rate < 60)
        | (external_avg_theory < 28) # Less than 40% of 70
        | (performance_band == "Low"),
        "Yes",
        "No",
    )

    data = pd.DataFrame(
        {
            "student_id": [f"STU-{index:04d}" for index in range(1, profile.size + 1)],
            "department": department,
            "attendance_rate": np.round(attendance_rate, 2),
            "internal_avg_theory": np.round(internal_avg_theory, 2),
            "external_avg_theory": np.round(external_avg_theory, 2),
            "internal_avg_practical": np.round(internal_avg_practical, 2),
            "external_avg_practical": np.round(external_avg_practical, 2),
            "study_hours_per_week": np.round(study_hours_per_week, 2),
            "previous_gpa": np.round(previous_gpa, 2),
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
