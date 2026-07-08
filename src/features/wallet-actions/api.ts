import { apiClient } from "@/lib/api-client";
import { unwrapApiResponse } from "@/lib/api-response";
import type {
    BonusWalletRequest,
    SpendWalletRequest,
    WalletActionResponse,
} from "./types";

type UnknownObject = Record<string, unknown>;

export async function spendWallet(request: SpendWalletRequest) {
    const response = await apiClient.post("/api/v1/wallets/spend", {
        userId: request.userId,
        assetCode: request.assetCode,
        amount: request.amount,
        idempotencyKey: request.idempotencyKey,
        description: request.description,
    });

    const payload = unwrapApiResponse<UnknownObject>(response.data);

    return normalizeWalletActionResponse(payload);
}

export async function issueBonus(request: BonusWalletRequest) {
    const response = await apiClient.post("/api/v1/wallets/bonus", {
        userId: request.userId,
        assetCode: request.assetCode,
        amount: request.amount,
        idempotencyKey: request.idempotencyKey,
        description: request.description,
    });

    const payload = unwrapApiResponse<UnknownObject>(response.data);

    return normalizeWalletActionResponse(payload);
}

function normalizeWalletActionResponse(
    payload: UnknownObject
): WalletActionResponse {
    return {
        transactionId:
            typeof payload.transactionId === "string" ||
            typeof payload.transactionId === "number"
                ? payload.transactionId
                : typeof payload.id === "string" || typeof payload.id === "number"
                    ? payload.id
                    : undefined,
        status:
            typeof payload.status === "string"
                ? payload.status
                : typeof payload.transactionStatus === "string"
                    ? payload.transactionStatus
                    : undefined,
        transactionType:
            typeof payload.transactionType === "string"
                ? payload.transactionType
                : typeof payload.type === "string"
                    ? payload.type
                    : undefined,
        assetCode:
            typeof payload.assetCode === "string" ? payload.assetCode : undefined,
        amount:
            payload.amount === undefined || payload.amount === null
                ? undefined
                : Number(payload.amount),
        description:
            typeof payload.description === "string" ? payload.description : undefined,
        createdAt:
            typeof payload.createdAt === "string" ? payload.createdAt : undefined,
        message:
            typeof payload.message === "string" ? payload.message : undefined,
    };
}