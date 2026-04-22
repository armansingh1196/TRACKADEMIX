const supabase = require('../supabaseClient.js');

const complainCreate = async (req, res) => {
    try {
        const { user, complaint, date, school } = req.body;
        const { data, error } = await supabase
            .from('complaints')
            .insert([
                { 
                    user_id: user, 
                    complaint, 
                    date: date || new Date(), 
                    admin_id: school 
                }
            ])
            .select()
            .single();

        if (error) throw error;
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const complainList = async (req, res) => {
    try {
        const { data: complaints, error } = await supabase
            .from('complaints')
            .select(`
                *,
                students ( id, name ),
                teachers ( id, name )
            `)
            .eq('admin_id', req.params.id);

        if (error) throw error;

        if (complaints && complaints.length > 0) {
            // Map to include user name from either student or teacher table
            const result = complaints.map(item => ({
                ...item,
                user: item.students ? { _id: item.students.id, name: item.students.name } : 
                      (item.teachers ? { _id: item.teachers.id, name: item.teachers.name } : null)
            }));
            res.send(result);
        } else {
            res.send({ message: "No complaints found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { complainCreate, complainList };
