import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const csvPath = 'docs/Archaeolist Page Analytics - Dec 25 to Mar 26.csv';
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  
  // Extract all paths that received traffic
  const lines = csvData.split('\n');
  const slugsWithTraffic = new Set();
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    // Quick parse: split by comma, the page path is the second column (usually)
    // There might be commas in the title.
    // Let's use string operations or better logic
    // But page path usually starts with /
    const parts = line.split(',');
    let pathStr = parts.find(p => p.startsWith('/'));
    if (!pathStr) {
      // maybe quoted? Just find the first occurrence of '/' that looks like a path
      const match = line.match(/,\/([^,]*),/);
      if (match) pathStr = '/' + match[1];
    }
    
    if (pathStr) {
      // Paths are like /sites/italy/pompeii
      if (pathStr.startsWith('/sites/')) {
        const segments = pathStr.split('/');
        if (segments.length >= 4) {
          const slug = segments[3];
          slugsWithTraffic.add(slug);
        } else if (segments.length === 3) {
          // just /sites/country or /sites/slug?
          // The title usually tells us. If it's a 404 for /sites/slug, it's length 3.
          // Let's just track all segments
          slugsWithTraffic.add(segments[2]);
        }
      }
    }
  }

  const { data, error } = await supabase
    .from('sites')
    .select('id, name, slug, country, archaeological_site_yn')
    .eq('archaeological_site_yn', false);

  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  let updatedCount = 0;
  for (const row of data) {
    if (slugsWithTraffic.has(row.slug)) {
      console.log(`Setting ${row.slug} to true...`);
      const { error: updateError } = await supabase
        .from('sites')
        .update({ archaeological_site_yn: true })
        .eq('id', row.id);
        
      if (updateError) {
        console.error('Update error for', row.id, updateError);
      } else {
        updatedCount++;
      }
    }
  }
  console.log(`Updated ${updatedCount} sites.`);
}

run();
