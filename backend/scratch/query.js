const supabase = require('../supabaseClient.js');

async function test() {
    const data = [{
        student_id: '3fcf707a-00ae-4913-8bb9-cbf547ae1173',
        subject_id: '99dd7893-979a-4d03-93b3-86cc065caf2e',
        teacher_id: 'f219f049-3c1b-4040-a972-4481da225a43',
        sclass_id: '10391a4d-22ba-4fe2-90d1-2fcf92787b34',
        date: '2026-05-08',
        status: 'Present'
    }];
    const { data: d1, error: e1 } = await supabase.from('attendance_records').insert(data).select();
    console.log("Insert duplicate:", e1?.message || e1?.code);
}

test();
