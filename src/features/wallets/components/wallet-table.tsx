import { formatMoney } from "@/lib/format";
import type { NormalizedWalletBalance } from "../types";

type WalletTableProps = {
    wallets: NormalizedWalletBalance[];
    selectedWalletId: string | null;
    onSelectWallet: (wallet: NormalizedWalletBalance) => void;
};

export function WalletTable({
                                wallets,
                                selectedWalletId,
                                onSelectWallet,
                            }: WalletTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-[0.18em] text-zinc-500">
                <tr>
                    <th className="px-5 py-4">Asset</th>
                    <th className="px-5 py-4">Asset Name</th>
                    <th className="px-5 py-4">Balance</th>
                    <th className="px-5 py-4">Wallet ID</th>
                </tr>
                </thead>

                <tbody>
                {wallets.map((wallet) => (
                    <tr
                        key={wallet.id}
                        onClick={() => onSelectWallet(wallet)}
                        className={
                            selectedWalletId === wallet.id
                                ? "cursor-pointer border-b border-emerald-400/20 bg-emerald-400/5"
                                : "cursor-pointer border-b border-white/10 transition hover:bg-white/[0.04]"
                        }
                    >
                        <td className="px-5 py-4 font-medium text-zinc-100">
                            {wallet.assetCode}
                        </td>

                        <td className="px-5 py-4 text-zinc-300">
                            {wallet.assetName}
                        </td>

                        <td className="px-5 py-4 font-medium text-zinc-100">
                            {formatMoney(wallet.balance, wallet.assetCode)}
                        </td>

                        <td className="px-5 py-4">
                            <p className="max-w-xs truncate text-zinc-300">
                                {wallet.walletId}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                                internal wallet id
                            </p>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}