export type ApiResponse<T> = {
    success?: boolean;
    message?: string;
    data?: T;
    error?: string;
    timestamp?: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type SignupRequest = {
    email: string;
    password: string;
};

export type VerifyOtpRequest = {
    email: string;
    otp: string;
};

export type ResendOtpRequest = {
    email: string;
};

export type GoogleAuthRequest = {
    idToken: string;
};

export type LogoutRequest = {
    refreshToken: string;
};

export type AuthResponse = {
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
    message?: string;
};

export type AuthUser = {
    userId: string | null;
    email: string | null;
    ldap: string | null;
    displayName: string;
    ownerType: "USER" | "SYSTEM" | string | null;
    role: string | null;
    subject: string | null;
};

export type JwtPayload = {
    sub?: string;
    userId?: string;
    user_id?: string;
    id?: string;

    email?: string;
    preferred_username?: string;
    username?: string;

    role?: string;
    roles?: string[] | string;
    authorities?: string[] | string;
    authority?: string;
    ownerType?: string;
    owner_type?: string;
    scope?: string;
    scp?: string[] | string;

    exp?: number;
    iat?: number;
};
