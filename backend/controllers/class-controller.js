const supabase = require('../supabaseClient.js');

const sclassCreate = async (req, res) => {
    try {
        const { sclassName, adminID } = req.body;

        const { data: existingSclass } = await supabase
            .from('sclasses')
            .select('*')
            .eq('sclass_name', sclassName)
            .eq('admin_id', adminID)
            .single();

        if (existingSclass) {
            res.send({ message: 'Sorry this class name already exists' });
        } else {
            const { data, error } = await supabase
                .from('sclasses')
                .insert([
                    { sclass_name: sclassName, admin_id: adminID }
                ])
                .select()
                .single();

            if (error) throw error;
            
            // Map to frontend format
            const result = {
                ...data,
                sclassName: data.sclass_name,
                school: data.admin_id
            };
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const sclassList = async (req, res) => {
    try {
        const { data: sclasses, error } = await supabase
            .from('sclasses')
            .select('*')
            .eq('admin_id', req.params.id);

        if (error) throw error;

        if (sclasses && sclasses.length > 0) {
            const result = sclasses.map(item => ({
                ...item,
                sclassName: item.sclass_name,
                school: item.admin_id
            }));
            res.send(result);
        } else {
            res.send({ message: "No sclasses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSclassDetail = async (req, res) => {
    try {
        const { data: sclass, error } = await supabase
            .from('sclasses')
            .select(`
                *,
                admins (
                    id,
                    school_name
                )
            `)
            .eq('id', req.params.id)
            .single();

        if (error || !sclass) {
            return res.send({ message: "No class found" });
        }

        const result = {
            ...sclass,
            sclassName: sclass.sclass_name,
            school: {
                _id: sclass.admins.id,
                schoolName: sclass.admins.school_name
            }
        };
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSclassStudents = async (req, res) => {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('*')
            .eq('sclass_id', req.params.id);

        if (error) throw error;

        if (students && students.length > 0) {
            const result = students.map(student => ({
                ...student,
                sclassName: student.sclass_id,
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

const deleteSclass = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sclasses')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !data) {
            return res.send({ message: "Class not found" });
        }
        
        // Cascading deletes are handled by PostgreSQL (ON DELETE CASCADE)
        // so we don't need to manually delete students/subjects here
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSclasses = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sclasses')
            .delete()
            .eq('admin_id', req.params.id)
            .select();

        if (error || !data || data.length === 0) {
            return res.send({ message: "No classes found to delete" });
        }
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents };