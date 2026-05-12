param(
    [switch]$Retrain
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Get-PythonCommand {
    if (Test-Path ".venv\Scripts\python.exe") {
        return ".venv\Scripts\python.exe"
    }

    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCommand) {
        return "python"
    }

    $localPython = "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312\python.exe"
    if (Test-Path $localPython) {
        return $localPython
    }

    throw "Python was not found. Install Python first, then run this script again."
}

try {
    $systemPython = Get-PythonCommand

    if (-not (Test-Path ".venv\Scripts\python.exe")) {
        Write-Host "Creating virtual environment..."
        & $systemPython -m venv .venv
    }

    $pythonExe = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
    $streamlitExe = Join-Path $PSScriptRoot ".venv\Scripts\streamlit.exe"

    Write-Host "Installing requirements..."
    & $pythonExe -m pip install -r requirements.txt

    $missingArtifacts = @(
        "data\mock_student_performance.csv",
        "artifacts\random_forest_model.joblib",
        "artifacts\metrics.json",
        "artifacts\sample_predictions.csv"
    ) | Where-Object { -not (Test-Path $_) }

    if ($Retrain -or $missingArtifacts.Count -gt 0) {
        Write-Host "Preparing dataset and model artifacts..."
        & $pythonExe -m src.student_performance_ai.data_generation
        & $pythonExe -m src.student_performance_ai.training
    }

    Write-Host "Starting Streamlit dashboard..."
    & $streamlitExe run app/dashboard.py
}
catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Press Enter to exit..."
    Read-Host | Out-Null
    exit 1
}
