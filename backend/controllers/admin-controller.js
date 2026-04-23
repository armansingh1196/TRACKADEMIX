const supabase = require('../supabaseClient.js');
const bcrypt = require('bcryptjs');

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const adminRegister = async (req, res) => {
    try {
        const { name, email, password, schoolName, branch } = req.body;

        if (!name || !email || !password || !schoolName || !branch) {
            return res.send({ message: 'All fields are required' });
        }

        if (!validateEmail(email)) {
            return res.send({ message: 'Invalid email format' });
        }

        // Check if email exists
        const { data: existingEmails } = await supabase
            .from('admins')
            .select('email')
            .eq('email', email);
        
        if (existingEmails && existingEmails.length > 0) {
            return res.send({ message: 'Email already exists' });
        }

        // Check if school name exists
        const { data: existingSchools } = await supabase
            .from('admins')
            .select('school_name')
            .eq('school_name', schoolName);

        if (existingSchools && existingSchools.length > 0) {
            return res.send({ message: 'Branch Name already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new admin
        const { data, error } = await supabase
            .from('admins')
            .insert([
                { 
                    name, 
                    email, 
                    password: hashedPassword,
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
            _id: data.id,
            role: "Admin",
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

            const isPasswordValid = await bcrypt.compare(password, admin.password);

            if (isPasswordValid) {
                // Map back to frontend format
                const result = {
                    ...admin,
                    _id: admin.id,
                    role: "Admin",
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
                _id: admin.id,
                role: "Admin",
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

const updateAdmin = async (req, res) => {
    try {
        const { name, email, password, schoolName, branch } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = password;
        if (schoolName) updateData.school_name = schoolName;
        if (branch) updateData.branch = branch;

        const { data, error } = await supabase
            .from('admins')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        const result = {
            ...data,
            _id: data.id,
            role: "Admin",
            schoolName: data.school_name,
            password: undefined
        };
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail, updateAdmin };
