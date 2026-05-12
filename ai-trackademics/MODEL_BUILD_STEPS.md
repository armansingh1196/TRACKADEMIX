# Student Performance AI Model Build Steps

## Purpose
This document records the exact steps taken so far to define the AI model for the `BIT Management System`, and the next implementation steps that will be followed to build it.

## What We Have Decided So Far
1. The project is for a `BIT Management System`.
2. The AI should focus on `recommendations` and `analytics`.
3. The first goal is to build a `review-ready model/prototype`, not full system integration.
4. The first prediction target is `student performance`.
5. We can use a `realistic mock dataset` for the first version.
6. The requested machine learning algorithm is `Random Forest`.
7. The first deliverable should include:
   - a small Python-based model or API
   - analytics/dashboard-style outputs
   - documentation and project artifacts for the major review
8. The current workspace was found to be empty, so the prototype will be created from scratch.

## Step-by-Step Process Followed So Far
### Step 1: Define the AI objective
We clarified that the AI is not mainly a chatbot. Its first role is to support student-related analytics and recommendations.

### Step 2: Choose the first use case
We selected `student performance prediction` as the first and most suitable AI problem for the project.

### Step 3: Decide the first milestone
We agreed to make the `model first` so it can be presented during the major review before full integration into the BIT Management System.

### Step 4: Decide the data strategy
We agreed that, for the first prototype, we can create a `realistic mock dataset` instead of depending on live system data.

### Step 5: Choose the model
We selected `Random Forest` as the machine learning model because it is practical, explainable, and suitable for structured student-performance data.

### Step 6: Decide the demo format
We decided the prototype should be presented as a combination of:
- model output
- analytics/dashboard views
- written documentation and artifacts

### Step 7: Inspect the current workspace
We checked the workspace structure and found that it currently appears empty, which means the AI prototype must be built as a new project structure.

### Step 8: Create the implementation plan
We prepared a plan for a review-ready AI prototype that will train a Random Forest model, generate analytics, and later be wrapped in a simple app or dashboard.

## Steps We Will Follow To Build The Model
### Step 1: Define the prediction target
Choose exactly what the model will predict, for example:
- `at-risk` vs `not at-risk`
- `low`, `medium`, or `high` performance

### Step 2: Define the input features
Select the student attributes that will be used by the model, such as:
- attendance
- quiz marks
- assignment marks
- internal exam scores
- previous GPA
- engagement indicators

### Step 3: Create the dataset
Build a realistic mock dataset with enough rows and variation to demonstrate training, testing, analytics, and prediction.

### Step 4: Prepare the data
Clean the dataset, handle missing values, encode categorical fields if needed, and split the data into training and testing sets.

### Step 5: Train the Random Forest model
Use the prepared dataset to train the Random Forest classifier or regressor, depending on the chosen prediction target.

### Step 6: Evaluate the model
Measure model quality using suitable metrics such as:
- accuracy
- precision
- recall
- F1-score
- confusion matrix

### Step 7: Extract insights
Use feature importance and prediction summaries to explain which factors most influence student performance.

### Step 8: Generate recommendations
Map prediction outcomes into simple academic recommendations, such as:
- improve attendance
- focus on weak subjects
- increase assignment completion
- provide support for at-risk students

### Step 9: Build the review demo
Create a simple interface, dashboard, notebook, or Python app that can:
- show student predictions
- show analytics charts
- display model insights
- present recommendations

### Step 10: Prepare review artifacts
Document:
- the problem statement
- the dataset fields
- why Random Forest was chosen
- model results
- limitations
- future integration steps

## Why Random Forest Fits This Project
- It works well on structured tabular data.
- It is easier to explain in an academic review than many deep learning methods.
- It can provide feature importance for presentation and justification.
- It performs well even for an early prototype with realistic mock data.

## Implementation Steps Completed In This Workspace
### Step 9: Create the project structure
We created the initial project structure from scratch:
- `src/student_performance_ai/`
- `app/`
- `data/`
- `artifacts/`

### Step 10: Define the configuration
We created a shared configuration file to define:
- dataset paths
- artifact paths
- target column
- feature columns
- dataset size
- Random Forest settings support values

### Step 11: Implement mock data generation
We created a dataset generator that builds realistic student data including:
- attendance
- assignments
- quizzes
- internal exams
- labs
- study hours
- LMS engagement
- previous GPA
- project scores
- contextual student attributes

### Step 12: Implement recommendation logic
We created rule-based recommendation logic to convert predictions and weak academic indicators into review-friendly intervention suggestions.

### Step 13: Implement the Random Forest training pipeline
We built a complete training pipeline that:
- loads or generates the dataset
- preprocesses numeric and categorical features
- trains a Random Forest classifier
- evaluates the model
- saves metrics and artifacts

### Step 14: Calibrate the synthetic target labels
The first training run showed an unrealistic class distribution. We corrected the target thresholds so the synthetic dataset produces meaningful `Low`, `Medium`, and `High` classes.

### Step 15: Generate final artifacts
We generated:
- the mock dataset CSV
- the trained model file
- metrics JSON
- feature importance CSV
- model summary JSON
- sample prediction CSV
- presentation charts

### Step 16: Build the dashboard app
We created a Streamlit dashboard to present:
- dataset and training statistics
- class distribution
- predicted risk distribution
- feature importance
- sample student predictions
- recommendations

### Step 17: Write the project documentation
We created the README and updated this markdown file so the full development process is documented for the major review.

## Final Outputs Generated
- `data/mock_student_performance.csv`
- `artifacts/random_forest_model.joblib`
- `artifacts/metrics.json`
- `artifacts/model_summary.json`
- `artifacts/feature_importance.csv`
- `artifacts/sample_predictions.csv`
- `artifacts/target_distribution.png`
- `artifacts/feature_importance.png`
- `artifacts/risk_distribution.png`
- `app/dashboard.py`
- `README.md`

## Final Model Results
After calibrating the dataset and retraining the model, the current evaluation results are:
- Accuracy: `0.6458`
- Weighted F1-score: `0.6349`
- Classes predicted: `Low`, `Medium`, `High`
- Training rows: `960`
- Test rows: `240`

These results are more realistic and more suitable for academic presentation than the initial invalid single-class outcome.
