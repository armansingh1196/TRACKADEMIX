const supabase = require('../supabaseClient.js');

const sclassCreate = async (req, res) => {
    try {
        const { sclassName, batch, year, semester, adminID } = req.body;

        if (!sclassName || !batch || !adminID) {
            return res.status(400).send({ message: 'Class name, batch, and Admin ID are required' });
        }

        // 1. Check for existing class
        const { data: existingSclasses, error: checkError } = await supabase
            .from('sclasses')
            .select('*')
            .eq('sclass_name', sclassName)
            .eq('admin_id', adminID)
            .eq('batch', batch);

        if (checkError) {
            console.error("Database Check Error:", checkError);
            throw checkError;
        }

        if (existingSclasses && existingSclasses.length > 0) {
            return res.send({ message: 'Sorry this class name already exists for this batch' });
        }

        // 2. Prepare Insert Object (with fallbacks for older schemas)
        const insertData = { 
            sclass_name: sclassName, 
            batch, 
            year: parseInt(year) || 1, 
            semester: parseInt(semester) || 1, 
            admin_id: adminID 
        };

        const { data, error } = await supabase
            .from('sclasses')
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error("Database Insert Error:", error);
            // If error indicates missing columns (year/semester/batch), try inserting without them
            if (error.code === '42703') { // undefined_column
                console.warn("Attempting fallback insert due to missing columns...");
                const fallbackData = { sclass_name: sclassName, admin_id: adminID };
                const { data: fbData, error: fbError } = await supabase
                    .from('sclasses')
                    .insert([fallbackData])
                    .select()
                    .single();
                if (fbError) throw fbError;
                return res.send({ ...fbData, _id: fbData.id, sclassName: fbData.sclass_name, school: fbData.admin_id, message: "Class created with legacy schema (batch/year ignored)" });
            }
            throw error;
        }

        const result = {
            ...data,
            _id: data.id,
            sclassName: data.sclass_name,
            school: data.admin_id
        };
        res.send(result);
    } catch (err) {
        console.error("CRITICAL: Error in sclassCreate:", err);
        res.status(500).json({ 
            message: "Failed to create class. Possible database schema mismatch.", 
            error: err.message || err 
        });
    }
};

const sclassList = async (req, res) => {
    try {
        const { data: sclasses, error } = await supabase
            .from('sclasses')
            .select('*')
            .eq('admin_id', req.params.id)
            .order('batch', { ascending: false })
            .order('sclass_name', { ascending: true });

        if (error) throw error;

        if (sclasses && sclasses.length > 0) {
            const result = sclasses.map(item => ({
                ...item,
                _id: item.id,
                sclassName: item.sclass_name,
                school: item.admin_id
            }));
            res.send(result);
        } else {
            res.send({ message: "No sclasses found" });
        }
    } catch (err) {
        console.error("CRITICAL: Error in sclassList:", err);
        res.status(500).json({ message: "Failed to fetch classes.", error: err.message || err });
    }
};

const promoteBatch = async (req, res) => {
    try {
        const { batch, adminID } = req.body;
        
        // Fetch all classes in this batch
        const { data: sclasses, error: fetchError } = await supabase
            .from('sclasses')
            .select('*')
            .eq('batch', batch)
            .eq('admin_id', adminID);

        if (fetchError) throw fetchError;

        const results = await Promise.all(sclasses.map(async (sclass) => {
            const nextSemester = (sclass.semester || 1) + 1;
            const nextYear = Math.ceil(nextSemester / 2);
            
            if (nextSemester > 8) {
                return { id: sclass.id, status: 'graduated' };
            }

            const { data, error } = await supabase
                .from('sclasses')
                .update({ 
                    semester: nextSemester,
                    year: nextYear
                })
                .eq('id', sclass.id)
                .select()
                .single();
            
            return error ? { id: sclass.id, error } : data;
        }));

        res.send({ message: "Batch promoted successfully", results });
    } catch (err) {
        console.error("Error in promoteBatch:", err);
        res.status(500).json(err);
    }
};

const getSclassDetail = async (req, res) => {
    try {
        const { data: sclass, error } = await supabase
            .from('sclasses')
            .select(`
                *,
                admins ( id, school_name )
            `)
            .eq('id', req.params.id)
            .single();

        if (error || !sclass) return res.send({ message: "No class found" });

        const result = {
            ...sclass,
            _id: sclass.id,
            sclassName: sclass.sclass_name,
            school: sclass.admins ? {
                _id: sclass.admins.id,
                schoolName: sclass.admins.school_name
            } : null
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
                _id: student.id,
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

        if (error || !data) return res.send({ message: "Class not found" });
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

        if (error || !data || data.length === 0) return res.send({ message: "No classes found to delete" });
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { 
    sclassCreate, 
    sclassList, 
    promoteBatch,
    deleteSclass, 
    deleteSclasses, 
    getSclassDetail, 
    getSclassStudents 
};