import sys
import json
import joblib
import pandas as pd
from pathlib import Path

# Fix path to import src
base_dir = Path(__file__).resolve().parents[1]
sys.path.append(str(base_dir))

from src.student_performance_ai.recommendations import build_recommendations

def main():
    try:
        # Read from stdin
        input_str = sys.stdin.read()
        if not input_str:
            print(json.dumps({"error": "No input data provided via stdin"}))
            return
            
        input_data = json.loads(input_str)
        
        # Load model
        model_path = base_dir / "artifacts" / "random_forest_model.joblib"
        model = joblib.load(model_path)
        
        # We need to map the student input data into the exact format the model expects.
        # NUMERIC: attendance_rate, assignment_average, quiz_average, internal_exam_score, lab_performance, study_hours_per_week, lms_logins_per_week, previous_gpa, project_score
        # CATEGORICAL: department, study_mode, internet_access, part_time_job, extracurricular_activity
        
        # In a real integration, we synthesize or map these. 
        # Here we map what we have and synthesize default values for the rest to keep the model happy.
        
        df = pd.DataFrame([{
            "attendance_rate": input_data.get("attendance_rate", 75),
            "assignment_average": input_data.get("assignment_average", 70),
            "quiz_average": input_data.get("quiz_average", 70),
            "internal_exam_score": input_data.get("internal_exam_score", 60),
            "lab_performance": input_data.get("lab_performance", 65),
            "study_hours_per_week": input_data.get("study_hours_per_week", 10),
            "lms_logins_per_week": input_data.get("lms_logins_per_week", 5),
            "previous_gpa": input_data.get("previous_gpa", 7.0),
            "project_score": input_data.get("project_score", 75),
            "department": input_data.get("department", "CSE"),
            "study_mode": "Regular",
            "internet_access": "Yes",
            "part_time_job": "No",
            "extracurricular_activity": "No"
        }])
        
        # Cast numeric features to float to avoid type errors in comparisons
        numeric_features = [
            "attendance_rate", "assignment_average", "quiz_average", 
            "internal_exam_score", "lab_performance", "study_hours_per_week", 
            "lms_logins_per_week", "previous_gpa", "project_score"
        ]
        for feat in numeric_features:
            df[feat] = pd.to_numeric(df[feat], errors='coerce').fillna(0)
            
        # Make prediction
        band = model.predict(df)[0]
            
        # Get recommendations
        # Convert df row to series for recommendation builder
        row = df.iloc[0]
        recs = build_recommendations(row)
        
        result = {
            "performance_band": band,
            "recommendations": recs
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
