import requests
import json
import pandas as pd
import numpy as np
from pathlib import Path

env_path = Path('c:/Arman Singh/Centralized Academic Records and Performance Tracking System/Trackademics/backend/.env')
env = {line.split('=', 1)[0].strip(): line.split('=', 1)[1].strip() for line in open(env_path) if '=' in line and not line.startswith('#')}

url = env['SUPABASE_URL']
key = env['SUPABASE_ANON_KEY']
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}

def fetch_all(table):
    records = []
    offset = 0
    while True:
        res = requests.get(f"{url}/rest/v1/{table}?select=*&limit=1000&offset={offset}", headers=headers)
        data = res.json()
        if not data:
            break
        records.extend(data)
        if len(data) < 1000:
            break
        offset += 1000
    return records

print("Fetching data from DB...")
students = fetch_all("students")
subjects = {s['id']: s for s in fetch_all("subjects")}
exams = fetch_all("exam_results")
sclasses = {c['id']: c for c in fetch_all("sclasses")}

# We need to map this to the format expected by the model
# Feature columns: attendance_rate, previous_gpa, department, and {subject}_internal, {subject}_external, {subject}_attendance

import sys
sys.path.append('c:/Arman Singh/Centralized Academic Records and Performance Tracking System/Trackademics/ai-trackademics/src/student_performance_ai')
from config import BASE_SUBJECTS, LOW_PERFORMANCE_THRESHOLD, HIGH_PERFORMANCE_THRESHOLD, PERFORMANCE_LABELS

data_rows = []

# Group exams by student
student_exams = {}
for e in exams:
    sid = e['student_id']
    if sid not in student_exams: student_exams[sid] = []
    student_exams[sid].append(e)



for s in students:
    sid = s['id']
    sclass_id = s.get('sclass_id')
    
    # Department
    sclass = sclasses.get(sclass_id, {})
    sclass_name = sclass.get('sclass_name', 'CSE')
    import re
    match = re.match(r'^([A-Z]+)', sclass_name)
    department = match.group(1) if match else "CSE"
    
    row = {
        "student_id": sid,
        "department": department,
        "previous_gpa": 7.5 # Fallback since GPA is in semester_results which we haven't seeded. Let's just use 7.5 or randomize it slightly.
    }
    
    # Let's seed a realistic previous GPA based on their average exam score
    s_exams = student_exams.get(sid, [])
    
    total_score = 0
    total_max = 0
    
    # Init subject features to 0.0 (or -1.0 depending on how we handle missing)
    for sub in BASE_SUBJECTS:
        safe_name = sub.lower().replace(" ", "_")
        row[f"{safe_name}_internal"] = 0.0
        row[f"{safe_name}_external"] = 0.0
        row[f"{safe_name}_attendance"] = 0.0
        
    for e in s_exams:
        sub_id = e['subject_id']
        sub = subjects.get(sub_id)
        if not sub: continue
        
        # Normalize subject name
        sub_name = sub['sub_name']
        cleaned_name = re.sub(r'\s*\(\d{4}\)', '', sub_name).strip()
        
        if cleaned_name in BASE_SUBJECTS:
            safe_name = cleaned_name.lower().replace(" ", "_")
            
            internal = float(e.get('internal_marks') or 0.0)
            external = float(e.get('external_marks') or 0.0)
            
            row[f"{safe_name}_internal"] = internal
            row[f"{safe_name}_external"] = external
            
            # Attendance for this subject
            # Realistic random based on their marks
            is_practical = "LAB" in cleaned_name.upper()
            max_m = 50 if is_practical else 100
            score_pct = (internal + external) / max_m
            att_rate = min(100, max(50, (score_pct * 100) + np.random.normal(5, 5)))
                
            row[f"{safe_name}_attendance"] = round(att_rate, 2)
            
            total_score += (internal + external)
            total_max += 50 if "LAB" in cleaned_name.upper() else 100

    # Overall attendance
    overall_att = np.random.normal(80, 10)
    overall_att = min(100, max(0, overall_att))
    row['attendance_rate'] = round(overall_att, 2)
    
    # Calculate performance score and band
    if total_max > 0:
        perf_score = (total_score / total_max) * 100
    else:
        perf_score = 65.0
        
    row['previous_gpa'] = round((perf_score / 10) + np.random.normal(0, 0.5), 2)
    row['previous_gpa'] = min(10.0, max(0.0, row['previous_gpa']))
    
    row['performance_score'] = round(perf_score, 2)
    
    if perf_score < LOW_PERFORMANCE_THRESHOLD:
        row['performance_band'] = "Low"
    elif perf_score < HIGH_PERFORMANCE_THRESHOLD:
        row['performance_band'] = "Medium"
    else:
        row['performance_band'] = "High"
        
    # At risk
    failing_any = any(
        (row[f"{sub.lower().replace(' ', '_')}_internal"] + row[f"{sub.lower().replace(' ', '_')}_external"]) < (20 if "LAB" in sub.upper() else 40)
        for sub in BASE_SUBJECTS
        if (row[f"{sub.lower().replace(' ', '_')}_internal"] + row[f"{sub.lower().replace(' ', '_')}_external"]) > 0
    )
    
    row['at_risk'] = "Yes" if (row['attendance_rate'] < 60 or failing_any or row['performance_band'] == "Low") else "No"
    
    data_rows.append(row)

df = pd.DataFrame(data_rows)
out_path = Path('c:/Arman Singh/Centralized Academic Records and Performance Tracking System/Trackademics/ai-trackademics/data/mock_student_performance.csv')
out_path.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(out_path, index=False)
print(f"Successfully generated {len(df)} realistic training records from DB and saved to {out_path}")
