const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qlrnimfqdsfrlfnxmuix.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscm5pbWZxZHNmcmxmbnhtdWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTI1MDIsImV4cCI6MjA5MjQ2ODUwMn0.RA21kM7cgtzyMQiV5YRD1PgDkA1HPagBIqx4VHRD1vQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const generateRandomMarks = () => {
    // 20 to 100
    return Math.floor(Math.random() * (100 - 20 + 1)) + 20;
};

const dummyComplaints = [
    "Library Wi-Fi is unstable during peak hours.",
    "Requesting additional reference books for Data Structures.",
    "The projector in Room 302 is not functioning properly.",
    "Can we have more practical sessions for the DBMS course?",
    "Water cooler on the 2nd floor needs maintenance.",
    "Requesting extension for the final project submission.",
    "Lab equipment in Physics lab needs calibration.",
    "Please organize more industry expert guest lectures.",
    "Hostel mess food quality has degraded this week.",
    "Need more charging sockets in the central reading room."
];

async function seedDatabase() {
    try {
        console.log("Starting database seeding process...");

        // 1. Fetch all students
        const { data: students, error: studentError } = await supabase
            .from('students')
            .select('id, sclass_id, admin_id');
        
        if (studentError) throw studentError;
        console.log(`Found ${students.length} students.`);

        // 2. Fetch all subjects to map to classes
        const { data: subjects, error: subjectError } = await supabase
            .from('subjects')
            .select('id, sclass_id');
            
        if (subjectError) throw subjectError;
        
        // Group subjects by class
        const subjectsByClass = {};
        subjects.forEach(sub => {
            if (!subjectsByClass[sub.sclass_id]) {
                subjectsByClass[sub.sclass_id] = [];
            }
            subjectsByClass[sub.sclass_id].push(sub.id);
        });

        // 3. Prepare Marks Data
        const marksToUpsert = [];
        const complaintsToInsert = [];

        students.forEach(student => {
            const classSubjects = subjectsByClass[student.sclass_id] || [];
            
            // Assign marks for every subject they are enrolled in
            classSubjects.forEach(subjectId => {
                marksToUpsert.push({
                    student_id: student.id,
                    subject_id: subjectId,
                    marks_obtained: generateRandomMarks()
                });
            });

            // Assign 1-2 random complaints per student
            const numComplaints = Math.floor(Math.random() * 2) + 1; // 1 or 2
            for(let i=0; i<numComplaints; i++) {
                const randomComplaint = dummyComplaints[Math.floor(Math.random() * dummyComplaints.length)];
                complaintsToInsert.push({
                    user_id: student.id,
                    admin_id: student.admin_id,
                    date: new Date().toISOString().split('T')[0],
                    complaint: randomComplaint
                });
            }
        });

        console.log(`Prepared ${marksToUpsert.length} exam result records to insert/upsert.`);
        console.log(`Prepared ${complaintsToInsert.length} complaints to insert.`);

        // 4. Insert/Upsert Marks in chunks
        const chunkSize = 500;
        for (let i = 0; i < marksToUpsert.length; i += chunkSize) {
            const chunk = marksToUpsert.slice(i, i + chunkSize);
            const { error: upsertError } = await supabase
                .from('exam_results')
                .upsert(chunk, { onConflict: 'student_id, subject_id' });
            
            if (upsertError) throw upsertError;
        }
        console.log("Marks populated successfully!");

        // 5. Insert Complaints
        for (let i = 0; i < complaintsToInsert.length; i += chunkSize) {
            const chunk = complaintsToInsert.slice(i, i + chunkSize);
            const { error: complainError } = await supabase
                .from('complaints')
                .insert(chunk);
                
            if (complainError) throw complainError;
        }
        console.log("Complaints populated successfully!");

        console.log("Database seeding completed!");
    } catch (error) {
        console.error("Error during seeding:", error);
    }
}

seedDatabase();
