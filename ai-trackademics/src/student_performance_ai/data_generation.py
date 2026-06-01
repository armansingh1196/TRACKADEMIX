"""Generate a realistic mock dataset for student performance prediction using active classes."""

from __future__ import annotations

import numpy as np
import pandas as pd
from dataclasses import dataclass

from .config import (
    DATASET_PATH,
    DATASET_SIZE,
    HIGH_PERFORMANCE_THRESHOLD,
    LOW_PERFORMANCE_THRESHOLD,
    PERFORMANCE_LABELS,
    RANDOM_STATE,
    SUBJECT_FEATURES,
    BASE_SUBJECTS,
)
from . import db_loader

@dataclass(frozen=True)
class DatasetProfile:
    size: int = DATASET_SIZE
    random_state: int = RANDOM_STATE

def _bounded(values: np.ndarray, low: float, high: float) -> np.ndarray:
    return np.clip(values, low, high)

def generate_mock_dataset(profile: DatasetProfile | None = None) -> pd.DataFrame:
    """Create a structured dataset with patterns matching actual database schema."""
    profile = profile or DatasetProfile()
    rng = np.random.default_rng(profile.random_state)
    
    # 1. Fetch class definitions
    classes = db_loader.get_classes()
    if not classes:
        print("Warning: No classes fetched from DB. Using fallback.")
        classes = [{"id": f"dummy_{i}", "sclass_name": f"CSE-202{i}"} for i in range(2, 6)]
        
    subjects = db_loader.get_subjects()
    
    # Map class to its base subjects
    class_subject_map = {}
    for c in classes:
        c_id = c['id']
        class_subjects = [s for s in subjects if s.get('sclass_id') == c_id]
        base_names = [db_loader.get_base_subject_name(s['sub_name']) for s in class_subjects]
        class_subject_map[c_id] = [b for b in base_names if b is not None]
        
    # Generate students assigned to classes
    student_classes = rng.choice(classes, size=profile.size)
    student_class_ids = [c['id'] for c in student_classes]
    
    # Base general features
    attendance_rate = _bounded(rng.normal(75, 15, profile.size), 0, 100)
    previous_gpa = _bounded(rng.normal(7.5, 1.2, profile.size), 0, 10)
    
    # Trend Features
    attendance_trend = rng.normal(0, 10, profile.size) # e.g. dropped by 10% or increased by 10%
    marks_trend = rng.normal(0, 15, profile.size)
    
    # Department derived from class name (e.g. CSE-2022 -> CSE)
    departments = []
    for c in student_classes:
        name = c.get('sclass_name', 'CSE')
        import re
        match = re.match(r'^([A-Z]+)', name)
        departments.append(match.group(1) if match else "CSE")
        
    data_dict = {
        "student_id": [f"STU-{i:04d}" for i in range(1, profile.size + 1)],
        "department": departments,
        "attendance_rate": np.round(attendance_rate, 2),
        "previous_gpa": np.round(previous_gpa, 2),
        "attendance_trend": np.round(attendance_trend, 2),
        "marks_trend": np.round(marks_trend, 2)
    }
    
    # Initialize all subject features to -1.0
    for feat in SUBJECT_FEATURES:
        data_dict[feat] = np.full(profile.size, -1.0)
        
    # Variables to track performance per student
    total_score_sum = np.zeros(profile.size)
    total_score_count = np.zeros(profile.size)
    failing_any_subject = np.zeros(profile.size, dtype=bool)
        
    # Generate marks and attendance for enrolled subjects
    for i in range(profile.size):
        c_id = student_class_ids[i]
        # Instead of sparse mapping, the user requested to 'complete' the dataset with dense values for all subjects
        enrolled_subjects = BASE_SUBJECTS
        student_score_sum = 0
        student_score_count = 0
        failing = False
        
        for sub in enrolled_subjects:
            safe_name = sub.lower().replace(" ", "_")
            
            # Generate realistic values
            # Using same distribution for theory/practical generically since we're just modeling.
            # Usually internal=30, external=70. Let's make internal 0-30, external 0-70.
            internal = float(_bounded(rng.normal(20, 5), 0, 30))
            external = float(_bounded(rng.normal(45, 15), 0, 70))
            subj_att = float(_bounded(rng.normal(attendance_rate[i], 10), 0, 100))
            
            data_dict[f"{safe_name}_internal"][i] = round(internal, 2)
            data_dict[f"{safe_name}_external"][i] = round(external, 2)
            data_dict[f"{safe_name}_attendance"][i] = round(subj_att, 2)
            
            subj_total = internal + external
            if subj_total < 40:
                failing = True
                
            student_score_sum += subj_total
            student_score_count += 100 # Each subject is out of 100
            
        total_score_sum[i] = student_score_sum
        total_score_count[i] = max(1, student_score_count)
        failing_any_subject[i] = failing
        
    # Calculate overall performance score percentage
    base_performance_score = (total_score_sum / total_score_count) * 100
    # Add GPA influence and noise
    performance_score = (base_performance_score * 0.8) + (previous_gpa / 10 * 100) * 0.2 + rng.normal(0, 0.5, profile.size)
    performance_score = _bounded(performance_score, 0, 100)
    
    data_dict["performance_score"] = np.round(performance_score, 2)
    
    performance_band = pd.cut(
        performance_score,
        bins=[-np.inf, LOW_PERFORMANCE_THRESHOLD, HIGH_PERFORMANCE_THRESHOLD, np.inf],
        labels=PERFORMANCE_LABELS,
    ).astype(str)
    data_dict["performance_band"] = performance_band
    
    # at_risk if overall attendance < 60% OR failing any active subject OR performance band is Low
    at_risk = np.where(
        (attendance_rate < 60) | failing_any_subject | (performance_band == "Low"),
        "Yes",
        "No"
    )
    data_dict["at_risk"] = at_risk
    
    # Risk Score Calculation (0-100)
    # Starts from base inverse performance, penalized by negative trends and low attendance
    base_risk = 100 - performance_score
    trend_penalty = np.where(marks_trend < 0, abs(marks_trend) * 1.2, 0) + np.where(attendance_trend < 0, abs(attendance_trend) * 1.5, 0)
    failing_penalty = np.where(failing_any_subject, 20, 0)
    
    risk_score = _bounded(base_risk + trend_penalty + failing_penalty, 0, 100)
    data_dict["risk_score"] = np.round(risk_score, 1)
    
    return pd.DataFrame(data_dict)

def save_mock_dataset(profile: DatasetProfile | None = None) -> pd.DataFrame:
    """Generate and persist the dataset for training and demos."""
    dataset = generate_mock_dataset(profile)
    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_csv(DATASET_PATH, index=False)
    return dataset

if __name__ == "__main__":
    frame = save_mock_dataset()
    print(f"Saved dataset with {len(frame)} rows to {DATASET_PATH}")
