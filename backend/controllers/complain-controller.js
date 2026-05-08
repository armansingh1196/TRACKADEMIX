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
        res.send({ ...data, _id: data.id });
    } catch (err) {
        res.status(500).json(err);
    }
};

const complainList = async (req, res) => {
    try {
        const { data: complaints, error } = await supabase
            .from('complaints')
            .select('*')
            .eq('admin_id', req.params.id);

        if (error) throw error;

        if (complaints && complaints.length > 0) {
            const userIds = [...new Set(complaints.map(c => c.user_id).filter(Boolean))];
            
            const { data: students } = await supabase
                .from('students')
                .select('id, name')
                .in('id', userIds);
                
            const { data: teachers } = await supabase
                .from('teachers')
                .select('id, name')
                .in('id', userIds);
                
            const userMap = {};
            if (students) students.forEach(s => userMap[s.id] = { _id: s.id, name: s.name });
            if (teachers) teachers.forEach(t => userMap[t.id] = { _id: t.id, name: t.name });

            const result = complaints.map(item => ({
                ...item,
                _id: item.id,
                user: userMap[item.user_id] || { _id: item.user_id, name: "Unknown User" }
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
