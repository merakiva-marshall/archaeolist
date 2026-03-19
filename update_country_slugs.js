import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

// We use SERVICE_ROLE_KEY to bypass Row Level Security and ensure we have UPDATE permission.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const dataPath = 'src/data/country-redirects.json';
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const redirectsFile = JSON.parse(rawData);

  console.log(`Loaded ${redirectsFile.redirects.length} redirects. Starting DB updates...`);

  // We map old_country_slug to the correct country strings.
  // The JSON only provides new_country_slug (e.g. 'peru'), but we also need to update
  // the formatted country name column (e.g. 'Peru').
  // Luckily, most of these are straightforward capitalizations (peru -> Peru, syria -> Syria).
  const formatCountryName = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  let successCount = 0;
  let failCount = 0;

  for (const row of redirectsFile.redirects) {
    const { old_country_slug, new_country_slug, site_slug } = row;
    const new_country_name = formatCountryName(new_country_slug);

    console.log(`Updating site '${site_slug}' from '${old_country_slug}' -> '${new_country_slug}' (${new_country_name})`);

    const { error } = await supabase
      .from('sites')
      .update({
        country_slug: new_country_slug,
        country: new_country_name
      })
      .eq('country_slug', old_country_slug)
      .eq('slug', site_slug);

    if (error) {
      console.error(`Failed to update '${site_slug}':`, error.message);
      failCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\nUpdate finished. Success: ${successCount}, Failures: ${failCount}`);
}

run();
