"""Training pipeline for the student performance Random Forest model."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass

import joblib
import matplotlib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

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


def _build_pipeline() -> Pipeline:
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, NUMERIC_FEATURES),
            ("categorical", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=RANDOM_STATE,
        class_weight="balanced",
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )


def _ensure_dataset() -> pd.DataFrame:
    if DATASET_PATH.exists():
        return pd.read_csv(DATASET_PATH)
    return save_mock_dataset()


def _plot_target_distribution(data: pd.DataFrame) -> None:
    counts = data[TARGET_COLUMN].value_counts().sort_index()
    plt.figure(figsize=(8, 5))
    counts.plot(kind="bar", color=["#ef4444", "#f59e0b", "#10b981"])
    plt.title("Student Performance Band Distribution")
    plt.xlabel("Performance Band")
    plt.ylabel("Number of Students")
    plt.tight_layout()
    plt.savefig(TARGET_DISTRIBUTION_PLOT, dpi=160)
    plt.close()


def _plot_risk_distribution(predictions: pd.DataFrame) -> None:
    counts = predictions["predicted_risk"].value_counts().reindex(["Yes", "No"], fill_value=0)
    plt.figure(figsize=(8, 5))
    counts.plot(kind="bar", color=["#ef4444", "#22c55e"])
    plt.title("Predicted At-Risk Distribution")
    plt.xlabel("At Risk")
    plt.ylabel("Number of Students")
    plt.tight_layout()
    plt.savefig(RISK_DISTRIBUTION_PLOT, dpi=160)
    plt.close()


def _plot_feature_importance(feature_names: list[str], importances: list[float]) -> pd.DataFrame:
    importance_df = (
        pd.DataFrame({"feature": feature_names, "importance": importances})
        .sort_values("importance", ascending=False)
        .reset_index(drop=True)
    )
    importance_df.to_csv(FEATURE_IMPORTANCE_PATH, index=False)

    top_features = importance_df.head(12).sort_values("importance")
    plt.figure(figsize=(10, 6))
    plt.barh(top_features["feature"], top_features["importance"], color="#3b82f6")
    plt.title("Top Random Forest Feature Importances")
    plt.xlabel("Importance")
    plt.tight_layout()
    plt.savefig(FEATURE_IMPORTANCE_PLOT, dpi=160)
    plt.close()

    return importance_df


def train_model() -> TrainingArtifacts:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    dataset = _ensure_dataset()
    X = dataset[FEATURE_COLUMNS]
    y = dataset[TARGET_COLUMN]

    X_train, X_test, y_train, y_test, _risk_train, risk_test = train_test_split(
        X,
        y,
        dataset["at_risk"],
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    pipeline = _build_pipeline()
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    probabilities = pipeline.predict_proba(X_test)
    predicted_risk = ["Yes" if label == "Low" else "No" for label in predictions]

    accuracy = accuracy_score(y_test, predictions)
    weighted_f1 = f1_score(y_test, predictions, average="weighted")
    labels = PERFORMANCE_LABELS
    matrix = confusion_matrix(y_test, predictions, labels=labels)
    report = classification_report(y_test, predictions, output_dict=True)

    transformed_feature_names = pipeline.named_steps["preprocessor"].get_feature_names_out()
    importance_df = _plot_feature_importance(
        feature_names=transformed_feature_names.tolist(),
        importances=pipeline.named_steps["model"].feature_importances_.tolist(),
    )
    _plot_target_distribution(dataset)

    prediction_frame = X_test.copy()
    prediction_frame["actual_band"] = y_test.values
    prediction_frame["predicted_band"] = predictions
    prediction_frame["predicted_risk"] = predicted_risk
    prediction_frame["actual_risk"] = risk_test.values
    prediction_frame["confidence"] = probabilities.max(axis=1).round(4)
    prediction_frame = attach_recommendations(prediction_frame)
    prediction_frame.to_csv(PREDICTIONS_PATH, index=False)

    _plot_risk_distribution(prediction_frame)
    joblib.dump(pipeline, MODEL_PATH)

    metrics = TrainingArtifacts(
        accuracy=round(float(accuracy), 4),
        weighted_f1=round(float(weighted_f1), 4),
        confusion_matrix=matrix.tolist(),
        class_labels=labels,
        train_rows=len(X_train),
        test_rows=len(X_test),
    )

    METRICS_PATH.write_text(
        json.dumps(
            {
                **asdict(metrics),
                "classification_report": report,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    summary = {
        "problem_statement": "Predict student performance bands and identify students who are academically at risk.",
        "target_definition": {
            "Low": f"Performance score below {LOW_PERFORMANCE_THRESHOLD}",
            "Medium": f"Performance score between {LOW_PERFORMANCE_THRESHOLD} and {HIGH_PERFORMANCE_THRESHOLD}",
            "High": f"Performance score above {HIGH_PERFORMANCE_THRESHOLD}",
        },
        "feature_columns": FEATURE_COLUMNS,
        "top_features": importance_df.head(10).to_dict(orient="records"),
        "model_choice": "Random Forest Classifier",
        "key_metrics": asdict(metrics),
    }
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    return metrics


if __name__ == "__main__":
    artifacts = train_model()
    print(json.dumps(asdict(artifacts), indent=2))
