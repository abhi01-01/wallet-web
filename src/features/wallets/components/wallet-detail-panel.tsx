import { Card } from "@/components/ui/card";
import { DetailRow } from "@/components/ui/detail-row";
import { JsonBlock } from "@/components/ui/json-block";
import { formatMoney } from "@/lib/format";
import type { NormalizedWalletBalance } from "../types";

type WalletDetailPanelProps = {
    wallet: NormalizedWalletBalance | null;
};

export function WalletDetailPanel({ wallet }: WalletDetailPanelProps) {
    if (!wallet) {
        return (
            <Card>
                <p className="text-sm font-medium text-white">Balance details</p>
                <p className="mt-1 text-sm text-zinc-500">
                    Select a balance row to inspect details.
                </p>

                <div className="mt-8 rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-500">
                    No balance selected.
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <p className="text-sm font-medium text-white">Balance details</p>
            <p className="mt-1 text-sm text-zinc-500">
                Current wallet asset balance.
            </p>

            <div className="mt-6 space-y-4 text-sm">
                <DetailRow label="Asset Code" value={wallet.assetCode} />
                <DetailRow label="Asset Name" value={wallet.assetName} />
                <DetailRow
                    label="Balance"
                    value={formatMoney(wallet.balance, wallet.assetCode)}
                />
                <DetailRow label="Wallet ID" value={wallet.walletId} />
            </div>

            <div className="mt-6">
                <JsonBlock title="Raw normalized balance" value={wallet} />
            </div>
        </Card>
    );
}
