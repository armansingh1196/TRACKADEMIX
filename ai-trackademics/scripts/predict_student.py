import sys
import json
import joblib
import pandas as pd
from pathlib import Path

# Fix path to import src
base_dir = Path(__file__).resolve().parents[1]
sys.path.append(str(base_dir))

from src.student_performance_ai import db_loader
from src.student_performance_ai.inference import predict_student

def main():
    try:
        input_str = sys.stdin.read()
        if not input_str:
            print(json.dumps({"error": "No input data provided via stdin"}))
            return
            
        input_data = json.loads(input_str)
        student_id = input_data.get("student_id")
        
        if not student_id:
            print(json.dumps({"error": "Missing student_id"}))
            return
            
        # Fetch data using targeted queries to avoid 1000-row pagination limits and speed up execution
        student_data = db_loader.fetch_table(f"students?id=eq.{student_id}")
        if not student_data or len(student_data) == 0:
            print(json.dumps({"error": "Student not found in DB"}))
            return
        student = student_data[0]
            
        sclass_id = student.get("sclass_id")
        class_subjects = db_loader.fetch_table(f"subjects?sclass_id=eq.{sclass_id}")
        student_exams = db_loader.fetch_table(f"exam_results?student_id=eq.{student_id}")
        student_attendance = db_loader.fetch_table(f"attendance_records?student_id=eq.{student_id}")
        
        subject_id_to_base = {}
        active_subjects = []
        for s in class_subjects:
            base = db_loader.get_base_subject_name(s['sub_name'])
            if base:
                active_subjects.append(base)
                subject_id_to_base[s['id']] = base

        # Calculate attendance rate
        attendance_rate = 75.0
        if student_attendance:
            present = len([a for a in student_attendance if a.get('status') == 'Present'])
            late = len([a for a in student_attendance if a.get('status') == 'Late'])
            attendance_rate = ((present + 0.5 * late) / len(student_attendance)) * 100

        from src.student_performance_ai.config import SUBJECT_FEATURES, BASE_SUBJECTS
        current_vals = {f: -1.0 for f in SUBJECT_FEATURES}
        current_vals["attendance_rate"] = attendance_rate
        current_vals["previous_gpa"] = 7.5
        
        # Dept
        dept = "CSE"
        sclass = db_loader.fetch_table(f"sclasses?id=eq.{sclass_id}")
        if sclass and len(sclass) > 0:
            import re
            match = re.match(r'^([A-Z]+)', sclass[0].get('sclass_name', ''))
            if match:
                dept = match.group(1)
        current_vals["department"] = dept


        subject_attendances = {}
        for a in student_attendance:
            s_id = a.get('subject_id')
            if s_id in subject_id_to_base:
                base = subject_id_to_base[s_id]
                if base not in subject_attendances:
                    subject_attendances[base] = []
                subject_attendances[base].append(a)

        for base in active_subjects:
            safe_name = base.lower().replace(" ", "_")
            current_vals[f"{safe_name}_internal"] = 0.0
            current_vals[f"{safe_name}_external"] = 0.0
            
            # Subject specific attendance
            sub_att = subject_attendances.get(base, [])
            if sub_att:
                present = len([a for a in sub_att if a.get('status') == 'Present'])
                late = len([a for a in sub_att if a.get('status') == 'Late'])
                sub_att_rate = ((present + 0.5 * late) / len(sub_att)) * 100
                current_vals[f"{safe_name}_attendance"] = sub_att_rate
            else:
                current_vals[f"{safe_name}_attendance"] = attendance_rate
            
        for e in student_exams:
            s_id = e.get('subject_id')
            if s_id in subject_id_to_base:
                base = subject_id_to_base[s_id]
                safe_name = base.lower().replace(" ", "_")
                current_vals[f"{safe_name}_internal"] = float(e.get('internal_marks') or 0.0)
                current_vals[f"{safe_name}_external"] = float(e.get('external_marks') or 0.0)

        # Make prediction using inference module
        result = predict_student(current_vals)
        
        # Result contains predicted_band, predicted_risk, confidence, class_probabilities, recommendations
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
