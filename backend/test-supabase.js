const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mpskjkezcifsameyfxzz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc2tqa2V6Y2lmc2FtZXlmeHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyOTMwOSwiZXhwIjoyMDcwNjA1MzA5fQ.iQ92Ju4O-Ht6XEhfQdToor5_ftA-JEsGAMWZabOT-NQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Test database connection
  const { data, error } = await supabase
    .from('artists')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('Error connecting to Supabase:', error);
    
    // Try to create the artists table if it doesn't exist
    console.log('\nTrying to check if tables exist...');
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables', {});
    
    if (tablesError) {
      console.log('Tables check error:', tablesError.message);
      console.log('\nPlease run the migration SQL in your Supabase dashboard first!');
      console.log('Go to SQL Editor and paste the contents of backend/supabase-migration.sql');
    }
  } else {
    console.log('Successfully connected to Supabase!');
    console.log('Artists table exists');
  }
}

testConnection().catch(console.error);