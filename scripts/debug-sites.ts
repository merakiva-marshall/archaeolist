
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Log masked key to verify it's loaded
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseKey?.substring(0, 10)}...`);

async function checkSites() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Authenticating as admin...");
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: "admin@archaeolist.com",
        password: "admin-password-123"
    });

    if (authError) {
        console.error("Auth failed:", authError.message);
        return;
    }
    console.log("Authenticated. Now fetching sites...");

    const { data, error, count } = await supabase
        .from('sites')
        .select('*', { count: 'exact' })
        .limit(5);

    if (error) {
        console.error("Error fetching sites:", error);
    } else {
        console.log(`Success! Found ${data?.length} sites.`);
        console.log(`Total count: ${count}`);
        if (data && data.length > 0) {
            console.log("Sample site:", data[0].name);
        } else {
            console.log("Startling! No data returned. This suggests RLS is blocking SELECT for public/anon.");
        }
    }
}

checkSites();
