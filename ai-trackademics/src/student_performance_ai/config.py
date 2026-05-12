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

NUMERIC_FEATURES = [
    "attendance_rate",
    "internal_avg_theory",
    "external_avg_theory",
    "internal_avg_practical",
    "external_avg_practical",
    "study_hours_per_week",
    "previous_gpa",
]

CATEGORICAL_FEATURES = [
    "department",
]

FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES

PERFORMANCE_LABELS = ["Low", "Medium", "High"]
LOW_PERFORMANCE_THRESHOLD = 50
HIGH_PERFORMANCE_THRESHOLD = 75
