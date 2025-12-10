
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUnescoSite() {
    const { data, error } = await supabase
        .from('sites')
        .select('country_slug, slug, name')
        .eq('is_unesco', true)
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching UNESCO site:', error);
        return;
    }

    if (data) {
        console.log(`Found UNESCO site: ${data.name}`);
        console.log(`URL Path: /sites/${data.country_slug}/${data.slug}`);
    } else {
        console.log('No UNESCO sites found.');
    }
}

findUnescoSite();
