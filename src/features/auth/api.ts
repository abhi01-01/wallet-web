import { apiClient } from "@/lib/api-client";
import { unwrapApiResponse } from "@/lib/api-response";
import type {
    ApiResponse,
    AuthResponse,
    GoogleAuthRequest,
    LoginRequest,
    LogoutRequest,
    ResendOtpRequest,
    SignupRequest,
    VerifyOtpRequest,
} from "./types";

function normalizeAuthResponse(responseBody: ApiResponse<AuthResponse> | AuthResponse) {
    const auth = unwrapApiResponse<AuthResponse>(responseBody);

    const accessToken =
        auth.accessToken ??
        (auth as Record<string, unknown>).access_token ??
        (auth as Record<string, unknown>).token ??
        (auth as Record<string, unknown>).jwt;

    const refreshToken =
        auth.refreshToken ??
        (auth as Record<string, unknown>).refresh_token ??
        undefined;

    if (typeof accessToken !== "string" || accessToken.length === 0) {
        throw new Error("Auth response does not contain an access token");
    }

    return {
        accessToken,
        refreshToken: typeof refreshToken === "string" ? refreshToken : undefined,
        tokenType: auth.tokenType ?? "Bearer",
        message: auth.message,
    };
}

export async function login(request: LoginRequest) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/api/v1/auth/login",
        request
    );

    return normalizeAuthResponse(response.data);
}

export async function signup(request: SignupRequest) {
    const response = await apiClient.post<ApiResponse<string>>(
        "/api/v1/auth/signup",
        request
    );

    return response.data;
}

export async function verifyOtp(request: VerifyOtpRequest) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/api/v1/auth/verify-otp",
        request
    );

    return normalizeAuthResponse(response.data);
}

export async function resendOtp(request: ResendOtpRequest) {
    const response = await apiClient.post<ApiResponse<string>>(
        "/api/v1/auth/resend-otp",
        request
    );

    return response.data;
}

export async function googleLogin(request: GoogleAuthRequest) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/api/v1/auth/google",
        request
    );

    return normalizeAuthResponse(response.data);
}

export async function logoutRequest(request: LogoutRequest) {
    const response = await apiClient.post<ApiResponse<string>>(
        "/api/v1/auth/logout",
        request
    );

    return response.data;
}
