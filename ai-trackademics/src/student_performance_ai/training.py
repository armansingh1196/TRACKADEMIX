"""Training pipeline for the student performance Random Forest model with SMOTE and SHAP."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass

import joblib
import matplotlib
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.over_sampling import SMOTE

from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression
import shap

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from .config import (
    ARTIFACTS_DIR,
    CATEGORICAL_FEATURES,
    DATASET_PATH,
    FEATURE_COLUMNS,
    FEATURE_IMPORTANCE_PATH,
    FEATURE_IMPORTANCE_PLOT,
    HIGH_PERFORMANCE_THRESHOLD,
    LOW_PERFORMANCE_THRESHOLD,
    METRICS_PATH,
    MODEL_PATH,
    NUMERIC_FEATURES,
    PERFORMANCE_LABELS,
    PREDICTIONS_PATH,
    RANDOM_STATE,
    RISK_DISTRIBUTION_PLOT,
    SUMMARY_PATH,
    TARGET_COLUMN,
    TARGET_DISTRIBUTION_PLOT,
)
from .data_generation import save_mock_dataset
from .recommendations import attach_recommendations

@dataclass(frozen=True)
class TrainingArtifacts:
    accuracy: float
    weighted_f1: float
    confusion_matrix: list[list[int]]
    class_labels: list[str]
    train_rows: int
    test_rows: int

def _build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = ImbPipeline(
        steps=[("imputer", SimpleImputer(strategy="median"))]
    )
    categorical_pipeline = ImbPipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, NUMERIC_FEATURES),
            ("categorical", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )

def _ensure_dataset() -> pd.DataFrame:
    if DATASET_PATH.exists():
        return pd.read_csv(DATASET_PATH)
    return save_mock_dataset()

def train_model() -> TrainingArtifacts:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    dataset = _ensure_dataset()
    
    X = dataset[FEATURE_COLUMNS]
    y = dataset[TARGET_COLUMN]

    X_train, X_test, y_train, y_test, _risk_train, risk_test = train_test_split(
        X, y, dataset["at_risk"], test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    preprocessor = _build_preprocessor()

    # 1. Compare Models
    print("Evaluating multiple models...")
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(n_estimators=300, max_depth=12, class_weight="balanced", random_state=RANDOM_STATE),
        # Label encode y for XGBoost
    }
    
    # We will use the Random Forest as the primary model with SMOTE
    print("Training Primary Model with SMOTE...")
    rf_model = RandomForestClassifier(
        n_estimators=300, max_depth=12, min_samples_split=4, min_samples_leaf=2, random_state=RANDOM_STATE
    )
    
    pipeline = ImbPipeline(steps=[
        ("preprocessor", preprocessor),
        ("smote", SMOTE(random_state=RANDOM_STATE)),
        ("model", rf_model)
    ])
    
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    probabilities = pipeline.predict_proba(X_test)
    predicted_risk = ["Yes" if label == "Low" else "No" for label in predictions]

    accuracy = accuracy_score(y_test, predictions)
    weighted_f1 = f1_score(y_test, predictions, average="weighted")
    labels = PERFORMANCE_LABELS
    matrix = confusion_matrix(y_test, predictions, labels=labels)
    report = classification_report(y_test, predictions, output_dict=True)

    # SHAP Explainability
    print("Generating SHAP Explanations...")
    X_test_transformed = pipeline.named_steps["preprocessor"].transform(X_test)
    transformed_feature_names = pipeline.named_steps["preprocessor"].get_feature_names_out()
    
    # We use a TreeExplainer for the Random Forest model
    explainer = shap.TreeExplainer(pipeline.named_steps["model"])
    shap_values = explainer.shap_values(X_test_transformed)
    
    # Save SHAP summary plot
    plt.figure(figsize=(10, 6))
    if isinstance(shap_values, list):
        shap_vals_to_plot = shap_values[0]
    elif len(shap_values.shape) == 3:
        shap_vals_to_plot = shap_values[:, :, 0]
    else:
        shap_vals_to_plot = shap_values
        
    shap.summary_plot(shap_vals_to_plot, X_test_transformed, feature_names=transformed_feature_names, show=False)
    plt.tight_layout()
    plt.savefig(ARTIFACTS_DIR / "shap_summary.png", dpi=160)
    plt.close()

    # Feature Importances
    importances = pipeline.named_steps["model"].feature_importances_.tolist()
    importance_df = pd.DataFrame({"feature": transformed_feature_names, "importance": importances}).sort_values("importance", ascending=False)
    importance_df.to_csv(FEATURE_IMPORTANCE_PATH, index=False)

    # Predictions Frame
    prediction_frame = X_test.copy()
    prediction_frame["actual_band"] = y_test.values
    prediction_frame["predicted_band"] = predictions
    prediction_frame["predicted_risk"] = predicted_risk
    prediction_frame["actual_risk"] = risk_test.values
    prediction_frame["confidence"] = probabilities.max(axis=1).round(4)
    # Get Risk Score from data generation
    prediction_frame["risk_score"] = dataset.loc[X_test.index, "risk_score"]
    prediction_frame = attach_recommendations(prediction_frame)
    prediction_frame.to_csv(PREDICTIONS_PATH, index=False)

    joblib.dump(pipeline, MODEL_PATH)

    metrics = TrainingArtifacts(
        accuracy=round(float(accuracy), 4),
        weighted_f1=round(float(weighted_f1), 4),
        confusion_matrix=matrix.tolist(),
        class_labels=labels,
        train_rows=len(X_train),
        test_rows=len(X_test),
    )

    METRICS_PATH.write_text(json.dumps({**asdict(metrics), "classification_report": report}, indent=2), encoding="utf-8")
    return metrics

if __name__ == "__main__":
    artifacts = train_model()
    print("Training Complete. Accuracy:", artifacts.accuracy)
