"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";
import { Footer } from "./footer";

type AppShellProps = {
    children: ReactNode;
    allowedRoles?: string[];
};

export function AppShell({ children, allowedRoles }: AppShellProps) {
    const { isCollapsed } = useSidebar();

    return (
        <ProtectedRoute allowedRoles={allowedRoles}>
            <div className="min-h-screen bg-zinc-950 text-zinc-50">
                <Sidebar />
                <div
                    className={cn(
                        "flex min-h-screen flex-col transition-[padding] duration-200 ease-out",
                        isCollapsed ? "pl-20 sm:pl-24" : "pl-20 md:pl-72"
                    )}
                >
                    <Topbar />
                    <main className="flex-1 px-8 py-8">{children}</main>
                    <Footer />
                </div>
            </div>
        </ProtectedRoute>
    );
}
