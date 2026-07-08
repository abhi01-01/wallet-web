"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-provider";
import { getWalletBalances } from "@/features/wallets/api";
import { WalletDetailPanel } from "@/features/wallets/components/wallet-detail-panel";
import { WalletSummaryCards } from "@/features/wallets/components/wallet-summary-cards";
import { WalletTable } from "@/features/wallets/components/wallet-table";
import type { NormalizedWalletBalance } from "@/features/wallets/types";
import { UserOptionSelect } from "@/features/users/components/user-option-select";

const emptyWallets: NormalizedWalletBalance[] = [];

export default function WalletsPage() {
    const { user } = useAuth();

    const ownerType = user?.ownerType ?? user?.role ?? null;
    const isSystemUser = ownerType === "SYSTEM";
    const currentUserId = user?.userId ?? user?.subject ?? "";
    const currentUserLabel =
        user?.ldap ?? user?.email ?? user?.displayName ?? "Current user";

    const [selectedUserId, setSelectedUserId] = useState(currentUserId);
    const [submittedUserId, setSubmittedUserId] = useState(currentUserId);
    const [search, setSearch] = useState("");
    const [selectedWallet, setSelectedWallet] =
        useState<NormalizedWalletBalance | null>(null);

    const walletsQuery = useQuery({
        queryKey: ["wallet-balances", submittedUserId],
        queryFn: () => getWalletBalances(submittedUserId),
        enabled: Boolean(submittedUserId),
        refetchInterval: 30_000,
    });

    function handleLoadBalances() {
        setSelectedWallet(null);
        setSubmittedUserId(selectedUserId);
    }

    const wallets = walletsQuery.data ?? emptyWallets;

    const filteredWallets = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return wallets;
        }

        return wallets.filter((wallet) => {
            return (
                wallet.walletId.toLowerCase().includes(query) ||
                wallet.assetCode.toLowerCase().includes(query) ||
                wallet.assetName.toLowerCase().includes(query)
            );
        });
    }, [wallets, search]);


    return (
        <AppShell>
            <div className="flex items-start justify-between gap-6">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                        Wallet Operations
                    </p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                        Wallet Balances
                    </h2>
                    <p className="mt-4 max-w-3xl text-zinc-400">
                        Inspect wallet balances by account. A user may have zero to three
                        wallets across GOLD, DIAMOND, and LOYALTY.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => walletsQuery.refetch()}
                    disabled={!submittedUserId}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {isSystemUser ? (
                <Card className="mt-8">
                    <p className="text-sm font-medium text-white">User balance lookup</p>
                    <p className="mt-1 text-sm text-zinc-500">
                        SYSTEM accounts can inspect wallet balances for existing USER accounts.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 lg:flex-row">
                        <div className="flex-1">
                            <UserOptionSelect
                                label="User"
                                value={selectedUserId}
                                onChange={(selectedUser) => {
                                    setSelectedUserId(selectedUser?.userId ?? "");
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleLoadBalances}
                            disabled={!selectedUserId}
                            className="h-fit rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 lg:mt-7"
                        >
                            Load balances
                        </button>
                    </div>
                </Card>
            ) : (
                <Card className="mt-8">
                    <p className="text-sm font-medium text-white">Account balance lookup</p>
                    <p className="mt-1 text-sm text-zinc-500">
                        USER accounts can inspect only their own wallet balances.
                    </p>

                    <div className="mt-4 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white">
                        {currentUserLabel}
                    </div>

                    <p className="mt-2 text-xs text-zinc-500">
                        User ID is kept internal and sent to the backend.
                    </p>
                </Card>
            )}

            {!submittedUserId ? (
                <Card className="mt-8">
                    <p className="text-sm text-zinc-500">
                        No user selected. Select a user to load wallet balances.
                    </p>
                </Card>
            ) : null}

            {walletsQuery.isLoading ? (
                <div className="mt-8 text-sm text-zinc-500">Loading balances...</div>
            ) : null}

            {walletsQuery.isError ? (
                <Card className="mt-8 border-red-500/30 bg-red-500/10">
                    <p className="text-sm font-medium text-red-300">
                        Failed to load wallet balances.
                    </p>
                    <p className="mt-2 text-sm text-red-200/70">
                        Selected user does not have active wallet. Buy credits to view balance.
                    </p>
                </Card>
            ) : null}

            {!walletsQuery.isLoading && !walletsQuery.isError && submittedUserId ? (
                <>
                    <div className="mt-8">
                        <WalletSummaryCards wallets={wallets} />
                    </div>

                    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
                        <Card className="overflow-hidden p-0">
                            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                                <div>
                                    <p className="font-medium text-white">Balance records</p>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        {filteredWallets.length} visible balances
                                    </p>
                                </div>

                                <div className="relative w-80">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/60"
                                        placeholder="Search asset, name, wallet..."
                                    />
                                </div>
                            </div>

                            {filteredWallets.length === 0 ? (
                                <div className="p-6 text-sm text-zinc-500">
                                    No wallet balances found for this user. Please purchase credits.
                                </div>
                            ) : (
                                <WalletTable
                                    wallets={filteredWallets}
                                    selectedWalletId={selectedWallet?.id ?? null}
                                    onSelectWallet={setSelectedWallet}
                                />
                            )}
                        </Card>

                        <WalletDetailPanel wallet={selectedWallet} />
                    </div>
                </>
            ) : null}
        </AppShell>
    );
}
