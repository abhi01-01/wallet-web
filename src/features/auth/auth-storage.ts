const ACCESS_TOKEN_KEY = "wallet_access_token";
const REFRESH_TOKEN_KEY = "wallet_refresh_token";

export function getAccessToken() {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(accessToken: string, refreshToken?: string | null) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    if (refreshToken) {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
}

export function saveAccessToken(accessToken: string) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearTokens() {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}