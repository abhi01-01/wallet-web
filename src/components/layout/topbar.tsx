"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";

export function Topbar() {
    const { logout, user } = useAuth();

    return (
        <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 px-8 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-zinc-500">Internal wallet platform</p>
                    <h1 className="text-lg font-medium text-white">
                        Ledger and Kafka Observability
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-300">
                        {user?.ldap ?? user?.email ?? "authenticated"}
                    </div>

                    <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        {user?.role ?? "ROLE UNKNOWN"}
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}