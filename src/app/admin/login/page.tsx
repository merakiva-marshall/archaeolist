'use client';

import { useLogin } from "@refinedev/core";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function AdminLogin() {
    const { mutate: login } = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login({ email, password });
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-950">
            <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-8 shadow-xl">
                <h1 className="mb-6 text-center text-2xl font-bold text-amber-500">Admin Access</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-slate-400">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-slate-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded bg-amber-600 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
