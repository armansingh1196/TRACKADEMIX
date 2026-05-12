# Student Performance AI
## Report-Ready Project Summary

### Abstract
This project presents a `Student Performance AI` prototype designed for a `BIT Management System`. The aim of the system is to predict student performance and help identify students who may be academically at risk. The prototype uses a `Random Forest Classifier` trained on a realistic synthetic dataset containing academic, behavioral, and contextual student features such as attendance, assignment scores, quiz marks, internal exam scores, GPA, study hours, and LMS engagement. The system predicts one of three performance bands: `Low`, `Medium`, or `High`, and then provides recommendation-oriented support actions based on weak indicators in the student's profile. The prototype also includes a dashboard that visualizes metrics, feature importance, class distributions, and live predictions. This makes the system suitable for major-project review, demonstration, and future integration into a real educational management platform.

### 1. Introduction
Educational institutions increasingly rely on data-driven systems to improve student outcomes. A management platform becomes more useful when it can go beyond storing records and begin assisting with academic decision-making. This project addresses that need by building an AI prototype that predicts student performance and highlights intervention opportunities.

The goal of this system is not only to classify student outcomes but also to support recommendations. In practical terms, the model analyzes student-related indicators and predicts whether the student belongs to a `Low`, `Medium`, or `High` performance group. After this prediction, the application generates recommendation text such as academic support, attendance mentoring, assignment tracking, or study-planning guidance.

### 2. Problem Statement
The central problem addressed in this project is:

How can a BIT Management System use student data to identify performance levels early and recommend meaningful academic intervention?

The proposed system solves this by:
- learning patterns from structured student data
- predicting academic performance bands
- identifying at-risk students from prediction outputs
- converting weak academic indicators into actionable recommendations

### 3. Objectives
The objectives of the project are:
- to build a review-ready student performance prediction model
- to use a machine learning approach suitable for structured educational data
- to visualize the prediction outputs in an understandable dashboard
- to support academic recommendations based on risk indicators
- to prepare the project for future integration into a full BIT Management System

### 4. Dataset And Features
Because no live institutional dataset was connected during the prototype stage, the project uses a realistic synthetic dataset. This allowed the full workflow to be demonstrated while preserving a believable academic data structure.

The dataset includes the following input features.

#### Numeric features
- `attendance_rate`
- `assignment_average`
- `quiz_average`
- `internal_exam_score`
- `lab_performance`
- `study_hours_per_week`
- `lms_logins_per_week`
- `previous_gpa`
- `project_score`

#### Categorical features
- `department`
- `study_mode`
- `internet_access`
- `part_time_job`
- `extracurricular_activity`

These features were selected because they represent:
- academic consistency
- student engagement
- prior academic ability
- social and access-related context

### 5. Target Variable
The model predicts the target variable `performance_band`. This target is derived from a synthetic performance score and classified into:
- `Low`: score below `105`
- `Medium`: score between `105` and `123`
- `High`: score above `123`

An additional `at-risk` indicator is derived for presentation and recommendation support.

### 6. Model Choice
The model selected for this prototype is `Random Forest`.

#### Why Random Forest was chosen
- It performs well on structured tabular data.
- It is easier to explain during academic review than deep learning models.
- It handles non-linear feature relationships well.
- It is more stable than a single decision tree.
- It provides feature-importance information.
- It gives strong baseline performance for a prototype without excessive complexity.

### 7. How Random Forest Works
Random Forest is an ensemble-learning algorithm. Instead of building one decision tree, it builds many decision trees and combines their outputs.

For this classification problem:
- each tree predicts `Low`, `Medium`, or `High`
- the forest collects votes across all trees
- the final prediction is the majority-vote class

This improves robustness because individual trees may overfit or make isolated mistakes, while the forest as a whole generalizes better.

### 8. Model Pipeline
The project uses a preprocessing and classification pipeline:

1. Load or generate the dataset.
2. Split input columns into numeric and categorical groups.
3. Fill missing numeric values using median imputation.
4. Fill missing categorical values using the most frequent category.
5. Apply one-hot encoding to categorical fields.
6. Train a `RandomForestClassifier`.
7. Predict performance on the test set.
8. Save model outputs and analytics artifacts.
9. Convert predictions and low-performing indicators into recommendations.

#### Model configuration
- `n_estimators = 300`
- `max_depth = 12`
- `min_samples_split = 4`
- `min_samples_leaf = 2`
- `class_weight = balanced`
- `random_state = 42`

### 9. Evaluation Results
The current saved evaluation results are:
- Accuracy: `0.6458`
- Weighted F1-score: `0.6349`
- Training rows: `960`
- Test rows: `240`

#### Class-level observations
- The model performs strongest on the `Medium` class.
- The `Low` and `High` classes are harder to separate, and some are predicted as `Medium`.
- For a synthetic-data prototype, the result is realistic and acceptable for demonstration.

#### Confusion matrix
| Actual \\ Predicted | Low | Medium | High |
|---|---:|---:|---:|
| Low | 24 | 29 | 0 |
| Medium | 13 | 102 | 12 |
| High | 1 | 30 | 29 |

### 10. Recommendation Mechanism
The system does not stop at prediction. After predicting student performance, it checks weak indicators in the student's record and produces recommendation text.

Examples include:
- attendance mentoring for low attendance
- remedial support for weak internal exam scores
- assignment tracking for low assignment performance
- topic-wise practice for weak quiz scores
- study-planning support for low study hours
- engagement prompts for low LMS usage

This creates a practical AI-supported recommendation system rather than a pure classifier.

### 11. Dashboard Function
The dashboard acts as the presentation and interaction layer of the project. It:
- displays dataset size and model metrics
- shows performance distribution and risk charts
- displays feature importance
- presents sample predictions
- allows live single-student prediction using a form
- shows recommendation output along with the prediction

This makes the system suitable for demonstration in front of a project review panel.

### 12. Files And Outputs
The trained pipeline generates the following outputs:
- `data/mock_student_performance.csv`
- `artifacts/random_forest_model.joblib`
- `artifacts/metrics.json`
- `artifacts/model_summary.json`
- `artifacts/feature_importance.csv`
- `artifacts/sample_predictions.csv`
- `artifacts/target_distribution.png`
- `artifacts/feature_importance.png`
- `artifacts/risk_distribution.png`

### 13. How To Run The Application
From the project folder, follow these steps:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m src.student_performance_ai.data_generation
python -m src.student_performance_ai.training
streamlit run app/dashboard.py
```

If you want a one-click option on Windows, use:
- `run_app.bat`
- `run_app.ps1`

### 14. Limitations
- The dataset is synthetic and not real institutional data.
- Recommendations are rule-based and not learned directly by the model.
- The current system is a prototype and not yet integrated into a live BIT Management System backend.
- The current accuracy is suitable for review and demonstration, but not final production deployment.

### 15. Future Scope
Future improvements can include:
- connecting real student records
- comparing Random Forest with other models such as XGBoost or Gradient Boosting
- adding a backend API for system integration
- retraining periodically on new institutional data
- adding role-based access for faculty and administrators

### 16. Conclusion
This project demonstrates that a BIT Management System can be extended with AI to support both analytics and academic recommendations. The `Random Forest` model was selected because it is accurate enough for a prototype, reliable on tabular educational data, explainable in an academic setting, and capable of highlighting important student indicators. Combined with the dashboard and recommendation layer, the system provides a complete review-ready demonstration of AI-assisted student performance monitoring.
