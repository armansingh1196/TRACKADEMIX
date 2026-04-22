const supabase = require('../supabaseClient.js');

const subjectCreate = async (req, res) => {
    try {
        const { subjects, sclassName, adminID } = req.body;

        const newSubjects = subjects.map((subject) => ({
            sub_name: subject.subName,
            sub_code: subject.subCode,
            sessions: subject.sessions,
            sclass_id: sclassName,
            admin_id: adminID
        }));

        const { data, error } = await supabase
            .from('subjects')
            .insert(newSubjects)
            .select();

        if (error) throw error;
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const allSubjects = async (req, res) => {
    try {
        const { data: subjects, error } = await supabase
            .from('subjects')
            .select(`
                *,
                sclasses ( id, sclass_name )
            `)
            .eq('admin_id', req.params.id);

        if (error) throw error;

        if (subjects && subjects.length > 0) {
            const result = subjects.map(item => ({
                ...item,
                subName: item.sub_name,
                subCode: item.sub_code,
                sclassName: {
                    _id: item.sclasses.id,
                    sclassName: item.sclasses.sclass_name
                }
            }));
            res.send(result);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const classSubjects = async (req, res) => {
    try {
        const { data: subjects, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('sclass_id', req.params.id);

        if (error) throw error;

        if (subjects && subjects.length > 0) {
            const result = subjects.map(item => ({
                ...item,
                subName: item.sub_name,
                subCode: item.sub_code
            }));
            res.send(result);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const freeSubjectList = async (req, res) => {
    try {
        const { data: subjects, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('sclass_id', req.params.id)
            .is('teacher_id', null);

        if (error) throw error;

        if (subjects && subjects.length > 0) {
            const result = subjects.map(item => ({
                ...item,
                subName: item.sub_name,
                subCode: item.sub_code
            }));
            res.send(result);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSubjectDetail = async (req, res) => {
    try {
        const { data: subject, error } = await supabase
            .from('subjects')
            .select(`
                *,
                sclasses ( id, sclass_name ),
                teachers ( id, name )
            `)
            .eq('id', req.params.id)
            .single();

        if (error || !subject) {
            return res.send({ message: "No subject found" });
        }

        const result = {
            ...subject,
            subName: subject.sub_name,
            subCode: subject.sub_code,
            sclassName: {
                _id: subject.sclasses.id,
                sclassName: subject.sclasses.sclass_name
            },
            teacher: subject.teachers ? {
                _id: subject.teachers.id,
                name: subject.teachers.name
            } : null
        };
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteSubject = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        
        // Reset teach_subject_id in teachers
        await supabase
            .from('teachers')
            .update({ teach_subject_id: null })
            .eq('teach_subject_id', req.params.id);

        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSubjects = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .delete()
            .eq('admin_id', req.params.id)
            .select();

        if (error || !data || data.length === 0) {
            return res.send({ message: "No subjects found to delete" });
        }
        res.send({ deletedCount: data.length });
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSubjectsByClass = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .delete()
            .eq('sclass_id', req.params.id)
            .select();

        if (error || !data || data.length === 0) {
            return res.send({ message: "No subjects found to delete" });
        }
        res.send({ deletedCount: data.length });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { subjectCreate, freeSubjectList, classSubjects, getSubjectDetail, deleteSubjectsByClass, deleteSubjects, deleteSubject, allSubjects };