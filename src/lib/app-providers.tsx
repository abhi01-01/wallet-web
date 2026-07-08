"use client";

import { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppQueryClientProvider } from "@/lib/query-client-provider";
import { AuthProvider } from "@/features/auth/auth-provider";

export function AppProviders({ children }: { children: ReactNode }) {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured");
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <AppQueryClientProvider>
                <AuthProvider>{children}</AuthProvider>
            </AppQueryClientProvider>
        </GoogleOAuthProvider>
    );
}