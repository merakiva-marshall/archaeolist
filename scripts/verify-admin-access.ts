
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function verifyAccess() {
    // 1. Sign in as Admin
    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
        email: 'admin@archaeolist.com',
        password: 'admin-password-123'
    });

    if (authError) {
        console.error('Login failed:', authError.message);
        return;
    }

    console.log('Logged in as:', authData.user.email);

    // 2. Try to fetch sites
    const { data: sites, error: dbError } = await authClient
        .from('sites')
        .select('id, name')
        .limit(5);

    if (dbError) {
        console.error('Fetch sites failed:', dbError); // This will show RLS error details
        console.log('Error Code:', dbError.code);
        console.log('Error Details:', dbError.details);
        console.log('Error Hint:', dbError.hint);
    } else {
        console.log(`Success! Fetched ${sites.length} sites.`);
    }
}

verifyAccess();
