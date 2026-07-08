export type ApiEnvelope<T> = {
    success?: boolean;
    message?: string;
    data?: T;
    error?: string;
    timestamp?: string;
};

export function unwrapApiResponse<T>(responseBody: ApiEnvelope<T> | T): T {
    if (
        typeof responseBody === "object" &&
        responseBody !== null &&
        "data" in responseBody
    ) {
        const envelope = responseBody as ApiEnvelope<T>;

        if (envelope.data === undefined || envelope.data === null) {
            throw new Error(envelope.message ?? "Backend response did not contain data");
        }

        return envelope.data;
    }

    return responseBody as T;
}