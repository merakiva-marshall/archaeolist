
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
    const email = 'admin@archaeolist.com';
    const password = 'admin-password-123'; // Temporary password

    console.log(`Creating/Updating admin user: ${email}`);

    // Check if user exists (not directly possible with standard auth API cleanly without throwing, 
    // so we just try to sign up or update)

    // Try to create user
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (error) {
        console.log('User might already exist or error:', error.message);
        // If exists, update password to be sure
        if (error.message.includes('already registered')) {
            // We need the user ID to update. Fetching user by email isn't straightforward in admin api with just email?
            // Actually listUsers works.
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            const user = users.find(u => u.email === email);

            if (user) {
                const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password });
                if (updateError) {
                    console.error('Failed to update password:', updateError.message);
                } else {
                    console.log('Updated existing user password.');
                }
            }
        }
    } else {
        console.log('User created successfully:', data.user.id);
    }
}

createAdminUser();
