const supabase = require('../supabaseClient.js');

const noticeCreate = async (req, res) => {
    try {
        const { title, details, date, adminID } = req.body;
        const { data, error } = await supabase
            .from('notices')
            .insert([
                { 
                    title, 
                    details, 
                    date: date || new Date(), 
                    admin_id: adminID 
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

const noticeList = async (req, res) => {
    try {
        const { data: notices, error } = await supabase
            .from('notices')
            .select('*')
            .eq('admin_id', req.params.id);

        if (error) throw error;

        if (notices && notices.length > 0) {
            res.send(notices);
        } else {
            res.send({ message: "No notices found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateNotice = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notices')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteNotice = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notices')
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

const deleteNotices = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notices')
            .delete()
            .eq('admin_id', req.params.id)
            .select();

        if (error || !data || data.length === 0) {
            res.send({ message: "No notices found to delete" });
        } else {
            res.send({ deletedCount: data.length });
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { noticeCreate, noticeList, updateNotice, deleteNotice, deleteNotices };