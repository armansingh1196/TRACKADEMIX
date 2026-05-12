const supabase = require('../supabaseClient.js');
const bcrypt = require('bcryptjs');
const { signAuthToken } = require('../lib/auth.js');

const studentRegister = async (req, res) => {
    try {
        const { name, rollNum, password, sclassName, adminID, attendance, examResult } = req.body;

        const { data: existingStudents } = await supabase
            .from('students')
            .select('*')
            .eq('roll_num', rollNum)
            .eq('admin_id', adminID)
            .eq('sclass_id', sclassName);

        if (existingStudents && existingStudents.length > 0) {
            res.send({ message: 'Roll Number already exists' });
        } else {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const { data, error } = await supabase
                .from('students')
                .insert([
                    { 
                        name, 
                        roll_num: rollNum, 
                        dob: req.body.dob || null,
                        password: hashedPassword,
                        sclass_id: sclassName, 
                        admin_id: adminID,
                        attendance: attendance || [],
                        exam_marks: examResult || []
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            const result = {
                ...data,
                _id: data.id,
                role: "Student",
                rollNum: data.roll_num,
                sclassName: data.sclass_id,
                school: data.admin_id,
                password: undefined
            };
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const studentLogIn = async (req, res) => {
    try {
        const { rollNum, studentName, password } = req.body;
        
        let { data: student, error } = await supabase
            .from('students')
            .select(`
                *,
                admins ( id, school_name ),
                sclasses ( id, sclass_name, semester, batch ),
                exam_results ( subject_id, marks_obtained, subjects ( sub_name, semester, subject_type ) )
            `)
            .eq('roll_num', rollNum)
            .eq('name', studentName)
            .single();

        if (error || !student) {
            return res.send({ message: "Student not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, student.password);

        if (isPasswordValid) {
            const result = {
                ...student,
                _id: student.id,
                role: "Student",
                school: {
                    _id: student.admins.id,
                    schoolName: student.admins.school_name
                },
                sclassName: {
                    _id: student.sclasses.id,
                    sclassName: student.sclasses.sclass_name,
                    semester: student.sclasses.semester,
                    batch: student.sclasses.batch
                },
                password: undefined,
                examResult: undefined,
                attendance: undefined
            };
            const token = signAuthToken({ sub: student.id, role: "Student" });
            res.send({ ...result, token });
        } else {
            res.send({ message: "Invalid password" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select(`
                *,
                sclasses ( id, sclass_name, semester, batch )
            `)
            .eq('admin_id', req.params.id);

        if (error) throw error;

        if (students && students.length > 0) {
            const result = students.map(student => ({
                ...student,
                _id: student.id,
                rollNum: student.roll_num,
                sclassName: {
                    _id: student.sclasses.id,
                    sclassName: student.sclasses.sclass_name,
                    semester: student.sclasses.semester,
                    batch: student.sclasses.batch
                },
                password: undefined
            }));
            res.send(result);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        const { data: student, error } = await supabase
            .from('students')
            .select(`
                *,
                admins ( id, school_name ),
                sclasses ( id, sclass_name, semester, batch ),
                exam_results ( subject_id, marks_obtained, subjects ( sub_name, semester, subject_type ) ),
                attendance_records ( date, status, subject_id, subjects ( sub_name ) )
            `)
            .eq('id', req.params.id)
            .single();

        if (error || !student) {
            return res.send({ message: "No student found" });
        }

        const result = {
            ...student,
            _id: student.id,
            role: "Student",
            rollNum: student.roll_num,
            school: {
                _id: student.admins.id,
                schoolName: student.admins.school_name
            },
            sclassName: {
                _id: student.sclasses.id,
                sclassName: student.sclasses.sclass_name,
                semester: student.sclasses.semester,
                batch: student.sclasses.batch
            },
            password: undefined,
            examResult: student.exam_results || [],
            attendance: (student.attendance_records || []).map(a => ({
                date: a.date,
                status: a.status,
                subName: a.subjects?.sub_name || "N/A",
                subId: a.subject_id
            }))
        };
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteStudents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .delete()
            .eq('admin_id', req.params.id)
            .select();

        if (error || !data || data.length === 0) {
            res.send({ message: "No students found to delete" });
        } else {
            res.send({ deletedCount: data.length });
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteStudentsByClass = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .delete()
            .eq('sclass_id', req.params.id)
            .select();

        if (error || !data || data.length === 0) {
            res.send({ message: "No students found to delete" });
        } else {
            res.send({ deletedCount: data.length });
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

const updateStudent = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.send({ ...data, password: undefined });
    } catch (error) {
        res.status(500).json(error);
    }
};

const updateExamResult = async (req, res) => {
    const { subName, internalMarks, externalMarks, marksObtained } = req.body; 
    try {
        // Fallback to marksObtained if old UI is used, else sum internal/external
        let totalMarks = marksObtained ? parseInt(marksObtained) : 0;
        let intMarks = internalMarks !== undefined ? parseInt(internalMarks) : null;
        let extMarks = externalMarks !== undefined ? parseInt(externalMarks) : null;
        
        if (intMarks !== null && extMarks !== null) {
            totalMarks = intMarks + extMarks;
        }

        const { data, error } = await supabase
            .from('exam_results')
            .upsert({ 
                student_id: req.params.id, 
                subject_id: subName, 
                internal_marks: intMarks,
                external_marks: extMarks,
                marks_obtained: totalMarks 
            }, { onConflict: 'student_id,subject_id' })
            .select()
            .single();

        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;
    try {
        const { data: student } = await supabase
            .from('students')
            .select('attendance')
            .eq('id', req.params.id)
            .single();

        if (!student) return res.send({ message: 'Student not found' });

        let attendance = student.attendance || [];
        attendance.push({ date, status, subName });

        const { data, error } = await supabase
            .from('students')
            .update({ attendance })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    try {
        // This is complex with JSONB, but for simplicity:
        const { data: students } = await supabase
            .from('students')
            .select('id, attendance');
        
        for (let student of students) {
            const filtered = (student.attendance || []).filter(a => a.subName !== req.params.id);
            await supabase.from('students').update({ attendance: filtered }).eq('id', student.id);
        }
        res.send({ message: "Attendance cleared" });
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .update({ attendance: [] })
            .eq('admin_id', req.params.id)
            .select();
        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId;
    try {
        const { data: student } = await supabase
            .from('students')
            .select('attendance')
            .eq('id', studentId)
            .single();
        
        const filtered = (student.attendance || []).filter(a => a.subName !== subName);
        const { data, error } = await supabase
            .from('students')
            .update({ attendance: filtered })
            .eq('id', studentId)
            .select()
            .single();
        
        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendance = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .update({ attendance: [] })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const getAttendanceHeatmap = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('attendance_records')
            .select('date, status')
            .eq('student_id', id);

        if (error) throw error;

        // Group by date and calculate intensity
        const heatmapData = data.reduce((acc, curr) => {
            const date = curr.date;
            if (!acc[date]) {
                acc[date] = { date, count: 0, total: 0 };
            }
            acc[date].total += 1;
            if (curr.status === 'Present') {
                acc[date].count += 1;
            }
            return acc;
        }, {});

        res.status(200).json(Object.values(heatmapData));
    } catch (err) {
        res.status(500).json(err);
    }
};

const studentBulkRegister = async (req, res) => {
    try {
        const { students, adminID } = req.body;
        
        const salt = await bcrypt.genSalt(10);
        const processedStudents = await Promise.all(students.map(async (student) => {
            // Generate Deterministic Password
            const firstName = student.name.split(' ')[0];
            const capitalizedFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
            
            // Extract Year from DOB (assumes YYYY-MM-DD or DD-MM-YYYY)
            // A simple regex to find a 4 digit year
            const yearMatch = student.dob.match(/\d{4}/);
            const year = yearMatch ? yearMatch[0] : "0000";
            
            const rollStr = String(student.rollNum);
            const rollSuffix = rollStr.length >= 3 ? rollStr.slice(-3) : rollStr;
            const generatedPassword = `${capitalizedFirst}@${year}${rollSuffix}`;

            const hashedPassword = await bcrypt.hash(generatedPassword, salt);
            return {
                name: student.name,
                roll_num: student.rollNum,
                dob: student.dob,
                password: hashedPassword,
                sclass_id: student.sclassName,
                admin_id: adminID,
                attendance: [],
                exam_marks: []
            };
        }));

        const { data, error } = await supabase
            .from('students')
            .insert(processedStudents)
            .select();

        if (error) throw error;
        res.send({ message: `${data.length} students registered successfully`, count: data.length });
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateSemesterResult = async (req, res) => {
    const { semester, sgpa, cgpa } = req.body;
    try {
        const { data, error } = await supabase
            .from('semester_results')
            .upsert({ 
                student_id: req.params.id, 
                semester: parseInt(semester),
                sgpa: parseFloat(sgpa),
                cgpa: parseFloat(cgpa)
            }, { onConflict: 'student_id,semester' })
            .select()
            .single();

        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const addStudyLog = async (req, res) => {
    const { date, hoursLogged } = req.body;
    try {
        // Check if log already exists for today
        const { data: existingLog } = await supabase
            .from('study_logs')
            .select('*')
            .eq('student_id', req.params.id)
            .eq('date', date);

        if (existingLog && existingLog.length > 0) {
            return res.status(400).json({ message: "You have already logged study hours for today." });
        }

        const { data, error } = await supabase
            .from('study_logs')
            .insert({ 
                student_id: req.params.id, 
                date: date,
                hours_logged: parseFloat(hoursLogged)
            })
            .select()
            .single();

        if (error) throw error;
        res.send(data);
    } catch (error) {
        console.error("Error in addStudyLog:", error);
        res.status(500).json({ message: error.message || error });
    }
};

const checkStudyLog = async (req, res) => {
    const date = new Date().toISOString().slice(0, 10);
    try {
        const { data: existingLog } = await supabase
            .from('study_logs')
            .select('*')
            .eq('student_id', req.params.id)
            .eq('date', date);

        if (existingLog && existingLog.length > 0) {
            return res.send({ hasLogged: true });
        }
        res.send({ hasLogged: false });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    studentRegister,
    studentBulkRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    updateSemesterResult,
    addStudyLog,
    checkStudyLog,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
    getAttendanceHeatmap
};