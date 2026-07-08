"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { useAuth } from "@/features/auth/auth-provider";
import { getUserLedger } from "@/features/ledger/api";
import { LedgerDetailPanel } from "@/features/ledger/components/ledger-detail-panel";
import { LedgerTable } from "@/features/ledger/components/ledger-table";
import type {
    AssetCode,
    NormalizedLedgerEntry,
} from "@/features/ledger/types";
import { formatMoney } from "@/lib/format";
import { UserOptionSelect } from "@/features/users/components/user-option-select";

type EntryFilter = "ALL" | "DEBIT" | "CREDIT";

const assetCodes: AssetCode[] = ["GOLD", "DIAMOND", "LOYALTY"];
const emptyLedgerEntries: NormalizedLedgerEntry[] = [];

export default function LedgerPage() {
    const { user } = useAuth();

    const ownerType = user?.ownerType ?? user?.role ?? null;
    const isSystemUser = ownerType === "SYSTEM";
    const currentUserId = user?.userId ?? user?.subject ?? "";
    const currentUserLabel =
        user?.ldap ?? user?.email ?? user?.displayName ?? "Current user";

    const [selectedUserId, setSelectedUserId] = useState(currentUserId);
    const [submittedUserId, setSubmittedUserId] = useState(currentUserId);

    const [targetAssetCode, setTargetAssetCode] = useState<AssetCode>("GOLD");
    const [submittedAssetCode, setSubmittedAssetCode] =
        useState<AssetCode>("GOLD");

    const [search, setSearch] = useState("");
    const [entryFilter, setEntryFilter] = useState<EntryFilter>("ALL");
    const [selectedEntry, setSelectedEntry] =
        useState<NormalizedLedgerEntry | null>(null);

    const ledgerQuery = useQuery({
        queryKey: ["ledger", submittedUserId, submittedAssetCode],
        queryFn: () =>
            getUserLedger({
                userId: submittedUserId,
                assetCode: submittedAssetCode,
            }),
        enabled: Boolean(submittedUserId && submittedAssetCode),
        refetchInterval: 30_000,
    });

    const entries = ledgerQuery.data ?? emptyLedgerEntries;

    const filteredEntries = useMemo(() => {
        const query = search.trim().toLowerCase();

        return entries.filter((entry) => {
            const matchesType =
                entryFilter === "ALL" || entry.entryType === entryFilter;

            if (!matchesType) {
                return false;
            }

            if (!query) {
                return true;
            }

            return (
                entry.id.toLowerCase().includes(query) ||
                entry.transactionId.toLowerCase().includes(query) ||
                entry.entryType.toLowerCase().includes(query) ||
                (entry.transactionType?.toLowerCase().includes(query) ?? false)
            );
        });
    }, [entries, search, entryFilter]);

    const creditTotal = useMemo(
        () =>
            entries
                .filter((entry) => entry.entryType === "CREDIT")
                .reduce((sum, entry) => sum + entry.amount, 0),
        [entries]
    );

    const debitTotal = useMemo(
        () =>
            entries
                .filter((entry) => entry.entryType === "DEBIT")
                .reduce((sum, entry) => sum + entry.amount, 0),
        [entries]
    );

    function handleLoadLedger() {
        setSelectedEntry(null);
        setSubmittedUserId(selectedUserId);
        setSubmittedAssetCode(targetAssetCode);
    }

    return (
        <AppShell>
            <div className="flex items-start justify-between gap-6">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                        Double-Entry Ledger
                    </p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                        Ledger Explorer
                    </h2>
                    <p className="mt-4 max-w-3xl text-zinc-400">
                        Inspect immutable ledger entries by user and asset. GOLD and DIAMOND
                        are wallet assets, while LOYALTY is reward-only and can be issued
                        only by SYSTEM users.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => ledgerQuery.refetch()}
                    disabled={!submittedUserId}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            <Card className="mt-8">
                <p className="text-sm font-medium text-white">Ledger lookup</p>
                <p className="mt-1 text-sm text-zinc-500">
                    Load ledger history by user and asset code.
                </p>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_auto]">
                    {isSystemUser ? (
                        <UserOptionSelect
                            label="User"
                            value={selectedUserId}
                            onChange={(selectedUser) => {
                                setSelectedUserId(selectedUser?.userId ?? "");
                            }}
                        />
                    ) : (
                        <div>
                            <label className="text-sm font-medium text-zinc-300">Account</label>
                            <div className="mt-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white">
                                {currentUserLabel}
                            </div>

                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-zinc-300">Asset</label>
                        <select
                            value={targetAssetCode}
                            onChange={(event) =>
                                setTargetAssetCode(event.target.value as AssetCode)
                            }
                            className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/60"
                        >
                            {assetCodes.map((assetCode) => (
                                <option key={assetCode} value={assetCode}>
                                    {assetCode}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleLoadLedger}
                        disabled={!selectedUserId}
                        className="h-fit rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 lg:mt-7"
                    >
                        Load ledger
                    </button>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-zinc-500">
                    GOLD and DIAMOND are wallet assets. LOYALTY is reward-only and can be
                    issued only by SYSTEM users.
                </div>
            </Card>

            {!submittedUserId ? (
                <Card className="mt-8">
                    <p className="text-sm text-zinc-500">
                        No user ID available. Check JWT claims or paste a user ID manually.
                    </p>
                </Card>
            ) : null}

            {ledgerQuery.isLoading ? (
                <div className="mt-8 text-sm text-zinc-500">Loading ledger...</div>
            ) : null}

            {ledgerQuery.isError ? (
                <Card className="mt-8 border-red-500/30 bg-red-500/10">
                    <p className="text-sm font-medium text-red-300">
                        Failed to load ledger.
                    </p>
                    <p className="mt-2 text-sm text-red-200/70">
                        Selected User, Asset does not have active wallet.
                    </p>
                </Card>
            ) : null}

            {!ledgerQuery.isLoading && !ledgerQuery.isError && submittedUserId ? (
                <>
                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            label="Ledger Entries"
                            value={entries.length}
                            description="Total entries returned by backend"
                        />

                        <MetricCard
                            label="Credits"
                            value={entries.filter((entry) => entry.entryType === "CREDIT").length}
                            description="Credit entries"
                        />

                        <MetricCard
                            label="Debits"
                            value={entries.filter((entry) => entry.entryType === "DEBIT").length}
                            description="Debit entries"
                        />

                        <MetricCard
                            label={`Net ${submittedAssetCode} Movement`}
                            value={formatMoney(creditTotal - debitTotal, submittedAssetCode)}
                            description={`Credits minus debits for ${submittedAssetCode}`}
                        />
                    </div>

                    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_440px]">
                        <Card className="overflow-hidden p-0">
                            <div className="border-b border-white/10 px-5 py-4">
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                    <div>
                                        <p className="font-medium text-white">Ledger history</p>
                                        <p className="mt-1 text-sm text-zinc-500">
                                            {filteredEntries.length} visible entries
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <select
                                            value={entryFilter}
                                            onChange={(event) => {
                                                setEntryFilter(event.target.value as EntryFilter);
                                                setSelectedEntry(null);
                                            }}
                                            className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
                                        >
                                            <option value="ALL">ALL</option>
                                            <option value="CREDIT">CREDIT</option>
                                            <option value="DEBIT">DEBIT</option>
                                        </select>

                                        <div className="relative w-full sm:w-80">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                            <input
                                                value={search}
                                                onChange={(event) => setSearch(event.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/60"
                                                placeholder="Search ledger..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {filteredEntries.length === 0 ? (
                                <div className="p-6 text-sm text-zinc-500">
                                    No ledger entries found.
                                </div>
                            ) : (
                                <LedgerTable
                                    entries={filteredEntries}
                                    selectedEntryId={selectedEntry?.id ?? null}
                                    onSelectEntry={setSelectedEntry}
                                />
                            )}
                        </Card>

                        <LedgerDetailPanel entry={selectedEntry} />
                    </div>
                </>
            ) : null}
        </AppShell>
    );
}
