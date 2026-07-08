import { ReactNode } from "react";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AppShellProps = {
    children: ReactNode;
    allowedRoles?: string[];
};

export function AppShell({ children, allowedRoles }: AppShellProps) {
    return (
        <ProtectedRoute allowedRoles={allowedRoles}>
            <div className="min-h-screen bg-zinc-950 text-zinc-50">
                <Sidebar />
                <div className="min-h-screen pl-72">
                    <Topbar />
                    <main className="px-8 py-8">{children}</main>
                </div>
            </div>
        </ProtectedRoute>
    );
}