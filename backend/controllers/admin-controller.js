const supabase = require('../supabaseClient.js');

const adminRegister = async (req, res) => {
    try {
        const { name, email, password, schoolName, branch } = req.body;

        // Check if email exists
        const { data: existingEmail } = await supabase
            .from('admins')
            .select('email')
            .eq('email', email)
            .single();

        if (existingEmail) {
            return res.send({ message: 'Email already exists' });
        }

        // Check if school name exists
        const { data: existingSchool } = await supabase
            .from('admins')
            .select('school_name')
            .eq('school_name', schoolName)
            .single();

        if (existingSchool) {
            return res.send({ message: 'Branch Name already exists' });
        }

        // Insert new admin
        const { data, error } = await supabase
            .from('admins')
            .insert([
                { 
                    name, 
                    email, 
                    password, // Note: In production, use Supabase Auth or hash this!
                    school_name: schoolName, 
                    branch 
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Map back to frontend expected format
        const result = {
            ...data,
            schoolName: data.school_name,
            password: undefined
        };

        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

const adminLogIn = async (req, res) => {
    const { email, password } = req.body;
    
    if (email && password) {
        try {
            const { data: admin, error } = await supabase
                .from('admins')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !admin) {
                return res.send({ message: "User not found" });
            }

            if (password === admin.password) {
                // Map back to frontend format
                const result = {
                    ...admin,
                    schoolName: admin.school_name,
                    password: undefined
                };
                res.send(result);
            } else {
                res.send({ message: "Invalid password" });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.send({ message: "Email and password are required" });
    }
};

const getAdminDetail = async (req, res) => {
    try {
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (admin) {
            const result = {
                ...admin,
                schoolName: admin.school_name,
                password: undefined
            };
            res.send(result);
        } else {
            res.send({ message: "No HOD found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail };
