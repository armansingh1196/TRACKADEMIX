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
                exam_results ( internal_marks, external_marks, marks_obtained, subjects(sub_name) ),
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
        let internalAvg = 60;
        let totalAvg = 70;
        if (student.exam_results && student.exam_results.length > 0) {
            const internals = student.exam_results.filter(e => e.internal_marks !== null).map(e => (e.internal_marks / 30) * 100);
            if (internals.length > 0) internalAvg = internals.reduce((a, b) => a + b, 0) / internals.length;

            const totals = student.exam_results.map(e => e.marks_obtained);
            totalAvg = totals.reduce((a, b) => a + b, 0) / totals.length;
        }

        // Subject Specific Alerts
        const subjectAlerts = [];
        if (student.exam_results && student.exam_results.length > 0) {
            student.exam_results.forEach(exam => {
                const subName = exam.subjects?.sub_name || "Unknown Subject";
                const marks = exam.marks_obtained;
                const internal = exam.internal_marks;
                const external = exam.external_marks;
                
                if (internal !== null && internal < 15) {
                    subjectAlerts.push(`Low internal score in ${subName}. Focus on assignments and class tests.`);
                }
                if (external !== null && external < 35) {
                    subjectAlerts.push(`Weak performance in ${subName} external exams. Needs targeted study.`);
                }
                if (marks !== null && marks < 50) {
                    subjectAlerts.push(`Critical: High risk of failure in ${subName}. Immediate focus required.`);
                }
            });
        }

        // Study Hours (Average per day logged * 7 for weekly)
        let studyHoursPerWeek = 10;
        if (student.study_logs && student.study_logs.length > 0) {
            const totalHours = student.study_logs.reduce((acc, log) => acc + parseFloat(log.hours_logged), 0);
            const avgDaily = totalHours / student.study_logs.length;
            studyHoursPerWeek = avgDaily * 7;
        }

        // CGPA
        let previousGpa = 7.0;
        if (student.semester_results && student.semester_results.length > 0) {
            // Get the latest CGPA
            const latest = student.semester_results.sort((a, b) => b.semester - a.semester)[0];
            if (latest.cgpa) previousGpa = latest.cgpa;
        }

        // Department
        let department = "CSE";

        const inputPayload = {
            attendance_rate: attendanceRate,
            assignment_average: totalAvg, 
            quiz_average: internalAvg,
            internal_exam_score: internalAvg,
            lab_performance: totalAvg, // Synthesized
            study_hours_per_week: studyHoursPerWeek,
            lms_logins_per_week: 5, // Synthesized
            previous_gpa: previousGpa,
            project_score: totalAvg, // Synthesized
            department: department
        };

        // 3. Spawn Python script
        // Note: Assumes Python virtual env is set up in Major Project AI directory
        const pythonScriptPath = path.resolve(__dirname, '../../../Major Project AI/scripts/predict_student.py');
        const pythonExe = path.resolve(__dirname, '../../../Major Project AI/.venv/Scripts/python.exe');
        
        const pythonProcess = spawn(pythonExe, [pythonScriptPath]);

        pythonProcess.stdin.write(JSON.stringify(inputPayload));
        pythonProcess.stdin.end();

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error("Python Error:", errorData);
                return res.status(500).send({ message: "Error running AI model", details: errorData });
            }

            try {
                const parsedResult = JSON.parse(resultData);
                if (parsedResult.error) {
                    return res.status(500).send({ message: parsedResult.error });
                }
                
                // Return payload
                res.send({
                    studentId: studentId,
                    features: inputPayload,
                    ai_insight: parsedResult,
                    subjectAlerts: subjectAlerts,
                    examResults: student.exam_results
                });

            } catch (err) {
                console.error("Failed to parse Python output:", resultData);
                res.status(500).send({ message: "Invalid output from AI model" });
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

module.exports = { getAIRecommendations };
