import os
import json
import requests
from pathlib import Path
from .config import BASE_SUBJECTS

# Define paths
BASE_DIR = Path(__file__).resolve().parents[3] # Trackademics folder
ENV_PATH = BASE_DIR / "backend" / ".env"

def load_env():
    """Parse .env file for Supabase credentials."""
    env_vars = {}
    if ENV_PATH.exists():
        with open(ENV_PATH, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env_vars[key.strip()] = val.strip()
    return env_vars

ENV = load_env()
SUPABASE_URL = ENV.get("SUPABASE_URL", "")
SUPABASE_KEY = ENV.get("SUPABASE_ANON_KEY", "")

def fetch_table(table_name):
    """Fetch all rows from a Supabase table using REST API."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase credentials not found in backend/.env")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Profile": "public"
    }
    
    # Simple pagination fetching up to 1000 records for prototype
    if "?" in table_name:
        url = f"{SUPABASE_URL}/rest/v1/{table_name}&select=*"
    else:
        url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*"
        
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching {table_name}: {response.status_code} {response.text}")
        return []

def get_classes():
    return fetch_table("sclasses")

def get_subjects():
    return fetch_table("subjects")

def normalize_subject_name(sub_name):
    """Normalize subject name to match BASE_SUBJECTS."""
    # Strip year suffix e.g., 'Algorithms (2022)' -> 'Algorithms'
    import re
    cleaned = re.sub(r'\s*\(\d{4}\)', '', sub_name).strip()
    return cleaned

def get_base_subject_name(sub_name):
    cleaned = normalize_subject_name(sub_name)
    if cleaned in BASE_SUBJECTS:
        return cleaned
    return None

if __name__ == "__main__":
    classes = get_classes()
    subjects = get_subjects()
    print(f"Loaded {len(classes)} classes and {len(subjects)} subjects.")
    print("Base Subject Normalization Check:")
    for sub in subjects:
        base = get_base_subject_name(sub['sub_name'])
        if base:
            print(f"  {sub['sub_name']} -> {base}")
        else:
            print(f"  [UNMAPPED] {sub['sub_name']}")
