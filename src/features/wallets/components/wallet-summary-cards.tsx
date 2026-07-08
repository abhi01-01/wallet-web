import { Coins, Database, Wallet } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { formatMoney } from "@/lib/format";
import type { NormalizedWalletBalance } from "../types";

type WalletSummaryCardsProps = {
    wallets: NormalizedWalletBalance[];
};

export function WalletSummaryCards({ wallets }: WalletSummaryCardsProps) {
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    const activeAssets = wallets.length;

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
                label="Active Assets"
                value={activeAssets}
                description="Number of wallet assets currently available"
                icon={<Database className="h-5 w-5" />}
            />

            <MetricCard
                label="Total Balance"
                value={totalBalance.toLocaleString("en-IN")}
                description="Raw sum across all asset balances"
                icon={<Wallet className="h-5 w-5" />}
            />

            <MetricCard
                label="Wallet Records"
                value={wallets.length}
                description="Balance records in system"
                icon={<Coins className="h-5 w-5" />}
            />

            {wallets.map((wallet) => (
                <MetricCard
                    key={wallet.id}
                    label={wallet.assetName}
                    value={formatMoney(wallet.balance, wallet.assetCode)}
                    description={wallet.assetCode}
                    icon={<Coins className="h-5 w-5" />}
                />
            ))}
        </div>
    );
}