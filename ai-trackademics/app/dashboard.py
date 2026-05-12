"""Streamlit dashboard for the student performance AI prototype."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd
import streamlit as st

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.student_performance_ai.config import (
    CATEGORICAL_FEATURES,
    DATASET_PATH,
    FEATURE_IMPORTANCE_PATH,
    FEATURE_IMPORTANCE_PLOT,
    METRICS_PATH,
    NUMERIC_FEATURES,
    PREDICTIONS_PATH,
    RISK_DISTRIBUTION_PLOT,
    SUMMARY_PATH,
    TARGET_DISTRIBUTION_PLOT,
)
from src.student_performance_ai.inference import predict_student


st.set_page_config(page_title="Student Performance AI", layout="wide")
def _load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


@st.cache_data
def _load_csv(path):
    return pd.read_csv(path)


def _default_student_values(dataset: pd.DataFrame) -> dict[str, object]:
    defaults: dict[str, object] = {}
    for column in NUMERIC_FEATURES:
        defaults[column] = float(dataset[column].median())
    for column in CATEGORICAL_FEATURES:
        defaults[column] = dataset[column].mode().iloc[0]
    return defaults


def _render_styles() -> None:
    st.markdown(
        """
        <style>
        /* Mobile-friendly base: same app works on phone browsers; no separate build required */
        html {
            -webkit-text-size-adjust: 100%;
        }
        html, body, [class*="css"] {
            font-family: "Inter", "Segoe UI", Arial, sans-serif;
        }
        /* Main content must start below Streamlit's fixed top bar (menu, Deploy, etc.) */
        .block-container {
            padding-top: max(1.5rem, calc(3.75rem + env(safe-area-inset-top, 0px)));
            padding-bottom: 2rem;
        }
        .landing-shell {
            min-height: 76vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .landing-wrap {
            width: 100%;
            max-width: 1120px;
            margin: 0 auto;
        }
        .landing-card {
            padding: 3.35rem 3rem;
            border-radius: 32px;
            text-align: left;
            background:
                radial-gradient(circle at top right, rgba(96, 165, 250, 0.35), transparent 30%),
                linear-gradient(135deg, #0f172a 0%, #172554 52%, #1d4ed8 100%);
            color: white;
            box-shadow: 0 26px 70px rgba(15, 23, 42, 0.28);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .landing-label {
            display: inline-block;
            padding: 0.38rem 0.8rem;
            border-radius: 999px;
            font-size: 0.82rem;
            font-weight: 600;
            letter-spacing: 0.02em;
            background: rgba(255, 255, 255, 0.12);
            margin-bottom: 1rem;
        }
        .landing-title {
            font-size: 2.8rem;
            font-weight: 800;
            line-height: 1.12;
            margin-bottom: 0.8rem;
            max-width: 760px;
        }
        .landing-subtitle {
            font-size: 1.02rem;
            opacity: 0.92;
            max-width: 700px;
            margin: 0 0 1.5rem 0;
        }
        .landing-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.85rem;
            margin-top: 1.5rem;
        }
        .landing-stat {
            padding: 0.95rem 1rem;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.09);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .landing-stat-title {
            font-size: 0.82rem;
            opacity: 0.82;
            margin-bottom: 0.3rem;
        }
        .landing-stat-value {
            font-size: 1rem;
            font-weight: 700;
        }
        .hero-card {
            padding: 1.5rem 1.75rem;
            border-radius: 18px;
            background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
            color: white;
            margin-bottom: 1rem;
        }
        .hero-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.35rem;
        }
        .hero-subtitle {
            font-size: 1rem;
            opacity: 0.92;
            margin-bottom: 1rem;
        }
        .pill-row {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        .pill {
            display: inline-block;
            padding: 0.35rem 0.75rem;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.16);
            font-size: 0.9rem;
        }
        .section-note {
            padding: 0.9rem 1rem;
            border-radius: 14px;
            background: rgba(37, 99, 235, 0.08);
            border: 1px solid rgba(37, 99, 235, 0.14);
            margin-bottom: 1rem;
        }
        .result-card {
            padding: 1rem 1.1rem;
            border-radius: 16px;
            background: rgba(15, 23, 42, 0.04);
            border: 1px solid rgba(148, 163, 184, 0.2);
            margin-bottom: 0.75rem;
        }
        .result-title {
            font-size: 0.9rem;
            color: #64748b;
            margin-bottom: 0.25rem;
        }
        .result-value {
            font-size: 1.4rem;
            font-weight: 700;
        }
        .hero-button-gap {
            margin-top: 1.75rem;
            max-width: 1120px;
            margin-left: auto;
            margin-right: auto;
            padding: 0 0.25rem;
        }
        /* Landing hero CTA — pill shape, depth, not a flat default primary */
        section.main [data-testid="stVerticalBlock"] > div[data-testid="stButton"] > button[kind="primary"],
        section.main div[data-testid="stButton"] > button[kind="primary"] {
            border-radius: 9999px !important;
            padding: 0.95rem 2.25rem !important;
            min-height: 3.15rem !important;
            font-weight: 650 !important;
            font-size: 1.02rem !important;
            letter-spacing: 0.03em !important;
            border: none !important;
            background: linear-gradient(180deg, #ffffff 0%, #f1f5ff 45%, #e0e7ff 100%) !important;
            color: #1e3a8a !important;
            box-shadow:
                0 1px 0 rgba(255, 255, 255, 0.85) inset,
                0 12px 36px rgba(37, 99, 235, 0.28),
                0 4px 12px rgba(15, 23, 42, 0.12) !important;
            transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        }
        section.main div[data-testid="stButton"] > button[kind="primary"]:hover {
            transform: translateY(-2px) !important;
            box-shadow:
                0 1px 0 rgba(255, 255, 255, 0.9) inset,
                0 18px 44px rgba(37, 99, 235, 0.35),
                0 6px 16px rgba(15, 23, 42, 0.14) !important;
            color: #172554 !important;
        }
        section.main div[data-testid="stButton"] > button[kind="primary"]:active {
            transform: translateY(0) !important;
        }
        @media (max-width: 900px) {
            .landing-card {
                padding: 2.4rem 1.5rem;
                text-align: center;
            }
            .landing-title {
                font-size: 2.1rem;
                max-width: none;
            }
            .landing-subtitle {
                margin: 0 auto 1.2rem auto;
            }
            .landing-grid {
                grid-template-columns: 1fr;
            }
        }
        /* Tablets: start stacking multi-column rows earlier */
        @media (max-width: 1024px) {
            section.main div[data-testid="stHorizontalBlock"],
            div[data-testid="stHorizontalBlock"],
            div[class*="stHorizontalBlock"] {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 0.75rem !important;
            }
            section.main div[data-testid="column"],
            div[data-testid="column"] {
                width: 100% !important;
                min-width: 0 !important;
                max-width: 100% !important;
            }
        }
        /* Phones & small tablets: stack Streamlit columns, safe areas, touch-friendly */
        @media (max-width: 768px) {
            .block-container {
                padding-left: max(0.85rem, env(safe-area-inset-left)) !important;
                padding-right: max(0.85rem, env(safe-area-inset-right)) !important;
                /* Do not shrink top padding — same header overlap issue as desktop */
                padding-top: max(1rem, calc(3.5rem + env(safe-area-inset-top, 0px))) !important;
                padding-bottom: max(1.25rem, env(safe-area-inset-bottom)) !important;
                max-width: 100% !important;
            }
            /* Streamlit main column: prevent horizontal page scroll */
            section[data-testid="stMain"],
            section.main {
                overflow-x: hidden !important;
            }
            .landing-shell {
                min-height: auto;
                padding: 0.5rem 0 1rem 0;
            }
            .landing-card {
                padding: 1.65rem 1.15rem !important;
                border-radius: 22px !important;
            }
            .landing-title {
                font-size: 1.55rem !important;
                line-height: 1.18 !important;
            }
            .landing-subtitle {
                font-size: 0.94rem !important;
            }
            .landing-label {
                font-size: 0.75rem !important;
            }
            .hero-card {
                padding: 1rem 0.95rem !important;
                border-radius: 16px !important;
            }
            .hero-title {
                font-size: 1.28rem !important;
            }
            .hero-subtitle {
                font-size: 0.88rem !important;
            }
            .pill {
                font-size: 0.78rem !important;
                padding: 0.28rem 0.55rem !important;
            }
            .section-note {
                font-size: 0.88rem !important;
                padding: 0.75rem 0.85rem !important;
            }
            /* Stack horizontal block layouts (metrics, charts, form columns) */
            section.main div[data-testid="stHorizontalBlock"],
            div[data-testid="stHorizontalBlock"],
            div[class*="stHorizontalBlock"] {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 0.65rem !important;
                width: 100% !important;
            }
            section.main div[data-testid="column"],
            div[data-testid="column"] {
                width: 100% !important;
                min-width: 0 !important;
                flex: 1 1 100% !important;
                max-width: 100% !important;
            }
            /* Nested horizontal blocks inside tabs */
            div[data-testid="stTabs"] div[data-testid="stHorizontalBlock"] {
                flex-direction: column !important;
            }
            /* Images never overflow viewport */
            div[data-testid="stImage"] img {
                max-width: 100% !important;
                height: auto !important;
            }
            /* Metric rows: readable when stacked */
            [data-testid="stMetricValue"] {
                font-size: 1.15rem !important;
            }
            /* Tabs: scroll instead of crush; touch-friendly */
            div[data-baseweb="tab-list"] {
                flex-wrap: nowrap !important;
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch !important;
                gap: 0.25rem !important;
                padding-bottom: 0.25rem !important;
            }
            button[data-baseweb="tab"] {
                min-height: 44px !important;
                padding-left: 0.65rem !important;
                padding-right: 0.65rem !important;
                flex-shrink: 0 !important;
            }
            /* Primary CTA: comfortable tap area */
            section.main div[data-testid="stButton"] > button[kind="primary"] {
                min-height: 3.25rem !important;
                font-size: 0.98rem !important;
            }
            /* Form controls: easier taps */
            div[data-baseweb="select"] > div,
            div[data-baseweb="input"] input {
                min-height: 44px !important;
            }
            /* Dataframes: horizontal scroll instead of squashing */
            div[data-testid="stDataFrame"] {
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch;
                max-width: 100% !important;
            }
            /* Expanders / alerts */
            div[data-testid="stExpander"] {
                max-width: 100% !important;
            }
        }
        @media (max-width: 480px) {
            .landing-title {
                font-size: 1.35rem !important;
            }
            .block-container {
                padding-left: max(0.65rem, env(safe-area-inset-left)) !important;
                padding-right: max(0.65rem, env(safe-area-inset-right)) !important;
                padding-top: max(1rem, calc(3.5rem + env(safe-area-inset-top, 0px))) !important;
            }
        }
        /* Shown only on narrow viewports — points users to stacked layout */
        .mobile-stack-hint {
            display: none;
            font-size: 0.85rem;
            color: #5c6b7a;
            background: rgba(59, 130, 246, 0.08);
            border: 1px solid rgba(59, 130, 246, 0.25);
            border-radius: 10px;
            padding: 0.65rem 0.85rem;
            margin: 0.5rem 0 1rem 0;
            line-height: 1.45;
        }
        @media (max-width: 768px) {
            .mobile-stack-hint { display: block; }
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def _enter_dashboard() -> None:
    st.session_state.show_dashboard = True


def _render_start_screen() -> None:
    """Full-width landing (no side columns) so phones do not get squeezed narrow columns."""
    st.markdown(
        """
        <div class="landing-shell">
            <div class="landing-wrap">
                <div class="landing-card">
                    <div class="landing-label">Academic Intelligence Platform</div>
                    <div class="landing-title">Centralized Academic records and performance tracking sysytem!</div>
                    <div class="landing-subtitle">A clean AI-powered workspace for student performance analytics, risk detection, and recommendation-driven academic support.</div>
                    <div class="landing-grid">
                        <div class="landing-stat">
                            <div class="landing-stat-title">Model</div>
                            <div class="landing-stat-value">Random Forest</div>
                        </div>
                        <div class="landing-stat">
                            <div class="landing-stat-title">Focus</div>
                            <div class="landing-stat-value">Performance + Risk</div>
                        </div>
                        <div class="landing-stat">
                            <div class="landing-stat-title">Experience</div>
                            <div class="landing-stat-value">Live AI Dashboard</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown('<div class="hero-button-gap"></div>', unsafe_allow_html=True)
    st.button(
        "Explore the AI Implementation  →",
        use_container_width=True,
        type="primary",
        on_click=_enter_dashboard,
        key="landing_explore_cta",
    )


def _render_dashboard(
    dataset: pd.DataFrame,
    metrics: dict,
    summary: dict,
    predictions: pd.DataFrame,
    feature_importance: pd.DataFrame,
    defaults: dict[str, object],
) -> None:
    stack = bool(st.session_state.get("phone_layout", False))

    st.markdown(
        """
        <div class="hero-card">
            <div class="hero-title">Student Performance AI Dashboard</div>
            <div class="hero-subtitle">Clean review-ready analytics, live prediction, and intervention support for the BIT Management System prototype.</div>
            <div class="pill-row">
                <span class="pill">Model: Random Forest</span>
                <span class="pill">Target: Low / Medium / High</span>
                <span class="pill">Use case: Risk analytics + recommendations</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    if not stack:
        st.markdown(
            """
            <div class="mobile-stack-hint">
                <strong>Mobile:</strong> Open the sidebar (☰) and turn on <strong>Stacked layout</strong> for single-column charts and forms,
                or add <code>?phone=1</code> to the URL once.
            </div>
            """,
            unsafe_allow_html=True,
        )

    with st.sidebar:
        st.subheader("Layout")
        st.caption("Use stacked layout on small screens. You can also open `?phone=1` once.")
        st.checkbox("Stacked layout (phones)", key="phone_layout")
        st.divider()
        st.header("Quick View")
        st.write(summary["problem_statement"])
        st.metric("Accuracy", f'{metrics["accuracy"]:.2%}')
        st.metric("Weighted F1", f'{metrics["weighted_f1"]:.2%}')
        st.write("Target Definition")
        for label, text in summary["target_definition"].items():
            st.write(f"- `{label}`: {text}")
        st.write("Run")
        st.code("run_app.ps1\n# or\nrun_app.bat", language="bash")

    if stack:
        st.metric("Dataset Rows", len(dataset))
        st.metric("Training Rows", metrics["train_rows"])
        st.metric("Accuracy", f'{metrics["accuracy"]:.2%}')
        st.metric("Weighted F1", f'{metrics["weighted_f1"]:.2%}')
    else:
        metric_col1, metric_col2, metric_col3, metric_col4 = st.columns(4)
        metric_col1.metric("Dataset Rows", len(dataset))
        metric_col2.metric("Training Rows", metrics["train_rows"])
        metric_col3.metric("Accuracy", f'{metrics["accuracy"]:.2%}')
        metric_col4.metric("Weighted F1", f'{metrics["weighted_f1"]:.2%}')

    overview_tab, prediction_tab, samples_tab = st.tabs(
        ["Overview", "Live Prediction", "Predictions Table"]
    )

    with overview_tab:
        st.markdown(
            '<div class="section-note">This view summarizes the model objective, target bands, charts, and top predictors used by the recommendation system.</div>',
            unsafe_allow_html=True,
        )
        if stack:
            st.subheader("Model Summary")
            st.write(summary["problem_statement"])
            st.dataframe(
                pd.DataFrame(
                    {
                        "Performance Band": list(summary["target_definition"].keys()),
                        "Meaning": list(summary["target_definition"].values()),
                    }
                ),
                use_container_width=True,
                hide_index=True,
            )
            st.subheader("Top Drivers")
            for item in summary["top_features"][:5]:
                st.write(f'`{item["feature"]}`')
                st.progress(min(item["importance"] / 0.25, 1.0))
                st.caption(f'Importance: {item["importance"]:.4f}')
            st.subheader("Performance Distribution")
            st.image(str(TARGET_DISTRIBUTION_PLOT), use_container_width=True)
            st.subheader("Predicted Risk Distribution")
            st.image(str(RISK_DISTRIBUTION_PLOT), use_container_width=True)
            st.subheader("Feature Importance")
            st.image(str(FEATURE_IMPORTANCE_PLOT), use_container_width=True)
            st.dataframe(feature_importance.head(10), use_container_width=True, hide_index=True)
        else:
            summary_left, summary_right = st.columns([1.2, 1])
            with summary_left:
                st.subheader("Model Summary")
                st.write(summary["problem_statement"])
                st.dataframe(
                    pd.DataFrame(
                        {
                            "Performance Band": list(summary["target_definition"].keys()),
                            "Meaning": list(summary["target_definition"].values()),
                        }
                    ),
                    use_container_width=True,
                    hide_index=True,
                )
            with summary_right:
                st.subheader("Top Drivers")
                for item in summary["top_features"][:5]:
                    st.write(f'`{item["feature"]}`')
                    st.progress(min(item["importance"] / 0.25, 1.0))
                    st.caption(f'Importance: {item["importance"]:.4f}')

            chart_left, chart_right = st.columns(2)
            with chart_left:
                st.subheader("Performance Distribution")
                st.image(str(TARGET_DISTRIBUTION_PLOT), use_container_width=True)
            with chart_right:
                st.subheader("Predicted Risk Distribution")
                st.image(str(RISK_DISTRIBUTION_PLOT), use_container_width=True)

            st.subheader("Feature Importance")
            fi_left, fi_right = st.columns([1.3, 1])
            with fi_left:
                st.image(str(FEATURE_IMPORTANCE_PLOT), use_container_width=True)
            with fi_right:
                st.dataframe(feature_importance.head(10), use_container_width=True, hide_index=True)

    with prediction_tab:
        st.markdown(
            '<div class="section-note">Enter a student profile to generate a live performance prediction, a risk flag, and recommendation-oriented academic actions.</div>',
            unsafe_allow_html=True,
        )

        with st.form("student_prediction_form"):
            if stack:
                department = st.selectbox(
                    "Department",
                    sorted(dataset["department"].unique()),
                    index=sorted(dataset["department"].unique()).index(defaults["department"]),
                )
                study_mode = st.selectbox(
                    "Study Mode",
                    sorted(dataset["study_mode"].unique()),
                    index=sorted(dataset["study_mode"].unique()).index(defaults["study_mode"]),
                )
                internet_access = st.selectbox(
                    "Internet Access",
                    ["Yes", "No"],
                    index=["Yes", "No"].index(defaults["internet_access"]),
                )
                part_time_job = st.selectbox(
                    "Part-Time Job",
                    ["Yes", "No"],
                    index=["Yes", "No"].index(defaults["part_time_job"]),
                )
                extracurricular_activity = st.selectbox(
                    "Extracurricular Activity",
                    ["Yes", "No"],
                    index=["Yes", "No"].index(defaults["extracurricular_activity"]),
                )
                previous_gpa = st.slider(
                    "Previous GPA",
                    min_value=1.0,
                    max_value=4.0,
                    value=float(defaults["previous_gpa"]),
                    step=0.01,
                )
                study_hours_per_week = st.slider(
                    "Study Hours Per Week",
                    min_value=0.0,
                    max_value=40.0,
                    value=float(defaults["study_hours_per_week"]),
                    step=0.5,
                )
                attendance_rate = st.slider(
                    "Attendance Rate",
                    min_value=0.0,
                    max_value=100.0,
                    value=float(defaults["attendance_rate"]),
                    step=0.5,
                )
                assignment_average = st.slider(
                    "Assignment Average",
                    min_value=0.0,
                    max_value=100.0,
                    value=float(defaults["assignment_average"]),
                    step=0.5,
                )
                quiz_average = st.slider(
                    "Quiz Average",
                    min_value=0.0,
                    max_value=100.0,
                    value=float(defaults["quiz_average"]),
                    step=0.5,
                )
                internal_exam_score = st.slider(
                    "Internal Exam Score",
                    min_value=0.0,
                    max_value=100.0,
                    value=float(defaults["internal_exam_score"]),
                    step=0.5,
                )
                lab_performance = st.slider(
                    "Lab Performance",
                    min_value=0.0,
                    max_value=100.0,
                    value=float(defaults["lab_performance"]),
                    step=0.5,
                )
                project_score = st.slider(
                    "Project Score",
                    min_value=0.0,
                    max_value=100.0,
                    value=float(defaults["project_score"]),
                    step=0.5,
                )
                lms_logins_per_week = st.slider(
                    "LMS Logins Per Week",
                    min_value=0.0,
                    max_value=30.0,
                    value=float(defaults["lms_logins_per_week"]),
                    step=1.0,
                )
            else:
                form_left, form_right = st.columns(2)
                with form_left:
                    department = st.selectbox(
                        "Department",
                        sorted(dataset["department"].unique()),
                        index=sorted(dataset["department"].unique()).index(defaults["department"]),
                    )
                    study_mode = st.selectbox(
                        "Study Mode",
                        sorted(dataset["study_mode"].unique()),
                        index=sorted(dataset["study_mode"].unique()).index(defaults["study_mode"]),
                    )
                    internet_access = st.selectbox(
                        "Internet Access",
                        ["Yes", "No"],
                        index=["Yes", "No"].index(defaults["internet_access"]),
                    )
                    part_time_job = st.selectbox(
                        "Part-Time Job",
                        ["Yes", "No"],
                        index=["Yes", "No"].index(defaults["part_time_job"]),
                    )
                    extracurricular_activity = st.selectbox(
                        "Extracurricular Activity",
                        ["Yes", "No"],
                        index=["Yes", "No"].index(defaults["extracurricular_activity"]),
                    )
                    previous_gpa = st.slider(
                        "Previous GPA",
                        min_value=1.0,
                        max_value=4.0,
                        value=float(defaults["previous_gpa"]),
                        step=0.01,
                    )
                    study_hours_per_week = st.slider(
                        "Study Hours Per Week",
                        min_value=0.0,
                        max_value=40.0,
                        value=float(defaults["study_hours_per_week"]),
                        step=0.5,
                    )
                with form_right:
                    attendance_rate = st.slider(
                        "Attendance Rate",
                        min_value=0.0,
                        max_value=100.0,
                        value=float(defaults["attendance_rate"]),
                        step=0.5,
                    )
                    assignment_average = st.slider(
                        "Assignment Average",
                        min_value=0.0,
                        max_value=100.0,
                        value=float(defaults["assignment_average"]),
                        step=0.5,
                    )
                    quiz_average = st.slider(
                        "Quiz Average",
                        min_value=0.0,
                        max_value=100.0,
                        value=float(defaults["quiz_average"]),
                        step=0.5,
                    )
                    internal_exam_score = st.slider(
                        "Internal Exam Score",
                        min_value=0.0,
                        max_value=100.0,
                        value=float(defaults["internal_exam_score"]),
                        step=0.5,
                    )
                    lab_performance = st.slider(
                        "Lab Performance",
                        min_value=0.0,
                        max_value=100.0,
                        value=float(defaults["lab_performance"]),
                        step=0.5,
                    )
                    project_score = st.slider(
                        "Project Score",
                        min_value=0.0,
                        max_value=100.0,
                        value=float(defaults["project_score"]),
                        step=0.5,
                    )
                    lms_logins_per_week = st.slider(
                        "LMS Logins Per Week",
                        min_value=0.0,
                        max_value=30.0,
                        value=float(defaults["lms_logins_per_week"]),
                        step=1.0,
                    )

            submitted = st.form_submit_button("Predict Student Performance", use_container_width=True)

        if submitted:
            student_data = {
                "department": department,
                "study_mode": study_mode,
                "internet_access": internet_access,
                "part_time_job": part_time_job,
                "extracurricular_activity": extracurricular_activity,
                "attendance_rate": attendance_rate,
                "assignment_average": assignment_average,
                "quiz_average": quiz_average,
                "internal_exam_score": internal_exam_score,
                "lab_performance": lab_performance,
                "study_hours_per_week": study_hours_per_week,
                "lms_logins_per_week": lms_logins_per_week,
                "previous_gpa": previous_gpa,
                "project_score": project_score,
            }
            result = predict_student(student_data)

            if stack:
                st.markdown(
                    f'<div class="result-card"><div class="result-title">Predicted Band</div><div class="result-value">{result["predicted_band"]}</div></div>',
                    unsafe_allow_html=True,
                )
                st.markdown(
                    f'<div class="result-card"><div class="result-title">Predicted Risk</div><div class="result-value">{result["predicted_risk"]}</div></div>',
                    unsafe_allow_html=True,
                )
                st.markdown(
                    f'<div class="result-card"><div class="result-title">Confidence</div><div class="result-value">{result["confidence"]:.2%}</div></div>',
                    unsafe_allow_html=True,
                )
                st.subheader("Class Probabilities")
                for label, probability in result["class_probabilities"].items():
                    st.write(f"`{label}`")
                    st.progress(float(probability))
                    st.caption(f"{probability:.2%}")
                st.subheader("Recommended Actions")
                for item in result["recommendations"]:
                    st.info(item)
            else:
                result_col1, result_col2, result_col3 = st.columns(3)
                with result_col1:
                    st.markdown(
                        f'<div class="result-card"><div class="result-title">Predicted Band</div><div class="result-value">{result["predicted_band"]}</div></div>',
                        unsafe_allow_html=True,
                    )
                with result_col2:
                    st.markdown(
                        f'<div class="result-card"><div class="result-title">Predicted Risk</div><div class="result-value">{result["predicted_risk"]}</div></div>',
                        unsafe_allow_html=True,
                    )
                with result_col3:
                    st.markdown(
                        f'<div class="result-card"><div class="result-title">Confidence</div><div class="result-value">{result["confidence"]:.2%}</div></div>',
                        unsafe_allow_html=True,
                    )

                prob_col, recommendation_col = st.columns([1, 1.2])
                with prob_col:
                    st.subheader("Class Probabilities")
                    for label, probability in result["class_probabilities"].items():
                        st.write(f"`{label}`")
                        st.progress(float(probability))
                        st.caption(f"{probability:.2%}")
                with recommendation_col:
                    st.subheader("Recommended Actions")
                    for item in result["recommendations"]:
                        st.info(item)

    with samples_tab:
        st.markdown(
            '<div class="section-note">These are sample model outputs from the saved test-set predictions, sorted by predicted risk and confidence.</div>',
            unsafe_allow_html=True,
        )
        view_columns = [
            "department",
            "attendance_rate",
            "assignment_average",
            "quiz_average",
            "internal_exam_score",
            "previous_gpa",
            "actual_band",
            "predicted_band",
            "predicted_risk",
            "confidence",
            "recommendations",
        ]
        st.dataframe(
            predictions.sort_values(["predicted_risk", "confidence"], ascending=[False, True]).head(20)[view_columns],
            use_container_width=True,
            hide_index=True,
        )
        st.subheader("Prototype Insights")
        if stack:
            st.success("The model is strongest on the Medium class, which is the most common academic profile in the synthetic dataset.")
            st.info("Low and High edge cases still overlap with Medium, which keeps the demo results realistic.")
            st.write("Top 5 feature insights")
            for item in summary["top_features"][:5]:
                st.write(f'- `{item["feature"]}`: `{item["importance"]:.4f}`')
        else:
            insight_left, insight_right = st.columns(2)
            with insight_left:
                st.success("The model is strongest on the Medium class, which is the most common academic profile in the synthetic dataset.")
                st.info("Low and High edge cases still overlap with Medium, which keeps the demo results realistic.")
            with insight_right:
                st.write("Top 5 feature insights")
                for item in summary["top_features"][:5]:
                    st.write(f'- `{item["feature"]}`: `{item["importance"]:.4f}`')


if not all(path.exists() for path in [DATASET_PATH, METRICS_PATH, SUMMARY_PATH, PREDICTIONS_PATH]):
    st.warning("Artifacts are missing. Run `python -m src.student_performance_ai.training` first.")
    st.stop()

dataset = _load_csv(DATASET_PATH)
metrics = _load_json(METRICS_PATH)
summary = _load_json(SUMMARY_PATH)
predictions = _load_csv(PREDICTIONS_PATH)
feature_importance = _load_csv(FEATURE_IMPORTANCE_PATH)
defaults = _default_student_values(dataset)

_render_styles()
if "show_dashboard" not in st.session_state:
    st.session_state.show_dashboard = False
if "phone_layout" not in st.session_state:
    _phone_q = str(st.query_params.get("phone", "0")).lower()
    st.session_state.phone_layout = _phone_q in ("1", "true", "yes")

if not st.session_state.show_dashboard:
    _render_start_screen()
    st.stop()

_render_dashboard(dataset, metrics, summary, predictions, feature_importance, defaults)
