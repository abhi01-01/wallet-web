"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

type ProtectedRouteProps = {
    children: ReactNode;
    allowedRoles?: string[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, isBootstrapping, user } = useAuth();

    useEffect(() => {
        if (isBootstrapping) {
            return;
        }

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        if (allowedRoles?.length && user?.role && !allowedRoles.includes(user.role)) {
            router.replace("/dashboard");
        }
    }, [allowedRoles, isAuthenticated, isBootstrapping, router, user]);

    if (isBootstrapping) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
                Restoring session...
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (allowedRoles?.length && user?.role && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}