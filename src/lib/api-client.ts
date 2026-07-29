import axios, {
    AxiosError,
    AxiosHeaders,
    InternalAxiosRequestConfig,
} from "axios";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    saveAccessToken,
    saveTokens,
} from "@/features/auth/auth-storage";

function resolveApiBaseUrl() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
    }

    return apiBaseUrl;
}

type RefreshResponseBody = {
    data?: {
        accessToken?: string;
        refreshToken?: string;
        tokenType?: string;
        message?: string;
    };
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    message?: string;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

export const apiClient = axios.create({
    baseURL: resolveApiBaseUrl(),
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

const rawClient = axios.create({
    baseURL: resolveApiBaseUrl(),
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        setAuthorizationHeader(config, token);
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config as RetryableRequestConfig | undefined;

        if (!originalRequest || status !== 401) {
            return Promise.reject(error);
        }

        if (originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
            clearSessionAndRedirect();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const newAccessToken = await refreshAccessTokenSafely();

        if (!newAccessToken) {
            clearSessionAndRedirect();
            return Promise.reject(error);
        }

        setAuthorizationHeader(originalRequest, newAccessToken);

        return apiClient(originalRequest);
    }
);

export async function refreshAccessTokenSafely() {
    if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        return null;
    }

    try {
        const response = await rawClient.post<RefreshResponseBody>(
            "/api/v1/auth/refresh-token",
            {
                refreshToken,
            }
        );

        const auth = unwrapRefreshResponse(response.data);

        if (!auth.accessToken) {
            return null;
        }

        if (auth.refreshToken) {
            saveTokens(auth.accessToken, auth.refreshToken);
        } else {
            saveAccessToken(auth.accessToken);
        }

        return auth.accessToken;
    } catch {
        clearTokens();
        return null;
    }
}

function unwrapRefreshResponse(responseBody: RefreshResponseBody) {
    if (responseBody.data) {
        return {
            accessToken: responseBody.data.accessToken,
            refreshToken: responseBody.data.refreshToken,
        };
    }

    return {
        accessToken: responseBody.accessToken,
        refreshToken: responseBody.refreshToken,
    };
}

function setAuthorizationHeader(
    config: InternalAxiosRequestConfig,
    accessToken: string
) {
    if (!config.headers) {
        config.headers = new AxiosHeaders();
    }

    config.headers.set("Authorization", `Bearer ${accessToken}`);
}

function isAuthEndpoint(url?: string) {
    if (!url) {
        return false;
    }

    return (
        url.includes("/api/v1/auth/login") ||
        url.includes("/api/v1/auth/signup") ||
        url.includes("/api/v1/auth/verify-otp") ||
        url.includes("/api/v1/auth/google") ||
        url.includes("/api/v1/auth/refresh-token")
    );
}

function clearSessionAndRedirect() {
    clearTokens();

    if (typeof window === "undefined") {
        return;
    }

    if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
    }
}