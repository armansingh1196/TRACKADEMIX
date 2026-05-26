// One-off: copy any rows from the legacy students.attendance JSONB column into
// attendance_records, then delete after run. Service-role required.

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qlrnimfqdsfrlfnxmuix.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    || require('dotenv').config().parsed?.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY in env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

(async () => {
    const { data: students, error } = await supabase
        .from('students')
        .select('id, sclass_id, attendance');

    if (error) {
        console.error('Fetch failed:', error.message || error);
        process.exit(1);
    }

    let toInsert = [];
    let studentsWithLegacy = 0;
    for (const s of students || []) {
        const legacy = Array.isArray(s.attendance) ? s.attendance : [];
        if (legacy.length === 0) continue;
        studentsWithLegacy += 1;

        for (const a of legacy) {
            if (!a || !a.date || !a.status || !a.subName) continue;
            toInsert.push({
                student_id: s.id,
                subject_id: a.subName, // JSONB stored the subject UUID under subName
                sclass_id: s.sclass_id,
                date: a.date,
                status: a.status,
            });
        }
    }

    console.log(`Found ${studentsWithLegacy} students with legacy attendance, ${toInsert.length} records to migrate.`);

    if (toInsert.length === 0) {
        console.log('Nothing to migrate. Done.');
        process.exit(0);
    }

    const { data, error: upsertErr } = await supabase
        .from('attendance_records')
        .upsert(toInsert, { onConflict: 'student_id,subject_id,date' })
        .select('id');

    if (upsertErr) {
        console.error('Upsert failed:', upsertErr.message || upsertErr);
        process.exit(1);
    }

    console.log(`Upserted ${data.length} attendance_records.`);
    console.log('Migration complete. The legacy JSONB column is now ignored by the app.');
    process.exit(0);
})();
