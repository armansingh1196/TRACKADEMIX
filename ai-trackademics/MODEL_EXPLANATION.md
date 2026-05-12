# Student Performance AI Model Explanation

## Overview
This document explains the AI model used in the `Student Performance AI Prototype` for the `BIT Management System`. It covers:
- why `Random Forest` was selected
- how the model works
- how the data is prepared
- how predictions are made
- how recommendations are generated
- current model performance
- how to run the application

## Problem Statement
The goal of this model is to predict student academic performance and help identify students who may need support.

In this project, the model predicts a student's `performance_band`:
- `Low`
- `Medium`
- `High`

It also derives an `at-risk` indicator for review and intervention purposes:
- `Yes`
- `No`

This makes the system useful for both:
- analytics
- academic recommendations

## Why Random Forest
`Random Forest` was chosen because it is a strong fit for this project and for academic review presentations.

### Main reasons for choosing Random Forest
1. It works very well on `structured tabular data`.
   This project uses student records such as attendance, quiz marks, GPA, study hours, and department. Random Forest is one of the best classical models for this type of data.

2. It is easier to explain than deep learning models.
   For a major review, a model should not only work, but also be easy to justify. Random Forest is more interpretable than many neural network approaches.

3. It can capture `non-linear relationships`.
   Student performance is influenced by combinations of factors. For example, low attendance and low exam scores together may indicate risk more strongly than either one alone. Random Forest can learn these patterns.

4. It is more robust than a single decision tree.
   A single decision tree can overfit. Random Forest reduces this problem by combining many trees instead of depending on one.

5. It provides `feature importance`.
   This is useful for explaining which student attributes affect prediction most strongly, which is important in an academic presentation.

6. It gives good baseline performance quickly.
   Since this is a prototype, Random Forest is a practical first model that can be trained and demonstrated without excessive complexity.

## What Random Forest Is
Random Forest is an `ensemble learning` algorithm.

Instead of training one decision tree, it trains many decision trees and combines their outputs.

For classification problems like this one:
- each tree predicts a class such as `Low`, `Medium`, or `High`
- the forest collects votes from all trees
- the final prediction is the class with the majority vote

This usually performs better than a single tree because:
- individual trees may make different mistakes
- combining them improves generalization
- the model becomes more stable and less sensitive to noise

## How Random Forest Works In This Project
In this project, the model is implemented as a pipeline:

1. Input student data is collected.
2. Numeric and categorical features are separated.
3. Missing numeric values are filled using the `median`.
4. Missing categorical values are filled using the `most frequent` value.
5. Categorical values are converted using `OneHotEncoder`.
6. The processed data is passed into a `RandomForestClassifier`.
7. The classifier predicts the student's performance band.
8. The predicted band is also mapped into an `at-risk` interpretation.
9. Recommendations are generated based on weak academic indicators.

## Features Used By The Model
The model uses the following input features.

### Numeric features
- `attendance_rate`
- `assignment_average`
- `quiz_average`
- `internal_exam_score`
- `lab_performance`
- `study_hours_per_week`
- `lms_logins_per_week`
- `previous_gpa`
- `project_score`

### Categorical features
- `department`
- `study_mode`
- `internet_access`
- `part_time_job`
- `extracurricular_activity`

These features are good predictors of academic performance because they reflect:
- academic consistency
- engagement
- prior ability
- access and context

## Target Variable
The model predicts the column `performance_band`.

The labels are based on a synthetic `performance_score`:
- `Low`: score below `105`
- `Medium`: score between `105` and `123`
- `High`: score above `123`

These thresholds were calibrated so the synthetic dataset produces realistic class variation for demonstration.

## Why The Dataset Is Synthetic
This prototype uses a realistic mock dataset because:
- the workspace started empty
- live institutional data was not yet connected
- a prototype was needed for the major review

Using synthetic data allowed the full machine learning workflow to be demonstrated:
- dataset generation
- preprocessing
- training
- evaluation
- analytics
- recommendations
- dashboard presentation

## Model Pipeline
The training pipeline is implemented in `src/student_performance_ai/training.py`.

### Preprocessing
- numeric columns use `SimpleImputer(strategy="median")`
- categorical columns use `SimpleImputer(strategy="most_frequent")`
- categorical fields are encoded using `OneHotEncoder(handle_unknown="ignore")`

### Model settings
The classifier used is:
- `RandomForestClassifier`
- `n_estimators = 300`
- `max_depth = 12`
- `min_samples_split = 4`
- `min_samples_leaf = 2`
- `class_weight = "balanced"`
- `random_state = 42`

### Why these settings help
- `n_estimators = 300` means the model uses many trees, which improves stability.
- `max_depth = 12` limits tree depth, which helps control overfitting.
- `min_samples_split` and `min_samples_leaf` reduce overly specific branches.
- `class_weight = "balanced"` helps the model treat classes more fairly if the dataset is not perfectly balanced.
- `random_state = 42` makes results reproducible.

