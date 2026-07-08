import { apiClient } from "@/lib/api-client";
import { unwrapApiResponse } from "@/lib/api-response";
import type {
    NormalizedWalletBalance,
    WalletBalanceResponse,
} from "./types";

export async function getWalletBalances(userId: string) {
    if (!userId) {
        throw new Error("userId is required to fetch wallet balances");
    }

    const response = await apiClient.get(
        `/api/v1/wallets/${encodeURIComponent(userId)}/balance`
    );

    const payload = unwrapApiResponse<WalletBalanceResponse>(response.data);

    return normalizeWalletBalanceResponse(payload);
}

function normalizeWalletBalanceResponse(
    payload: WalletBalanceResponse
): NormalizedWalletBalance[] {
    if (!payload.wallets || !Array.isArray(payload.wallets)) {
        return [];
    }

    return payload.wallets.map((wallet) => {
        const walletId = String(wallet.walletId);
        const assetCode = wallet.assetCode;

        return {
            id: `${payload.userId}-${assetCode}-${walletId}`,
            walletId,
            userId: payload.userId,
            assetCode,
            assetName: wallet.assetName,
            balance: Number(wallet.balance ?? 0),
        };
    });
}