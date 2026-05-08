const supabase = require('../supabaseClient.js');
const bcrypt = require('bcryptjs');

const firstNames = ['Arjun', 'Sneha', 'Rahul', 'Priya', 'Amit', 'Neha', 'Rohan', 'Anjali', 'Vikram', 'Pooja', 'Aditya', 'Riya', 'Sandeep', 'Swati', 'Manish', 'Kavita', 'Rajesh', 'Aarti', 'Gaurav', 'Deepa'];
const lastNames = ['Kumar', 'Kumari', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Yadav', 'Mishra', 'Pandey', 'Jha'];

const subjectsTemplate = [
    { name: 'Data Structures', code: 'CS301' },
    { name: 'Algorithms', code: 'CS401' },
    { name: 'Operating Systems', code: 'CS501' },
    { name: 'Database Systems', code: 'CS601' },
    { name: 'Software Engineering', code: 'CS701' }
];

async function seed() {
    try {
        console.log("Starting database seeding...");

        // 1. Create or Get Admin
        const adminEmail = 'cs_hod@college.edu';
        let adminID;
        
        const { data: existingAdmin } = await supabase
            .from('admins')
            .select('id')
            .eq('email', adminEmail)
            .single();

        if (existingAdmin) {
            adminID = existingAdmin.id;
            console.log(`Using existing Admin with ID: ${adminID}`);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            const { data: newAdmin, error: adminError } = await supabase
                .from('admins')
                .insert([{
                    name: 'CS HOD',
                    email: adminEmail,
                    password: hashedPassword,
                    school_name: 'BIT Sindri',
                    branch: 'Computer Science & Engineering',
                    role: 'Admin'
                }])
                .select()
                .single();

            if (adminError) throw adminError;
            adminID = newAdmin.id;
            console.log(`Created new Admin with ID: ${adminID}`);
        }

        // 2. Create Sclasses (Batches)
        const batches = [
            { name: 'CSE-2022', year: 4, semester: 7, batch: '2022' },
            { name: 'CSE-2023', year: 3, semester: 5, batch: '2023' },
            { name: 'CSE-2024', year: 2, semester: 3, batch: '2024' },
            { name: 'CSE-2025', year: 1, semester: 1, batch: '2025' }
        ];

        const salt = await bcrypt.genSalt(10);

        for (const b of batches) {
            let classId;
            const { data: existingClass } = await supabase
                .from('sclasses')
                .select('id')
                .eq('sclass_name', b.name)
                .eq('admin_id', adminID)
                .single();

            if (existingClass) {
                classId = existingClass.id;
                console.log(`Using existing class: ${b.name}`);
            } else {
                const { data: newClass, error: classError } = await supabase
                    .from('sclasses')
                    .insert([{
                        sclass_name: b.name,
                        batch: b.batch,
                        year: b.year,
                        semester: b.semester,
                        admin_id: adminID
                    }])
                    .select()
                    .single();

                if (classError) throw classError;
                classId = newClass.id;
                console.log(`Created class: ${b.name}`);
            }

            // 3. Create Subjects for this class
            console.log(`Creating subjects for ${b.name}...`);
            const classSubjectIds = [];
            for (const s of subjectsTemplate) {
                const subNameForClass = `${s.name} (${b.batch})`;
                const { data: existingSub } = await supabase
                    .from('subjects')
                    .select('id')
                    .eq('sub_name', subNameForClass)
                    .eq('sclass_id', classId)
                    .single();

                if (existingSub) {
                    classSubjectIds.push(existingSub.id);
                } else {
                    const { data: newSub, error: subError } = await supabase
                        .from('subjects')
                        .insert([{
                            sub_name: subNameForClass,
                            sub_code: `${s.code}-${b.batch}`,
                            admin_id: adminID,
                            sclass_id: classId
                        }])
                        .select()
                        .single();

                    if (subError) throw subError;
                    classSubjectIds.push(newSub.id);
                }
            }
            console.log(`Subjects created/verified for ${b.name}`);

            // 4. Create Teachers and link to subjects
            console.log(`Creating teachers for ${b.name}...`);
            for (let i = 0; i < classSubjectIds.length; i++) {
                const subId = classSubjectIds[i];
                const teacherEmail = `teacher_${b.batch}_${i}@college.edu`;
                
                const { data: existingTeacher } = await supabase
                    .from('teachers')
                    .select('id')
                    .eq('email', teacherEmail)
                    .single();

                let teacherId;
                if (existingTeacher) {
                    teacherId = existingTeacher.id;
                } else {
                    const hashedPassword = await bcrypt.hash('password123', salt);
                    const { data: newTeacher, error: teacherError } = await supabase
                        .from('teachers')
                        .insert([{
                            name: `Prof. ${firstNames[i]} (${b.batch})`,
                            email: teacherEmail,
                            password: hashedPassword,
                            admin_id: adminID,
                            role: 'Teacher',
                            teach_sclass_id: classId,
                            teach_subject_id: subId,
                            school_name: 'BIT Sindri'
                        }])
                        .select()
                        .single();

                    if (teacherError) throw teacherError;
                    teacherId = newTeacher.id;
                }

                // Update subject with teacher ID
                await supabase
                    .from('subjects')
                    .update({ teacher_id: teacherId })
                    .eq('id', subId);
            }
            console.log(`Teachers created and linked for ${b.name}`);

            // 5. Create Students (30 per batch)
            console.log(`Populating students for batch ${b.batch}...`);
            const studentsToInsert = [];
            for (let i = 1; i <= 30; i++) {
                const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const name = `${firstName} ${lastName}`;
                const rollNum = `${b.batch}${String(i).padStart(3, '0')}`;
                const birthYear = parseInt(b.batch) - 18;
                const dob = `${birthYear}-05-15`;
                const rollSuffix = rollNum.slice(-3);
                const generatedPassword = `${firstName}@${birthYear}${rollSuffix}`;
                const hashedPassword = await bcrypt.hash(generatedPassword, salt);

                studentsToInsert.push({
                    name,
                    roll_num: rollNum,
                    dob,
                    password: hashedPassword,
                    sclass_id: classId,
                    admin_id: adminID,
                    role: 'Student'
                });
            }

            const { data: insertedStudents, error: studentError } = await supabase
                .from('students')
                .insert(studentsToInsert)
                .select();

            if (studentError) {
                console.error(`Error inserting students for batch ${b.batch}:`, studentError);
            } else {
                console.log(`Inserted 30 students for batch ${b.batch}`);
                
                // 6. Generate Marks for these students
                console.log(`Generating marks for batch ${b.batch}...`);
                const marksToInsert = [];
                for (const student of insertedStudents) {
                    const numSubs = 2 + Math.floor(Math.random() * 2);
                    const selectedSubs = [...classSubjectIds].sort(() => 0.5 - Math.random()).slice(0, numSubs);
                    
                    for (const subId of selectedSubs) {
                        marksToInsert.push({
                            student_id: student.id,
                            subject_id: subId,
                            marks_obtained: 40 + Math.floor(Math.random() * 55)
                        });
                    }
                }

                const { error: marksError } = await supabase
                    .from('exam_results')
                    .insert(marksToInsert);

                if (marksError) console.error(`Error inserting marks for batch ${b.batch}:`, marksError);
                else console.log(`Generated marks for batch ${b.batch}`);
            }
        }

        // 7. Create Notices
        console.log("Creating notices...");
        const noticesData = [
            { title: 'Welcome to New Semester', details: 'The new semester classes will commence from next Monday.', admin_id: adminID },
            { title: 'Mid-Term Exams Schedule', details: 'Mid-term exams will start from the 1st of next month.', admin_id: adminID },
            { title: 'Lab Record Submission', details: 'Please submit your lab records to respective professors by Friday.', admin_id: adminID }
        ];

        const { error: noticeError } = await supabase
            .from('notices')
            .insert(noticesData);

        if (noticeError) console.error("Error creating notices:", noticeError);
        else console.log("Notices created successfully");

        console.log("Database seeding completed successfully!");

    } catch (error) {
        console.error("CRITICAL: Seeding failed:", error);
    }
}

seed();
