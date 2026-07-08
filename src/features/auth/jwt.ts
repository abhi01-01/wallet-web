import { jwtDecode } from "jwt-decode";
import type { AuthUser, JwtPayload } from "./types";

export function decodeUserFromToken(token: string): AuthUser {
    try {
        const payload = jwtDecode<JwtPayload>(token);

        const email = resolveEmail(payload);
        const ldap = resolveLdap(email, payload);
        const userId = resolveUserId(payload);


        const ownerType = resolveOwnerType(payload);
        const role = ownerType ?? resolveRole(payload);

        return {
            userId,
            email,
            ldap,
            displayName: email ?? ldap ?? "Authenticated user",
            ownerType,
            role,
            subject: payload.sub ?? null,
        };
    } catch {
        return {
            userId: null,
            email: null,
            ldap: null,
            displayName: "Authenticated user",
            ownerType: null,
            role: null,
            subject: null,
        };
    }
}

export function isTokenExpired(token: string) {
    try {
        const payload = jwtDecode<JwtPayload>(token);

        if (!payload.exp) {
            return false;
        }

        return payload.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
}

function resolveOwnerType(payload: JwtPayload) {
    return (
        payload.ownerType ??
        payload.owner_type ??
        null
    );
}

function resolveUserId(payload: JwtPayload) {
    return payload.userId ?? payload.user_id ?? payload.id ?? payload.sub ?? null;
}

function resolveEmail(payload: JwtPayload) {
    return payload.email ?? normalizeEmailLike(payload.preferred_username) ?? null;
}

function resolveLdap(email: string | null, payload: JwtPayload) {
    if (email && email.includes("@")) {
        return email.split("@")[0];
    }

    if (payload.preferred_username && !payload.preferred_username.includes("@")) {
        return payload.preferred_username;
    }

    if (payload.username && !payload.username.includes("@")) {
        return payload.username;
    }

    return null;
}

function normalizeEmailLike(value?: string) {
    if (!value) {
        return null;
    }

    return value.includes("@") ? value : null;
}

function resolveRole(payload: JwtPayload) {
    const candidates: string[] = [];

    pushClaim(candidates, payload.role);
    pushClaim(candidates, payload.roles);
    pushClaim(candidates, payload.authority);
    pushClaim(candidates, payload.authorities);
    pushClaim(candidates, payload.ownerType);
    pushClaim(candidates, payload.owner_type);
    pushClaim(candidates, payload.scope);
    pushClaim(candidates, payload.scp);

    const normalized = candidates
        .map(normalizeRole)
        .filter(Boolean);

    if (normalized.includes("SYSTEM")) {
        return "SYSTEM";
    }

    if (normalized.includes("ADMIN")) {
        return "ADMIN";
    }

    if (normalized.includes("USER")) {
        return "USER";
    }

    return normalized[0] ?? null;
}

function pushClaim(target: string[], claim?: string[] | string) {
    if (!claim) {
        return;
    }

    if (Array.isArray(claim)) {
        target.push(...claim);
        return;
    }

    target.push(...claim.split(" "));
}

function normalizeRole(role: string) {
    return role
        .replace("ROLE_", "")
        .replace("SCOPE_", "")
        .trim()
        .toUpperCase();
}