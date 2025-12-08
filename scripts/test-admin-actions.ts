
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAdminActions() {
    console.log("🛠️ Testing Admin Actions");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!url || !anonKey) {
        console.error("Missing env vars");
        return;
    }

    const supabase = createClient(url, anonKey);

    // 1. Login
    console.log("Logging in...");
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@archaeolist.com',
        password: 'admin-password-123'
    });

    if (loginError) {
        console.error("Login failed:", loginError);
        return;
    }
    console.log("Login successful.");

    // 2. Insert Site
    console.log("Attempting Insert Site...");
    const newSite = {
        name: "Test Site " + Date.now(),
        country: "Test Country",
        slug: "test-site-" + Date.now(),
        description: "Test Description",
        // Trying the GeoJSON format we implemented
        location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128]
        }
    };

    const { data: insertData, error: insertError } = await supabase
        .from('sites')
        .insert(newSite)
        .select()
        .single();

    if (insertError) {
        console.error("❌ Insert Failed:", insertError);
        console.log("   -> Check if 'location' column supports GeoJSON or if RLS blocked it.");
    } else {
        console.log("✅ Insert Successful!", insertData.id);

        // 3. Update Site
        console.log("Attempting Update Site...");
        const { error: updateError } = await supabase
            .from('sites')
            .update({ description: "Updated Description" })
            .eq('id', insertData.id);

        if (updateError) {
            console.error("❌ Update Failed:", updateError);
        } else {
            console.log("✅ Update Successful!");
        }

        // 4. Test Sync (Simulating API call Logic)
        // Since we can't easily fetch localhost API from this script without running server, 
        // we will invoke the sync manually if we can, but easier to just check if DB lets us read/write viator_tours

        console.log("Checking write access to viator_tours...");
        const { error: tourError } = await supabase
            .from('viator_tours')
            .insert({
                site_id: insertData.id,
                tour_id: 'TEST-TOUR-' + Date.now(),
                title: 'Test Tour',
                last_updated: new Date().toISOString()
            });

        if (tourError) {
            console.error("❌ Write to viator_tours Failed:", tourError);
        } else {
            console.log("✅ Write to viator_tours Successful!");
        }

        // Cleanup
        await supabase.from('sites').delete().eq('id', insertData.id);
    }
}

testAdminActions();
