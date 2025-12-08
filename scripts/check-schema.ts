
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function checkSchema() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if column exists by selecting it
    const { data, error } = await supabase
        .from('sites')
        .select('name, last_viator_sync')
        .limit(1);

    if (error) {
        console.error("Column check failed:", error.message);
        if (error.message.includes("does not exist")) {
            console.log("Column 'last_viator_sync' likely MISSING.");
        }
    } else {
        console.log("Column 'last_viator_sync' EXISTS.");
        console.log("Sample Data:", data);
    }
}
checkSchema();
