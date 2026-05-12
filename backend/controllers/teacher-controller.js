const supabase = require('../supabaseClient.js');
const bcrypt = require('bcryptjs');
const { signAuthToken } = require('../lib/auth.js');

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
                sclasses ( id, sclass_name, semester, batch ),
                subjects!teachers_teach_subject_id_fkey ( id, sub_name, sessions, subject_type )
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
                    sessions: teacher.subjects.sessions,
                    subjectType: teacher.subjects.subject_type
                } : null,
                school: teacher.admins ? {
                    _id: teacher.admins.id,
                    schoolName: teacher.admins.school_name
                } : null,
                teachSclass: teacher.sclasses ? {
                    _id: teacher.sclasses.id,
                    sclassName: teacher.sclasses.sclass_name,
                    semester: teacher.sclasses.semester,
                    batch: teacher.sclasses.batch
                } : null,
                password: undefined
            };
            const token = signAuthToken({ sub: teacher.id, role: "Teacher" });
            res.send({ ...result, token });
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
                subjects!teachers_teach_subject_id_fkey ( id, sub_name, subject_type ),
                sclasses ( id, sclass_name, semester, batch )
            `)
            .eq('admin_id', req.params.id);

        if (error) throw error;

        const result = teachers.map(teacher => ({
            ...teacher,
            _id: teacher.id,
            teachSubject: teacher.subjects ? {
                _id: teacher.subjects.id,
                subName: teacher.subjects.sub_name,
                subjectType: teacher.subjects.subject_type
            } : null,
            teachSclass: teacher.sclasses ? {
                _id: teacher.sclasses.id,
                sclassName: teacher.sclasses.sclass_name,
                semester: teacher.sclasses.semester,
                batch: teacher.sclasses.batch
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
                subjects!teachers_teach_subject_id_fkey ( id, sub_name, sessions, subject_type ),
                admins ( id, school_name ),
                sclasses ( id, sclass_name, semester, batch )
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
                sessions: teacher.subjects.sessions,
                subjectType: teacher.subjects.subject_type
            } : null,
            school: teacher.admins ? {
                _id: teacher.admins.id,
                schoolName: teacher.admins.school_name
            } : null,
            teachSclass: teacher.sclasses ? {
                _id: teacher.sclasses.id,
                sclassName: teacher.sclasses.sclass_name,
                semester: teacher.sclasses.semester,
                batch: teacher.sclasses.batch
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
            .upsert(attendanceData, { onConflict: 'student_id,subject_id,date' })
            .select();

        if (error) throw error;

        res.status(200).json({ message: "Attendance marked successfully", data });
    } catch (err) {
        res.status(500).json(err);
    }
};

const getAttendanceRecords = async (req, res) => {
    try {
        const { subjectId } = req.params;

        const { data, error } = await supabase
            .from('attendance_records')
            .select(`
                id,
                date,
                status,
                students (
                    id,
                    name,
                    roll_num
                )
            `)
            .eq('subject_id', subjectId)
            .order('date', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const bulkMarkMarks = async (req, res) => {
    try {
        const { marksData } = req.body; // Array of { student_id, subject_id, internal_marks, external_marks, marks_obtained }

        if (!Array.isArray(marksData) || marksData.length === 0) {
            return res.status(400).json({ message: "Invalid marks data" });
        }

        // Fetch subject type to validate limits
        const subjectId = marksData[0].subject_id;
        const { data: subject, error: subError } = await supabase
            .from('subjects')
            .select('subject_type')
            .eq('id', subjectId)
            .single();

        if (subError) throw subError;

        const isPractical = subject && subject.subject_type === 'Practical';
        const maxInternal = isPractical ? 25 : 30;
        const maxExternal = isPractical ? 25 : 70;

        const enrichedMarksData = marksData.map(item => {
            const internal = parseFloat(item.internal_marks) || 0;
            const external = parseFloat(item.external_marks) || 0;
            
            if (internal > maxInternal || external > maxExternal) {
                return res.status(400).json({ message: `Marks exceed limits for ${isPractical ? 'Practical' : 'Theory'} subject` });
            }

            // If marks_obtained is not provided, calculate it as sum of internal and external
            const total = item.marks_obtained !== undefined ? item.marks_obtained : (internal + external);
            return {
                ...item,
                marks_obtained: total
            };
        });

        const { data, error } = await supabase
            .from('exam_results')
            .upsert(enrichedMarksData, { onConflict: 'student_id,subject_id' });

        if (error) throw error;

        res.status(200).json({ message: "Marks updated successfully" });
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
    bulkMarkAttendance,
    getAttendanceRecords,
    bulkMarkMarks
};