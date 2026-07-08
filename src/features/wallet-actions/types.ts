export type AssetCode = "GOLD" | "DIAMOND" | "LOYALTY";

export type SpendWalletRequest = {
    userId: string;
    assetCode: AssetCode;
    amount: number;
    idempotencyKey: string;
    description?: string;
};

export type BonusWalletRequest = {
    userId: string;
    assetCode: AssetCode;
    amount: number;
    idempotencyKey: string;
    description?: string;
};

export type WalletActionResponse = {
    transactionId?: string | number;
    status?: string;
    transactionType?: string;
    assetCode?: string;
    amount?: number;
    description?: string;
    createdAt?: string;
    message?: string;
};