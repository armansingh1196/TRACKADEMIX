const supabase = require('../supabaseClient.js');
const bcrypt = require('bcryptjs');

const teacherRegister = async (req, res) => {
    const { name, email, password, school, teachSubject, teachSclass } = req.body;
    try {
        const { data: existingTeachers } = await supabase
            .from('teachers')
            .select('*')
            .eq('email', email);

        if (existingTeachers && existingTeachers.length > 0) {
            return res.send({ message: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data, error } = await supabase
            .from('teachers')
            .insert([
                { 
                    name, 
                    email, 
                    password: hashedPassword,
                    school_name: school, 
                    teach_sclass_id: teachSclass, 
                    teach_subject_id: teachSubject,
                    admin_id: req.body.adminID // Ensure this is passed
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Update subject with teacher ID
        await supabase
            .from('subjects')
            .update({ teacher_id: data.id })
            .eq('id', teachSubject);

        res.send({ 
            ...data, 
            _id: data.id,
            role: "Teacher",
            password: undefined 
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: teacher, error } = await supabase
            .from('teachers')
            .select(`
                *,
                admins ( id, school_name ),
                sclasses ( id, sclass_name ),
                subjects ( id, sub_name, sessions )
            `)
            .eq('email', email)
            .single();

        if (error || !teacher) {
            return res.send({ message: "Teacher not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, teacher.password);

        if (isPasswordValid) {
            const result = {
                ...teacher,
                _id: teacher.id,
                role: "Teacher",
                teachSubject: teacher.subjects ? {
                    _id: teacher.subjects.id,
                    subName: teacher.subjects.sub_name,
                    sessions: teacher.subjects.sessions
                } : null,
                school: teacher.admins ? {
                    _id: teacher.admins.id,
                    schoolName: teacher.admins.school_name
                } : null,
                teachSclass: teacher.sclasses ? {
                    _id: teacher.sclasses.id,
                    sclassName: teacher.sclasses.sclass_name
                } : null,
                password: undefined
            };
            res.send(result);
        } else {
            res.send({ message: "Invalid password" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        const { data: teachers, error } = await supabase
            .from('teachers')
            .select(`
                *,
                subjects ( id, sub_name ),
                sclasses ( id, sclass_name )
            `)
            .eq('admin_id', req.params.id);

        if (error) throw error;

        const result = teachers.map(teacher => ({
            ...teacher,
            _id: teacher.id,
            teachSubject: teacher.subjects ? {
                _id: teacher.subjects.id,
                subName: teacher.subjects.sub_name
            } : null,
            teachSclass: teacher.sclasses ? {
                _id: teacher.sclasses.id,
                sclassName: teacher.sclasses.sclass_name
            } : null,
            password: undefined
        }));
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        const { data: teacher, error } = await supabase
            .from('teachers')
            .select(`
                *,
                subjects ( id, sub_name, sessions ),
                admins ( id, school_name ),
                sclasses ( id, sclass_name )
            `)
            .eq('id', req.params.id)
            .single();

        if (error || !teacher) {
            return res.send({ message: "No teacher found" });
        }

        const result = {
            ...teacher,
            _id: teacher.id,
            role: "Teacher",
            teachSubject: teacher.subjects ? {
                _id: teacher.subjects.id,
                subName: teacher.subjects.sub_name,
                sessions: teacher.subjects.sessions
            } : null,
            school: teacher.admins ? {
                _id: teacher.admins.id,
                schoolName: teacher.admins.school_name
            } : null,
            teachSclass: teacher.sclasses ? {
                _id: teacher.sclasses.id,
                sclassName: teacher.sclasses.sclass_name
            } : null,
            password: undefined
        };
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const { data: updatedTeacher, error } = await supabase
            .from('teachers')
            .update({ teach_subject_id: teachSubject })
            .eq('id', teacherId)
            .select()
            .single();

        if (error) throw error;

        await supabase
            .from('subjects')
            .update({ teacher_id: teacherId })
            .eq('id', teachSubject);

        res.send(updatedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('teachers')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        // Reset teacher_id in subjects table
        await supabase
            .from('subjects')
            .update({ teacher_id: null })
            .eq('teacher_id', req.params.id);

        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('teachers')
            .delete()
            .eq('admin_id', req.params.id)
            .select();

        if (error || !data || data.length === 0) {
            return res.send({ message: "No teachers found to delete" });
        }

        const teacherIds = data.map(t => t.id);
        await supabase
            .from('subjects')
            .update({ teacher_id: null })
            .in('teacher_id', teacherIds);

        res.send({ deletedCount: data.length });
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('teachers')
            .delete()
            .eq('teach_sclass_id', req.params.id)
            .select();

        if (error || !data || data.length === 0) {
            return res.send({ message: "No teachers found to delete" });
        }

        const teacherIds = data.map(t => t.id);
        await supabase
            .from('subjects')
            .update({ teacher_id: null })
            .in('teacher_id', teacherIds);

        res.send({ deletedCount: data.length });
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;
    try {
        const { data: teacher } = await supabase
            .from('teachers')
            .select('attendance')
            .eq('id', req.params.id)
            .single();

        if (!teacher) return res.send({ message: 'Teacher not found' });

        let attendance = teacher.attendance || [];
        attendance.push({ date, status });

        const { data, error } = await supabase
            .from('teachers')
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

const bulkMarkAttendance = async (req, res) => {
    try {
        const { attendanceData } = req.body; // Array of { student_id, subject_id, teacher_id, sclass_id, date, status }

        if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
            return res.status(400).json({ message: "Invalid attendance data" });
        }

        const { data, error } = await supabase
            .from('attendance_records')
            .insert(attendanceData)
            .select();

        if (error) throw error;

        res.status(200).json({ message: "Attendance marked successfully", data });
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance,
    bulkMarkAttendance
};