const supabase = require('../supabaseClient.js');
const { spawn } = require('child_process');
const path = require('path');

const getAIRecommendations = async (req, res) => {
    try {
        const studentId = req.params.id;

        // 1. Fetch student data (attendance, exam marks, study hours, cgpa)
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select(`
                *,
                sclasses ( sclass_name ),
                exam_results ( internal_marks, external_marks, marks_obtained, subjects(sub_name, subject_type) ),
                attendance_records ( status ),
                study_logs ( hours_logged ),
                semester_results ( cgpa )
            `)
            .eq('id', studentId)
            .single();

        if (studentError || !student) {
            return res.status(404).send({ message: "Student not found" });
        }

        // 2. Aggregate Data
        // Attendance Rate
        let attendanceRate = 75; // Default
        if (student.attendance_records && student.attendance_records.length > 0) {
            const present = student.attendance_records.filter(a => a.status === 'Present').length;
            attendanceRate = (present / student.attendance_records.length) * 100;
        }

        // Exam Marks
        let internalAvgTheory = 20;
        let externalAvgTheory = 45;
        let internalAvgPractical = 18;
        let externalAvgPractical = 18;

        let activeExams = [];
        if (student.exam_results && student.exam_results.length > 0) {
            // Find max semester available in exam results
            let maxSem = 1;
            student.exam_results.forEach(e => {
                const sem = parseInt(e.subjects?.semester || 1);
                if (sem > maxSem) maxSem = sem;
            });
            
            activeExams = student.exam_results.filter(e => parseInt(e.subjects?.semester || 1) === maxSem);

            const theoryExams = activeExams.filter(e => e.subjects?.subject_type === 'Theory' || !e.subjects?.subject_type);
            const practicalExams = activeExams.filter(e => e.subjects?.subject_type === 'Practical');

            if (theoryExams.length > 0) {
                const internals = theoryExams.filter(e => e.internal_marks !== null).map(e => e.internal_marks);
                if (internals.length > 0) internalAvgTheory = internals.reduce((a, b) => a + b, 0) / internals.length;

                const externals = theoryExams.filter(e => e.external_marks !== null).map(e => e.external_marks);
                if (externals.length > 0) externalAvgTheory = externals.reduce((a, b) => a + b, 0) / externals.length;
            }

            if (practicalExams.length > 0) {
                const internals = practicalExams.filter(e => e.internal_marks !== null).map(e => e.internal_marks);
                if (internals.length > 0) internalAvgPractical = internals.reduce((a, b) => a + b, 0) / internals.length;

                const externals = practicalExams.filter(e => e.external_marks !== null).map(e => e.external_marks);
                if (externals.length > 0) externalAvgPractical = externals.reduce((a, b) => a + b, 0) / externals.length;
            }
        }

        // Subject Specific Alerts
        const subjectAlerts = [];
        if (activeExams.length > 0) {
            activeExams.forEach(exam => {
                const subName = exam.subjects?.sub_name || "Unknown Subject";
                const isPractical = exam.subjects?.subject_type === 'Practical';
                const internal = exam.internal_marks;
                const external = exam.external_marks;
                
                const minInternal = isPractical ? 8 : 12; // 40%
                const minExternal = isPractical ? 12 : 28; // 40%
                
                if (internal !== null && internal < minInternal) {
                    if (external === null) {
                        subjectAlerts.push(`Mid-term warning: Low internal score (${internal}) in ${subName}. You must perform exceptionally well in external finals to pass.`);
                    } else {
                        subjectAlerts.push(`Low internal score in ${subName}. Focus on continuous assessment.`);
                    }
                }
                if (external !== null && external < minExternal) {
                    subjectAlerts.push(`Weak performance in ${subName} external exams. Needs targeted study.`);
                }
            });
        }

        // Study Hours (Average per day logged * 7 for weekly)
        let studyHoursPerWeek = 15;
        if (student.study_logs && student.study_logs.length > 0) {
            const totalHours = student.study_logs.reduce((acc, log) => acc + parseFloat(log.hours_logged), 0);
            const avgDaily = totalHours / student.study_logs.length;
            studyHoursPerWeek = avgDaily * 7;
        }

        // CGPA
        let previousGpa = 7.5;
        if (student.semester_results && student.semester_results.length > 0) {
            const latest = student.semester_results.sort((a, b) => b.semester - a.semester)[0];
            if (latest.cgpa) previousGpa = latest.cgpa;
        }

        // Department (Extract from class name if available, e.g. "CSE-2022" -> "CSE")
        let department = "CSE";
        if (student.sclasses?.sclass_name) {
            const match = student.sclasses.sclass_name.match(/^([A-Z]+)/);
            if (match) department = match[1];
        }

        const inputPayload = {
            student_id: studentId,
            attendance_rate: attendanceRate,
            internal_avg_theory: internalAvgTheory,
            external_avg_theory: externalAvgTheory,
            internal_avg_practical: internalAvgPractical,
            external_avg_practical: externalAvgPractical,
            study_hours_per_week: studyHoursPerWeek,
            previous_gpa: previousGpa,
            department: department
        };

        // Read metrics.json
        const fs = require('fs');
        const metricsPath = path.resolve(__dirname, '../../ai-trackademics/artifacts/metrics.json');
        let modelMetrics = { accuracy: 0.9375, model_type: "Random Forest" }; // Fallback
        try {
            if (fs.existsSync(metricsPath)) {
                modelMetrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            }
        } catch (e) {
            console.error("Error reading metrics:", e);
        }

        // 3. Bypass Python script (Deterministic logic now handled on React Frontend)
        res.send({
            studentId: studentId,
            features: inputPayload,
            ai_insight: { performanceBand: "Medium", recommendations: [] }, // Frontend overrides this
            subjectAlerts: subjectAlerts,
            examResults: student.exam_results,
            modelMetrics: modelMetrics
        });


    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

module.exports = { getAIRecommendations };
