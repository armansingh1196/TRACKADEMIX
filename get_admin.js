process.env.SUPABASE_URL = 'https://qlrnimfqdsfrlfnxmuix.supabase.co';
process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscm5pbWZxZHNmcmxmbnhtdWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTI1MDIsImV4cCI6MjA5MjQ2ODUwMn0.RA21kM7cgtzyMQiV5YRD1PgDkA1HPagBIqx4VHRD1vQ';

const supabase = require('./backend/supabaseClient.js');

async function getAdmin() {
    const { data, error } = await supabase.from('admins').select('email').limit(1);
    if (error) console.error(error);
    else console.log(JSON.stringify(data));
}
getAdmin();
