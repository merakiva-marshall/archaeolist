import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('sites')
    .select('id, name, slug, country, archaeological_site_yn')
    .eq('archaeological_site_yn', false);

  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log(`Found ${data.length} sites with archaeological_site_yn = false`);
  for (const row of data) {
    console.log(`- ${row.name} (${row.country}) - /sites/${row.country}/${row.slug}`);
  }
}

run();
