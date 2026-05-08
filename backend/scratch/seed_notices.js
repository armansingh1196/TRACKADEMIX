const supabase = require('../supabaseClient.js');

async function seedNotices() {
    try {
        console.log("Seeding notices...");
        
        // Get the admin we created earlier
        const { data: admin } = await supabase
            .from('admins')
            .select('id')
            .eq('email', 'cs_hod@college.edu')
            .single();

        if (!admin) {
            console.error("Admin not found. Run the main seed script first.");
            return;
        }

        const adminID = admin.id;
        const today = new Date().toISOString().split('T')[0];

        const noticesData = [
            { title: 'Welcome to New Semester', details: 'The new semester classes will commence from next Monday.', admin_id: adminID, date: today },
            { title: 'Mid-Term Exams Schedule', details: 'Mid-term exams will start from the 1st of next month.', admin_id: adminID, date: today },
            { title: 'Lab Record Submission', details: 'Please submit your lab records to respective professors by Friday.', admin_id: adminID, date: today }
        ];

        const { error: noticeError } = await supabase
            .from('notices')
            .insert(noticesData);

        if (noticeError) {
            console.error("Error creating notices:", noticeError);
        } else {
            console.log("Notices created successfully!");
        }

    } catch (error) {
        console.error("CRITICAL: Notice seeding failed:", error);
    }
}

seedNotices();
