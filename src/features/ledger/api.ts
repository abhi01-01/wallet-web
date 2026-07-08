import { apiClient } from "@/lib/api-client";
import { unwrapApiResponse } from "@/lib/api-response";
import type { LedgerEntryResponse, NormalizedLedgerEntry } from "./types";

type GetUserLedgerRequest = {
    userId: string;
    assetCode: string;
};

export async function getUserLedger({
                                        userId,
                                        assetCode,
                                    }: GetUserLedgerRequest) {
    if (!userId) {
        throw new Error("userId is required to fetch ledger");
    }

    if (!assetCode) {
        throw new Error("assetCode is required to fetch ledger");
    }

    const response = await apiClient.get(
        `/api/v1/wallets/${encodeURIComponent(userId)}/ledger`,
        {
            params: {
                assetCode,
            },
        }
    );

    const payload = unwrapApiResponse<LedgerEntryResponse[]>(response.data);

    return payload.map(normalizeLedgerEntry);
}

function normalizeLedgerEntry(
    entry: LedgerEntryResponse
): NormalizedLedgerEntry {
    const entryId = String(entry.entryId);
    const transactionId = String(entry.transactionId);

    return {
        id: `${entryId}-${transactionId}-${entry.createdAt}`,
        entryId,
        transactionId,
        transactionType: entry.transactionType,
        entryType: entry.entryType,
        amount: Number(entry.amount ?? 0),
        balanceAfter: Number(entry.balanceAfter ?? 0),
        createdAt: entry.createdAt,
    };
}