
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testPermissions() {
    console.log("⚠️  Testing Supabase Permissions (Standalone Script) ⚠️");
    console.log("-----------------------------------------------------");

    // 1. Config
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        console.error("❌ Missing Env Vars!");
        return;
    }

    const sb = createClient(url, anonKey);

    // 2. Login
    console.log("🔑 Logging in as admin@archaeolist.com...");
    const { data: { session }, error: loginError } = await sb.auth.signInWithPassword({
        email: 'admin@archaeolist.com',
        password: 'admin-password-123'
    });

    if (loginError) {
        console.error("❌ Login Failed:", loginError.message);
        return;
    }
    console.log("✅ Login Successful! User:", session?.user?.email);

    // 3. Test Read
    console.log("📋 Attempting to Read 'sites' table...");
    const { count, error: readError } = await sb.from('sites').select('*', { count: 'exact', head: true });

    if (readError) {
        console.error("❌ Read Failed (RLS DENIED):", readError.message);
        console.error("   -> The RLS Policy is NOT working for this user.");
    } else {
        console.log(`✅ Read Successful! Count: ${count}`);
        console.log("   -> The RLS Policy IS working.");
    }
}

testPermissions();
