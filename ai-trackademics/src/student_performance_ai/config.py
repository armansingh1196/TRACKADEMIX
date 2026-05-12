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
DATASET_SIZE = 1200

TARGET_COLUMN = "performance_band"
RISK_COLUMN = "at_risk"

NUMERIC_FEATURES = [
    "attendance_rate",
    "assignment_average",
    "quiz_average",
    "internal_exam_score",
    "lab_performance",
    "study_hours_per_week",
    "lms_logins_per_week",
    "previous_gpa",
    "project_score",
]

CATEGORICAL_FEATURES = [
    "department",
    "study_mode",
    "internet_access",
    "part_time_job",
    "extracurricular_activity",
]

FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES

PERFORMANCE_LABELS = ["Low", "Medium", "High"]
LOW_PERFORMANCE_THRESHOLD = 105
HIGH_PERFORMANCE_THRESHOLD = 123
