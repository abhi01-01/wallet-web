type ErrorResponseShape = {
    response?: {
        status?: number;
        data?: unknown;
    };
};

type ResolveErrorMessageOptions = {
    fallback?: string;
    responseFallback?: string;
};

export function getHttpStatus(error: unknown) {
    if (!isErrorResponseShape(error)) {
        return null;
    }

    return typeof error.response?.status === "number"
        ? error.response.status
        : null;
}

export function resolveErrorMessage(
    error: unknown,
    options: ResolveErrorMessageOptions = {}
) {
    const fallback = options.fallback ?? "Request failed. Try again.";
    const responseFallback = options.responseFallback ?? fallback;

    if (isErrorResponseShape(error) && error.response && "data" in error.response) {
        return extractErrorMessage(error.response.data, responseFallback);
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}

function extractErrorMessage(data: unknown, fallback: string): string {
    if (typeof data === "string") {
        return data;
    }

    if (typeof data !== "object" || data === null) {
        return fallback;
    }

    const objectData = data as Record<string, unknown>;

    if (typeof objectData.message === "string") {
        return objectData.message;
    }

    if (typeof objectData.error === "string") {
        return objectData.error;
    }

    if (
        typeof objectData.data === "object" &&
        objectData.data !== null &&
        "message" in objectData.data &&
        typeof (objectData.data as Record<string, unknown>).message === "string"
    ) {
        return (objectData.data as Record<string, string>).message;
    }

    return fallback;
}

function isErrorResponseShape(error: unknown): error is ErrorResponseShape {
    return (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null
    );
}
