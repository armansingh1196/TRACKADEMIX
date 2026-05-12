const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key missing in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedAttendance() {
    try {
        console.log("Fetching students and subjects...");
        const { data: students } = await supabase.from('students').select('id, sclass_id');
        const { data: subjects } = await supabase.from('subjects').select('id');

        if (!students || !subjects) {
            console.error("Failed to fetch students or subjects");
            return;
        }

        console.log(`Found ${students.length} students and ${subjects.length} subjects.`);

        const attendanceRecords = [];
        const statuses = ['Present', 'Present', 'Present', 'Absent']; // 75% Present rate on average
        
        // Seed for the last 30 days
        const today = new Date();
        
        for (let student of students) {
            for (let subject of subjects) {
                for (let i = 0; i < 30; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    
                    // Skip weekends
                    if (date.getDay() === 0 || date.getDay() === 6) continue;

                    // Randomly decide if class happened (say 70% chance)
                    if (Math.random() > 0.7) continue;

                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    
                    attendanceRecords.push({
                        student_id: student.id,
                        subject_id: subject.id,
                        sclass_id: student.sclass_id,
                        date: date.toISOString().slice(0, 10),
                        status: status
                    });
                }
            }
        }

        console.log(`Generated ${attendanceRecords.length} attendance records. Inserting in batches...`);

        // Insert in batches of 1000
        const batchSize = 1000;
        for (let i = 0; i < attendanceRecords.length; i += batchSize) {
            const batch = attendanceRecords.slice(i, i + batchSize);
            const { error } = await supabase.from('attendance_records').upsert(batch, { onConflict: 'student_id,subject_id,date' });
            if (error) {
                console.error(`Error inserting batch ${i}:`, error);
            } else {
                console.log(`Inserted/Updated batch starting at ${i}`);
            }
        }

        console.log("Attendance seeding complete!");

    } catch (error) {
        console.error("Seeding failed:", error);
    }
}

seedAttendance();
