export type AssetCode = "GOLD" | "DIAMOND" | "LOYALTY" | string;

export type WalletBalanceItemResponse = {
    assetCode: AssetCode;
    assetName: string;
    balance: number | string;
    walletId: number | string;
};

export type WalletBalanceResponse = {
    userId: string;
    wallets: WalletBalanceItemResponse[];
};

export type NormalizedWalletBalance = {
    id: string;
    walletId: string;
    userId: string;
    assetCode: AssetCode;
    assetName: string;
    balance: number;
};