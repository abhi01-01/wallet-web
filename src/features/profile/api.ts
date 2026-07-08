import { apiClient } from "@/lib/api-client";
import { unwrapApiResponse } from "@/lib/api-response";

export type CloseAccountRequest = {
    confirmForfeitBalance: boolean;
};

export async function closeAccount(request: CloseAccountRequest) {
    const response = await apiClient.delete("/api/v1/auth/close-account", {
        data: request,
    });

    return unwrapApiResponse<string | null>(response.data);
}