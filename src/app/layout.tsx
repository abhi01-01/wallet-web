import type { Metadata } from "next";
import { AppProviders } from "@/lib/app-providers";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
    title: "Wallet Console",
    description: "Internal wallet dashboard with ledger and Kafka observability.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
        <AppProviders>{children}</AppProviders>
        </body>
        </html>
    );
}