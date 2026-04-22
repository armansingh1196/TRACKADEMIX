const supabase = require('../supabaseClient.js');

const studentRegister = async (req, res) => {
    try {
        const { name, rollNum, password, sclassName, adminID, attendance, examResult } = req.body;

        const { data: existingStudent } = await supabase
            .from('students')
            .select('*')
            .eq('roll_num', rollNum)
            .eq('admin_id', adminID)
            .eq('sclass_id', sclassName)
            .single();

        if (existingStudent) {
            res.send({ message: 'Roll Number already exists' });
        } else {
            const { data, error } = await supabase
                .from('students')
                .insert([
                    { 
                        name, 
                        roll_num: rollNum, 
                        password, // Note: In production, hash this!
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
                sclasses ( id, sclass_name )
            `)
            .eq('roll_num', rollNum)
            .eq('name', studentName)
            .single();

        if (error || !student) {
            return res.send({ message: "Student not found" });
        }

        if (password === student.password) {
            const result = {
                ...student,
                school: {
                    _id: student.admins.id,
                    schoolName: student.admins.school_name
                },
                sclassName: {
                    _id: student.sclasses.id,
                    sclassName: student.sclasses.sclass_name
                },
                password: undefined,
                examResult: undefined,
                attendance: undefined
            };
            res.send(result);
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
                sclasses ( id, sclass_name )
            `)
            .eq('admin_id', req.params.id);

        if (error) throw error;

        if (students && students.length > 0) {
            const result = students.map(student => ({
                ...student,
                sclassName: {
                    _id: student.sclasses.id,
                    sclassName: student.sclasses.sclass_name
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
                sclasses ( id, sclass_name )
            `)
            .eq('id', req.params.id)
            .single();

        if (error || !student) {
            return res.send({ message: "No student found" });
        }

        const result = {
            ...student,
            rollNum: student.roll_num,
            school: {
                _id: student.admins.id,
                schoolName: student.admins.school_name
            },
            sclassName: {
                _id: student.sclasses.id,
                sclassName: student.sclasses.sclass_name
            },
            password: undefined,
            examResult: student.exam_marks || [],
            attendance: student.attendance || []
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
    const { subName, marksObtained } = req.body;
    try {
        const { data: student } = await supabase
            .from('students')
            .select('exam_marks')
            .eq('id', req.params.id)
            .single();

        if (!student) return res.send({ message: 'Student not found' });

        let examMarks = student.exam_marks || [];
        const index = examMarks.findIndex(item => item.subName === subName);
        if (index > -1) {
            examMarks[index].marksObtained = marksObtained;
        } else {
            examMarks.push({ subName, marksObtained });
        }

        const { data, error } = await supabase
            .from('students')
            .update({ exam_marks: examMarks })
            .eq('id', req.params.id)
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

module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
};