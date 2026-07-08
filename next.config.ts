import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";
const corsAllowedOrigin =
    process.env.CORS_ALLOWED_ORIGIN ?? (isDevelopment ? "http://localhost:3000" : undefined);

const securityHeaders = [
    {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin-allow-popups",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "X-Frame-Options",
        value: "DENY",
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
    },
];

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: "/:path*",
                headers: securityHeaders,
            },
            ...(corsAllowedOrigin
                ? [
                    {
                        source: "/api/:path*",
                        headers: [
                            {
                                key: "Access-Control-Allow-Origin",
                                value: corsAllowedOrigin,
                            },
                            {
                                key: "Access-Control-Allow-Methods",
                                value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                            },
                            {
                                key: "Access-Control-Allow-Headers",
                                value: "Content-Type, Authorization",
                            },
                            {
                                key: "Access-Control-Allow-Credentials",
                                value: "true",
                            },
                        ],
                    },
                ]
                : []),
        ];
    },
};

export default nextConfig;
