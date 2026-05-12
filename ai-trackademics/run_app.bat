@echo off
setlocal

cd /d "%~dp0"

set "SYSTEM_PYTHON="

if exist ".venv\Scripts\python.exe" (
    set "SYSTEM_PYTHON=.venv\Scripts\python.exe"
) else (
    where python >nul 2>nul
    if %errorlevel%==0 (
        set "SYSTEM_PYTHON=python"
    ) else if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe" (
        set "SYSTEM_PYTHON=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe"
    )
)

if not defined SYSTEM_PYTHON (
    echo Python was not found.
    echo Install Python first, then run this file again.
    pause
    exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
    echo Creating virtual environment...
    "%SYSTEM_PYTHON%" -m venv .venv
    if errorlevel 1 (
        echo Failed to create virtual environment.
        pause
        exit /b 1
    )
)

set "PYTHON_EXE=.venv\Scripts\python.exe"
set "STREAMLIT_EXE=.venv\Scripts\streamlit.exe"

echo Installing requirements...
"%PYTHON_EXE%" -m pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install requirements.
    pause
    exit /b 1
)

if /i "%~1"=="--retrain" goto PREPARE

if not exist "data\mock_student_performance.csv" goto PREPARE
if not exist "artifacts\random_forest_model.joblib" goto PREPARE
if not exist "artifacts\metrics.json" goto PREPARE
if not exist "artifacts\sample_predictions.csv" goto PREPARE
goto RUN_APP

:PREPARE
echo Preparing dataset and model artifacts...
"%PYTHON_EXE%" -m src.student_performance_ai.data_generation
if errorlevel 1 (
    echo Failed to generate dataset.
    pause
    exit /b 1
)

"%PYTHON_EXE%" -m src.student_performance_ai.training
if errorlevel 1 (
    echo Failed to train model.
    pause
    exit /b 1
)

:RUN_APP
echo Starting Streamlit dashboard...
"%STREAMLIT_EXE%" run app/dashboard.py

endlocal
