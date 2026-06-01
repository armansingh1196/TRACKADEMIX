"""Compare multiple models for thesis evaluation."""
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.over_sampling import SMOTE
from src.student_performance_ai.training import _build_preprocessor, _ensure_dataset
from src.student_performance_ai.config import FEATURE_COLUMNS, TARGET_COLUMN, RANDOM_STATE

def compare():
    print("Comparing models...")
    dataset = _ensure_dataset()
    X = dataset[FEATURE_COLUMNS]
    y = dataset[TARGET_COLUMN]

    # XGB and LGBM require target labels to be integers 0, 1, 2...
    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=RANDOM_STATE, stratify=y_encoded
    )

    preprocessor = _build_preprocessor()
    smote = SMOTE(random_state=RANDOM_STATE)

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(n_estimators=300, max_depth=12, random_state=RANDOM_STATE),
        "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=RANDOM_STATE)
    }

    results = []
    for name, model in models.items():
        pipeline = ImbPipeline(steps=[
            ("preprocessor", preprocessor),
            ("smote", smote),
            ("model", model)
        ])
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        acc = accuracy_score(y_test, preds)
        results.append({"Model": name, "Accuracy": f"{acc*100:.1f}%"})
        print(f"{name}: {acc*100:.1f}%")

    df = pd.DataFrame(results)
    df.to_markdown("model_comparison.md", index=False)
    print("Saved to model_comparison.md")

if __name__ == "__main__":
    compare()
