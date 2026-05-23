"""Shared configuration for the student performance AI prototype."""

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
APP_DIR = BASE_DIR / "app"

DATASET_PATH = DATA_DIR / "mock_student_performance.csv"
MODEL_PATH = ARTIFACTS_DIR / "random_forest_model.joblib"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"
FEATURE_IMPORTANCE_PATH = ARTIFACTS_DIR / "feature_importance.csv"
SUMMARY_PATH = ARTIFACTS_DIR / "model_summary.json"
PREDICTIONS_PATH = ARTIFACTS_DIR / "sample_predictions.csv"
TARGET_DISTRIBUTION_PLOT = ARTIFACTS_DIR / "target_distribution.png"
FEATURE_IMPORTANCE_PLOT = ARTIFACTS_DIR / "feature_importance.png"
RISK_DISTRIBUTION_PLOT = ARTIFACTS_DIR / "risk_distribution.png"

RANDOM_STATE = 42
DATASET_SIZE = 2000

TARGET_COLUMN = "performance_band"
RISK_COLUMN = "at_risk"

BASE_SUBJECTS = [
    "Algorithms",
    "Data Structures",
    "Database Systems",
    "Operating Systems",
    "Software Engineering",
    "DSA LAB",
    "DBMS LAB",
    "Computer Networks LAB",
    "Computer Graphics LAB",
    "Data Science LAB"
]

SUBJECT_FEATURES = []
for sub in BASE_SUBJECTS:
    safe_name = sub.lower().replace(" ", "_")
    SUBJECT_FEATURES.extend([
        f"{safe_name}_internal",
        f"{safe_name}_external",
        f"{safe_name}_attendance"
    ])

NUMERIC_FEATURES = [
    "attendance_rate",
    "previous_gpa",
] + SUBJECT_FEATURES

CATEGORICAL_FEATURES = [
    "department",
]

FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES

PERFORMANCE_LABELS = ["Low", "Medium", "High"]
LOW_PERFORMANCE_THRESHOLD = 50
HIGH_PERFORMANCE_THRESHOLD = 75
