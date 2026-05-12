# Student Performance AI Prototype

This project implements a review-ready AI prototype for a `BIT Management System`. It uses a `Random Forest` model to predict student performance bands, identify at-risk students, generate intervention recommendations, and present analytics through a lightweight dashboard.

## What The Prototype Does
- creates a realistic mock student dataset
- predicts `Low`, `Medium`, or `High` performance bands
- derives an `at-risk` view for review presentations
- explains model behavior using feature importance
- shows analytics and sample recommendations in a Streamlit dashboard
- supports live single-student prediction from an interactive dashboard form

## Project Structure
- `src/student_performance_ai/config.py` defines the target, features, and artifact paths
- `src/student_performance_ai/data_generation.py` creates the mock dataset
- `src/student_performance_ai/training.py` trains the Random Forest model and saves metrics/artifacts
- `src/student_performance_ai/recommendations.py` generates intervention suggestions
- `app/dashboard.py` displays the review-ready analytics dashboard
- `MODEL_BUILD_STEPS.md` documents the decisions and step-by-step process followed for the model

## Target And Features
The model predicts the target column `performance_band` using these input features:

Numeric features:
- `attendance_rate`
- `assignment_average`
- `quiz_average`
- `internal_exam_score`
- `lab_performance`
- `study_hours_per_week`
- `lms_logins_per_week`
- `previous_gpa`
- `project_score`

Categorical features:
- `department`
- `study_mode`
- `internet_access`
- `part_time_job`
- `extracurricular_activity`

## Setup
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run The Full Pipeline
```bash
python -m src.student_performance_ai.data_generation
python -m src.student_performance_ai.training
```

This generates:
- `data/mock_student_performance.csv`
- `artifacts/random_forest_model.joblib`
- `artifacts/metrics.json`
- `artifacts/model_summary.json`
- `artifacts/feature_importance.csv`
- `artifacts/sample_predictions.csv`
- chart images in `artifacts/`

## Launch The Dashboard
```bash
streamlit run app/dashboard.py
```

The dashboard includes:
- model metrics and dataset summaries
- feature importance and risk charts
- sample student predictions
- a live prediction form for entering a student profile and getting a performance/risk result with recommendations

## Review Talking Points
- `Random Forest` was chosen because it works well for structured academic data and is easy to explain.
- The prototype uses a realistic mock dataset so the end-to-end workflow can be demonstrated before live system integration.
- Feature importance highlights the strongest drivers of performance for the major review.
- Prediction outputs are translated into recommendations so the model supports both analytics and decision-making.

## Limitations
- The dataset is synthetic and should later be replaced or calibrated with real institutional data.
- Recommendations are rule-based and designed for demonstration.
- The current prototype is not yet integrated into the full BIT Management System.
