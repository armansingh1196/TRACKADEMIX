const supabase = require('../supabaseClient.js');
const bcrypt = require('bcryptjs');

// Upload a document (Admin/Teacher)
const documentUpload = async (req, res) => {
    try {
        const { title, category, description, file_url, file_name, file_size, uploaded_by, uploader_role, admin_id, target_class } = req.body;

        if (!title || !category || !file_url || !admin_id) {
            return res.status(400).json({ message: 'Title, category, file URL, and admin ID are required.' });
        }

        const { data, error } = await supabase
            .from('documents')
            .insert([{
                title,
                category,
                description: description || null,
                file_url,
                file_name: file_name || null,
                file_size: file_size || null,
                uploaded_by: uploaded_by || null,
                uploader_role: uploader_role || 'Admin',
                admin_id,
                target_class: target_class || null
            }])
            .select()
            .single();

        if (error) throw error;
        res.send({ ...data, _id: data.id });
    } catch (err) {
        console.error("Error uploading document:", err);
        res.status(500).json({ message: err.message || err });
    }
};

// List documents for admin (all documents)
const documentList = async (req, res) => {
    try {
        const { data: documents, error } = await supabase
            .from('documents')
            .select('*')
            .eq('admin_id', req.params.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (documents && documents.length > 0) {
            const result = documents.map(doc => ({ ...doc, _id: doc.id }));
            res.send(result);
        } else {
            res.send({ message: "No documents found" });
        }
    } catch (err) {
        console.error("Error fetching documents:", err);
        res.status(500).json(err);
    }
};

// List documents for a student (filtered by their class OR general)
const documentListForStudent = async (req, res) => {
    try {
        const { adminId, classId } = req.params;

        const { data: documents, error } = await supabase
            .from('documents')
            .select('*')
            .eq('admin_id', adminId)
            .or(`target_class.is.null,target_class.eq.${classId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (documents && documents.length > 0) {
            const result = documents.map(doc => ({ ...doc, _id: doc.id }));
            res.send(result);
        } else {
            res.send({ message: "No documents found" });
        }
    } catch (err) {
        console.error("Error fetching student documents:", err);
        res.status(500).json(err);
    }
};

// Delete a single document
const deleteDocument = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.send({ ...data, _id: data.id });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json(error);
    }
};

// Delete all documents for an admin
const deleteDocuments = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .delete()
            .eq('admin_id', req.params.id)
            .select();

        if (error || !data || data.length === 0) {
            res.send({ message: "No documents found to delete" });
        } else {
            res.send({ deletedCount: data.length });
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get a signed upload URL from Supabase Storage
const getUploadUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.body;
        const filePath = `uploads/${Date.now()}_${fileName}`;

        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUploadUrl(filePath);

        if (error) throw error;

        // Also get a public URL for the file
        const { data: publicData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        res.send({
            signedUrl: data.signedUrl,
            token: data.token,
            path: filePath,
            publicUrl: publicData.publicUrl
        });
    } catch (err) {
        console.error("Error creating upload URL:", err);
        res.status(500).json({ message: err.message || err });
    }
};

// Bulk upload personal documents (Admin/Teacher)
const personalDocumentBulkUpload = async (req, res) => {
    try {
        const { documents, admin_id, uploaded_by } = req.body;
        // documents should be array of: { rollNum, title, semester, file_url, file_name, file_size }

        if (!documents || documents.length === 0 || !admin_id) {
            return res.status(400).json({ message: 'Documents and admin ID are required.' });
        }

        // Fetch students for these roll numbers in this school
        const rollNums = documents.map(d => d.rollNum);
        const { data: students, error: studentError } = await supabase
            .from('students')
            .select('id, roll_num')
            .eq('admin_id', admin_id)
            .in('roll_num', rollNums);

        if (studentError) throw studentError;

        const studentMap = {};
        students.forEach(s => { studentMap[s.roll_num] = s.id; });

        const toInsert = documents
            .filter(doc => studentMap[doc.rollNum]) // Only insert for found students
            .map(doc => ({
                student_id: studentMap[doc.rollNum],
                title: doc.title,
                semester: doc.semester,
                file_url: doc.file_url,
                file_name: doc.file_name || null,
                file_size: doc.file_size || null,
                uploaded_by: uploaded_by || 'Admin',
                admin_id
            }));

        if (toInsert.length === 0) {
            return res.send({ message: "No matching students found for the provided roll numbers." });
        }

        const { data, error } = await supabase
            .from('personal_documents')
            .insert(toInsert)
            .select();

        if (error) throw error;
        res.send({ message: `${data.length} personal documents uploaded successfully`, count: data.length });
    } catch (err) {
        console.error("Error in personalDocumentBulkUpload:", err);
        res.status(500).json({ message: err.message || err });
    }
};

// Verify student password and fetch personal documents
const verifyAndFetchPersonalDocs = async (req, res) => {
    try {
        const { studentId, password } = req.body;

        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('password')
            .eq('id', studentId)
            .single();

        if (studentError || !student) {
            return res.send({ message: "Student not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, student.password);
        if (!isPasswordValid) {
            return res.send({ message: "Invalid password" });
        }

        const { data: docs, error: docError } = await supabase
            .from('personal_documents')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (docError) throw docError;

        if (docs && docs.length > 0) {
            const result = docs.map(doc => ({ ...doc, _id: doc.id }));
            res.send(result);
        } else {
            res.send({ message: "No documents found" });
        }
    } catch (err) {
        console.error("Error in verifyAndFetchPersonalDocs:", err);
        res.status(500).json(err);
    }
};

module.exports = { documentUpload, documentList, documentListForStudent, deleteDocument, deleteDocuments, getUploadUrl, personalDocumentBulkUpload, verifyAndFetchPersonalDocs };
