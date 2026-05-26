const supabase = require('../supabaseClient.js');
const bcrypt = require('bcryptjs');
const { signAuthToken } = require('../lib/auth.js');

// Deterministic password formula shared by bulk register, update, and resync.
// Format: `${CapitalizedFirstName}@${BirthYear}${last3OfRollNum}`
const buildStudentPassword = ({ name, dob, rollNum }) => {
    const firstName = String(name || '').trim().split(/\s+/)[0] || '';
    const capitalizedFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const yearMatch = String(dob || '').match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : '0000';
    const rollStr = String(rollNum ?? '');
    const rollSuffix = rollStr.length >= 3 ? rollStr.slice(-3) : rollStr;
    return `${capitalizedFirst}@${year}${rollSuffix}`;
};

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

        const { data: student, error } = await supabase
            .from('students')
            .select(`
                id, name, roll_num, dob, password,
                admins ( id, school_name ),
                sclasses ( id, sclass_name, semester, batch )
            `)
            .eq('roll_num', rollNum)
            .eq('name', studentName)
            .single();

        if (error || !student) {
            return res.send({ message: "Student not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, student.password);
        if (!isPasswordValid) {
            return res.send({ message: "Invalid password" });
        }

        const result = {
            _id: student.id,
            role: "Student",
            name: student.name,
            rollNum: student.roll_num,
            dob: student.dob,
            school: {
                _id: student.admins.id,
                schoolName: student.admins.school_name,
            },
            sclassName: {
                _id: student.sclasses.id,
                sclassName: student.sclasses.sclass_name,
                semester: student.sclasses.semester,
                batch: student.sclasses.batch,
            },
        };
        const token = signAuthToken({ sub: student.id, role: "Student" });
        res.send({ ...result, token });
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
                exam_results ( subject_id, internal_marks, external_marks, marks_obtained, subjects ( sub_name, semester, subject_type ) ),
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
        // Normalize incoming field aliases (frontend uses rollNum/sclassName).
        const body = { ...req.body };
        if (body.rollNum !== undefined && body.roll_num === undefined) {
            body.roll_num = body.rollNum;
        }
        delete body.rollNum;
        delete body.sclassName;
        delete body._id;
        delete body.role;
        delete body.school;
        delete body.id;

        // If any field that feeds the deterministic password changes, rehash.
        const passwordInputsTouched =
            body.roll_num !== undefined || body.name !== undefined || body.dob !== undefined;

        if (passwordInputsTouched) {
            const { data: existing, error: fetchErr } = await supabase
                .from('students')
                .select('name, dob, roll_num')
                .eq('id', req.params.id)
                .single();
            if (fetchErr) throw fetchErr;

            const merged = {
                name: body.name ?? existing.name,
                dob: body.dob ?? existing.dob,
                rollNum: body.roll_num ?? existing.roll_num,
            };
            const newPassword = buildStudentPassword(merged);
            const salt = await bcrypt.genSalt(10);
            body.password = await bcrypt.hash(newPassword, salt);
        }

        const { data, error } = await supabase
            .from('students')
            .update(body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.send({ ...data, password: undefined });
    } catch (error) {
        res.status(500).json(error);
    }
};

// Recompute and rehash passwords for every student under an admin using the
// deterministic formula and their CURRENT name/dob/roll_num. Use this once
// after editing roll numbers to bring all login passwords back into pattern.
const resyncStudentPasswords = async (req, res) => {
    try {
        const adminId = req.params.id;
        const { data: students, error } = await supabase
            .from('students')
            .select('id, name, dob, roll_num')
            .eq('admin_id', adminId);
        if (error) throw error;

        const salt = await bcrypt.genSalt(10);
        let updated = 0;
        const skipped = [];

        for (const s of students || []) {
            if (!s.name || !s.dob || s.roll_num === null || s.roll_num === undefined) {
                skipped.push({ id: s.id, reason: 'missing name/dob/roll_num' });
                continue;
            }
            const newPassword = buildStudentPassword({
                name: s.name,
                dob: s.dob,
                rollNum: s.roll_num,
            });
            const hashed = await bcrypt.hash(newPassword, salt);
            const { error: updErr } = await supabase
                .from('students')
                .update({ password: hashed })
                .eq('id', s.id);
            if (updErr) {
                skipped.push({ id: s.id, reason: updErr.message });
            } else {
                updated += 1;
            }
        }

        res.send({ updated, skippedCount: skipped.length, skipped });
    } catch (err) {
        res.status(500).json(err.message ? { message: err.message } : err);
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

// All attendance read/write now flows through attendance_records (the new
// single source of truth used by AI predictions, heatmap, and teacher views).
// The legacy students.attendance JSONB column is no longer touched.

const studentAttendance = async (req, res) => {
    // Frontend sends `subName` containing the subject UUID (see StudentAttendance.js).
    const { subName: subjectId, status, date } = req.body;
    try {
        const { data: student } = await supabase
            .from('students')
            .select('id, sclass_id')
            .eq('id', req.params.id)
            .single();

        if (!student) return res.send({ message: 'Student not found' });

        const { data, error } = await supabase
            .from('attendance_records')
            .upsert({
                student_id: student.id,
                subject_id: subjectId,
                sclass_id: student.sclass_id,
                date,
                status,
            }, { onConflict: 'student_id,subject_id,date' })
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
        const { error } = await supabase
            .from('attendance_records')
            .delete()
            .eq('subject_id', req.params.id);

        if (error) throw error;
        res.send({ message: "Attendance cleared" });
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    try {
        const { data: students, error: fetchErr } = await supabase
            .from('students')
            .select('id')
            .eq('admin_id', req.params.id);
        if (fetchErr) throw fetchErr;

        const ids = (students || []).map(s => s.id);
        if (ids.length === 0) return res.send({ message: "No students" });

        const { error } = await supabase
            .from('attendance_records')
            .delete()
            .in('student_id', ids);

        if (error) throw error;
        res.send({ message: "Attendance cleared" });
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    try {
        const { error } = await supabase
            .from('attendance_records')
            .delete()
            .eq('student_id', req.params.id)
            .eq('subject_id', req.body.subId);

        if (error) throw error;
        res.send({ message: "Attendance cleared" });
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendance = async (req, res) => {
    try {
        const { error } = await supabase
            .from('attendance_records')
            .delete()
            .eq('student_id', req.params.id);

        if (error) throw error;
        res.send({ message: "Attendance cleared" });
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

        // bcrypt.hash is CPU-bound and serialises on Node's libuv pool — wrapping
        // in Promise.all gives the illusion of parallelism with no real speed-up.
        // A sequential loop with a shared salt is clearer and uses the same time.
        const salt = await bcrypt.genSalt(10);
        const processedStudents = [];
        for (const student of students) {
            const generatedPassword = buildStudentPassword({
                name: student.name,
                dob: student.dob,
                rollNum: student.rollNum,
            });
            const hashedPassword = await bcrypt.hash(generatedPassword, salt);
            processedStudents.push({
                name: student.name,
                roll_num: student.rollNum,
                dob: student.dob,
                password: hashedPassword,
                sclass_id: student.sclassName,
                admin_id: adminID,
                // Legacy JSONB columns kept for schema compatibility — no longer
                // the source of truth (see attendance_records).
                attendance: [],
                exam_marks: [],
            });
        }

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
    getAttendanceHeatmap,
    resyncStudentPasswords
};