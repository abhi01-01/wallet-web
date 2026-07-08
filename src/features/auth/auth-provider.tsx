"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    saveTokens,
} from "./auth-storage";
import { decodeUserFromToken, isTokenExpired } from "./jwt";
import {
    googleLogin as googleLoginRequest,
    login as loginRequest,
    logoutRequest,
    verifyOtp as verifyOtpRequest,
} from "./api";
import { refreshAccessTokenSafely } from "@/lib/api-client";
import type {
    AuthUser,
    GoogleAuthRequest,
    LoginRequest,
    VerifyOtpRequest,
} from "./types";

type AuthContextValue = {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    isBootstrapping: boolean;
    login: (request: LoginRequest) => Promise<void>;
    verifyOtpAndLogin: (request: VerifyOtpRequest) => Promise<void>;
    googleLogin: (request: GoogleAuthRequest) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();

    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const acceptBootstrapState = (accessToken: string | null) => {
            if (cancelled) {
                return;
            }

            setToken(accessToken);
            setUser(accessToken ? decodeUserFromToken(accessToken) : null);
            setIsBootstrapping(false);
        };

        async function bootstrapSession() {
            const storedAccessToken = getAccessToken();
            const storedRefreshToken = getRefreshToken();

            if (!storedAccessToken && !storedRefreshToken) {
                clearTokens();
                acceptBootstrapState(null);
                return;
            }

            /**
             * Strict session mode:
             * refresh token is treated as the real session authority.
             *
             * If a refresh token is present, validate it on app boot.
             * If it is revoked/corrupt/expired, logout even if access token
             * has not expired yet.
             */
            if (storedRefreshToken) {
                const refreshedAccessToken = await refreshAccessTokenSafely();

                if (refreshedAccessToken) {
                    acceptBootstrapState(refreshedAccessToken);
                    return;
                }

                clearTokens();
                acceptBootstrapState(null);
                return;
            }

            /**
             * Fallback only for cases where the backend did not issue a refresh token.
             * Ideally, this path should not be used in your system.
             */
            if (storedAccessToken && !isTokenExpired(storedAccessToken)) {
                acceptBootstrapState(storedAccessToken);
                return;
            }

            clearTokens();
            acceptBootstrapState(null);
        }

        queueMicrotask(() => {
            void bootstrapSession();
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const acceptAuth = useCallback((accessToken: string, refreshToken?: string) => {
        saveTokens(accessToken, refreshToken);
        setToken(accessToken);
        setUser(decodeUserFromToken(accessToken));
        router.replace("/dashboard");
    }, [router]);

    const login = useCallback(async (request: LoginRequest) => {
        const response = await loginRequest(request);
        acceptAuth(response.accessToken, response.refreshToken);
    }, [acceptAuth]);

    const verifyOtpAndLogin = useCallback(async (request: VerifyOtpRequest) => {
        const response = await verifyOtpRequest(request);
        acceptAuth(response.accessToken, response.refreshToken);
    }, [acceptAuth]);

    const googleLogin = useCallback(async (request: GoogleAuthRequest) => {
        const response = await googleLoginRequest(request);
        acceptAuth(response.accessToken, response.refreshToken);
    }, [acceptAuth]);

    const logout = useCallback(async () => {
        const refreshToken = getRefreshToken();

        try {
            if (refreshToken) {
                await logoutRequest({ refreshToken });
            }
        } catch {
            // Local logout must still complete even if backend revoke fails.
        } finally {
            clearTokens();
            setToken(null);
            setUser(null);
            router.replace("/login");
        }
    }, [router]);

    const value = useMemo<AuthContextValue>(
        () => ({
            token,
            user,
            isAuthenticated: Boolean(token),
            isBootstrapping,
            login,
            verifyOtpAndLogin,
            googleLogin,
            logout,
        }),
        [
            token,
            user,
            isBootstrapping,
            login,
            verifyOtpAndLogin,
            googleLogin,
            logout,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