## Training And Evaluation Flow
The model follows this flow:

1. Generate or load the dataset.
2. Select feature columns and target column.
3. Split the data into training and test sets.
4. Use stratified splitting so all classes are represented fairly.
5. Train the Random Forest pipeline.
6. Predict on the test set.
7. Measure performance using classification metrics.
8. Save model artifacts for later use in the dashboard.

## Current Model Performance
The current saved evaluation results are:
- Accuracy: `0.6458`
- Weighted F1-score: `0.6349`
- Training rows: `960`
- Test rows: `240`

### Class-level behavior
- `Low` class:
  - precision: `0.6316`
  - recall: `0.4528`
  - F1-score: `0.5275`
- `Medium` class:
  - precision: `0.6335`
  - recall: `0.8031`
  - F1-score: `0.7083`
- `High` class:
  - precision: `0.7073`
  - recall: `0.4833`
  - F1-score: `0.5743`

### What these results mean
- The model is strongest on the `Medium` class.
- It is less sensitive on the `Low` and `High` edge groups.
- For a prototype using synthetic data, the results are acceptable and realistic.
- The system is good enough for demonstration, but it should later be improved with real institutional data and tuning.

## Confusion Matrix Explanation
The confusion matrix shows how predictions are distributed across actual classes.

Current confusion matrix:

| Actual \\ Predicted | Low | Medium | High |
|---|---:|---:|---:|
| Low | 24 | 29 | 0 |
| Medium | 13 | 102 | 12 |
| High | 1 | 30 | 29 |

This shows that:
- many `Medium` students are correctly predicted
- some `Low` and `High` students are being pulled into `Medium`
- this is common when the middle class is more dominant or overlaps with edge cases

## Feature Importance
One advantage of Random Forest is that it can estimate the relative importance of each feature.

In this project, feature importance is saved and visualized in:
- `artifacts/feature_importance.csv`
- `artifacts/feature_importance.png`

This helps explain which inputs influenced the model the most. For academic review, this is very valuable because the model is not treated like a black box.

## Recommendation Logic
The prediction model is combined with a rule-based recommendation layer in `src/student_performance_ai/recommendations.py`.

After prediction, the system checks important academic indicators such as:
- low attendance
- weak internal exam score
- low assignment average
- low quiz average
- low study hours
- low LMS engagement
- lack of internet access
- part-time workload

Based on these conditions, it generates guidance such as:
- attendance mentoring
- remedial academic support
- assignment tracking
- extra quiz practice
- study planning
- digital engagement support

This makes the system more useful than prediction alone because it also suggests what action can be taken.

## How The App Works
The application has two main parts:

### 1. Training pipeline
Files:
- `src/student_performance_ai/data_generation.py`
- `src/student_performance_ai/training.py`

This part:
- creates the dataset
- trains the model
- saves artifacts
- prepares charts and predictions

### 2. Dashboard
File:
- `app/dashboard.py`

This part:
- shows dataset size and model metrics
- displays performance distribution and risk charts
- shows feature importance
- displays sample predictions
- allows live single-student prediction through a form

## How To Run The App
Use these steps in the project folder.

### 1. Create a virtual environment
```bash
python -m venv .venv
```

### 2. Activate it
On Windows:
```bash
.venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Generate the mock dataset
```bash
python -m src.student_performance_ai.data_generation
```

### 5. Train the model and create artifacts
```bash
python -m src.student_performance_ai.training
```

### 6. Run the dashboard
```bash
streamlit run app/dashboard.py
```

After that, open the local URL shown by Streamlit in your browser.

## Files Generated After Training
Running the training pipeline creates:
- `data/mock_student_performance.csv`
- `artifacts/random_forest_model.joblib`
- `artifacts/metrics.json`
- `artifacts/model_summary.json`
- `artifacts/feature_importance.csv`
- `artifacts/sample_predictions.csv`
- `artifacts/target_distribution.png`
- `artifacts/feature_importance.png`
- `artifacts/risk_distribution.png`

## Limitations
- The dataset is synthetic, not real student data.
- Recommendations are rule-based, not learned directly by the model.
- The model is currently a prototype and not yet integrated with a real BIT Management System backend.
- The accuracy is suitable for demonstration, but not enough for real deployment decisions without further validation.

## Future Improvements
- connect real student records from the BIT Management System
- tune hyperparameters further
- compare Random Forest with models like XGBoost, Logistic Regression, or Gradient Boosting
- create an API layer for backend integration
- add retraining support when new data arrives
- add user roles for faculty/admin analytics access

## Final Justification
`Random Forest` is a strong academic and practical choice for this prototype because it is:
- accurate enough for a first review-ready version
- easy to explain
- reliable on tabular data
- able to provide feature importance
- suitable for turning student data into meaningful analytics and recommendations

For this reason, it is an appropriate model choice for the current `Student Performance AI` prototype.
