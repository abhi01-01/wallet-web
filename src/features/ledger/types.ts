export type AssetCode = "GOLD" | "DIAMOND" | "LOYALTY";

export type LedgerEntryType = "DEBIT" | "CREDIT" | string;

export type LedgerTransactionType =
    | "TOP_UP"
    | "SPEND"
    | "BONUS"
    | "REFUND"
    | string;

export type LedgerEntryResponse = {
    entryId: number | string;
    transactionId: number | string;
    transactionType: LedgerTransactionType;
    entryType: LedgerEntryType;
    amount: number | string;
    balanceAfter: number | string;
    createdAt: string;
};

export type NormalizedLedgerEntry = {
    id: string;
    entryId: string;
    transactionId: string;
    transactionType: LedgerTransactionType;
    entryType: LedgerEntryType;
    amount: number;
    balanceAfter: number;
    createdAt: string;
};