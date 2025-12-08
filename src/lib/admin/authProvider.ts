import { AuthProvider } from "@refinedev/core";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createBrowserClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
});

export const authProvider: AuthProvider = {
    login: async ({ email, password }) => {
        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                error: {
                    name: "LoginError",
                    message: error.message,
                },
            };
        }

        // TODO: Add Admin Role Check here
        // For now, we allow any logged-in user, but in production we must check the 'admin' flag.

        return {
            success: true,
            redirectTo: "/admin",
        };
    },
    logout: async () => {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            return {
                success: false,
                error: {
                    name: "LogoutError",
                    message: error.message,
                },
            };
        }

        return {
            success: true,
            redirectTo: "/admin/login",
        };
    },
    check: async () => {
        const { data } = await supabaseClient.auth.getSession();
        const { session } = data;

        if (!session) {
            return {
                authenticated: false,
                redirectTo: "/admin/login",
            };
        }

        return {
            authenticated: true,
        };
    },
    onError: async (error) => {
        console.error(error);
        return { error };
    },
    getPermissions: async () => {
        const { data } = await supabaseClient.auth.getUser();
        if (data.user) {
            // Ideally fetch role from DB
            return "admin";
        }
        return null;
    },
    getIdentity: async () => {
        const { data } = await supabaseClient.auth.getUser();

        if (data?.user) {
            return {
                ...data.user,
                name: data.user.email,
            };
        }
        return null;
    },
};
