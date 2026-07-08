import { apiClient } from "@/lib/api-client";
import { unwrapApiResponse } from "@/lib/api-response";

type UserOptionResponse = {
    userId: string;
    email: string;
    ldap?: string;
    ownerType: string;
};

export async function getUserOptions(query?: string) {
    const response = await apiClient.get("/api/v1/admin/users/options", {
        params: {
            query: query || undefined,
        },
    });

    const payload = unwrapApiResponse<UserOptionResponse[]>(response.data);

    return payload.map((user) => ({
        userId: user.userId,
        email: user.email,
        ldap:
            user.ldap ??
            (user.email.includes("@") ? user.email.split("@")[0] : user.email),
        ownerType: user.ownerType,
    }));
}
