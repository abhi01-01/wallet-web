"use client";

import { SubmitEvent, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { JsonBlock } from "@/components/ui/json-block";
import { MetricCard } from "@/components/ui/metric-card";
import { useAuth } from "@/features/auth/auth-provider";
import { issueBonus, spendWallet } from "@/features/wallet-actions/api";
import type {
    AssetCode,
    WalletActionResponse,
} from "@/features/wallet-actions/types";
import { createIdempotencyKey } from "@/lib/idempotency";
import { UserOptionSelect } from "@/features/users/components/user-option-select";
import { resolveErrorMessage } from "@/lib/errors";

const spendAssets: AssetCode[] = ["GOLD", "DIAMOND", "LOYALTY"];
const bonusAssets: AssetCode[] = ["GOLD", "DIAMOND", "LOYALTY"];

export default function WalletActionsPage() {
    const { user } = useAuth();

    const defaultUserId = user?.userId ?? user?.subject ?? "";
    const ownerType = user?.ownerType ?? user?.role ?? null;

    const isSystemUser = ownerType === "SYSTEM";
    const isNormalUser = ownerType === "USER";

    const currentUserLabel =
        user?.ldap ?? user?.email ?? user?.displayName ?? "Current user";

    const spendUserId = defaultUserId;
    const [spendAssetCode, setSpendAssetCode] = useState<AssetCode>("GOLD");
    const [spendAmount, setSpendAmount] = useState("10");
    const [spendDescription, setSpendDescription] = useState(
        "Spend wallet credits"
    );

    const [bonusUserId, setBonusUserId] = useState("");
    const [bonusUserLabel, setBonusUserLabel] = useState("");
    const [bonusAssetCode, setBonusAssetCode] = useState<AssetCode>("LOYALTY");
    const [bonusAmount, setBonusAmount] = useState("100");
    const [bonusDescription, setBonusDescription] = useState(
        "SYSTEM reward bonus"
    );

    const [latestSpend, setLatestSpend] = useState<WalletActionResponse | null>(
        null
    );
    const [latestBonus, setLatestBonus] = useState<WalletActionResponse | null>(
        null
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const spendMutation = useMutation({
        mutationFn: spendWallet,
        onSuccess: (response) => {
            setLatestSpend(response);
            setErrorMessage(null);
        },
        onError: (error) => {
            setErrorMessage(
                formatWalletActionError(error, {
                    internalUserId: spendUserId,
                    visibleUserLabel: currentUserLabel,
                })
            );
        },
    });

    const bonusMutation = useMutation({
        mutationFn: issueBonus,
        onSuccess: (response) => {
            setLatestBonus(response);
            setErrorMessage(null);
        },
        onError: (error) => {
            setErrorMessage(
                formatWalletActionError(error, {
                    internalUserId: bonusUserId,
                    visibleUserLabel: bonusUserLabel,
                })
            );
        },
    });

    const selectedSpendAmount = Number(spendAmount || 0);
    const selectedBonusAmount = Number(bonusAmount || 0);

    const helperText = useMemo(() => {
        if (isSystemUser) {
            return "SYSTEM accounts can issue bonus rewards to users. Spend is blocked for SYSTEM.";
        }

        if (isNormalUser) {
            return "USER accounts can spend wallet credits. Bonus is blocked for USER.";
        }

        return "Owner type is unknown. Wallet actions are blocked until token claims are decoded correctly.";
    }, [isSystemUser, isNormalUser]);

    function handleSpend(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage(null);

        if (!spendUserId.trim()) {
            setErrorMessage("Unable to resolve your account for spend.");
            return;
        }

        if (!Number.isFinite(selectedSpendAmount) || selectedSpendAmount <= 0) {
            setErrorMessage("Spend amount must be greater than zero.");
            return;
        }

        if (!isNormalUser) {
            setErrorMessage("Only USER accounts can spend wallet credits.");
            return;
        }

        spendMutation.mutate({
            userId: spendUserId.trim(),
            assetCode: spendAssetCode,
            amount: selectedSpendAmount,
            idempotencyKey: createIdempotencyKey("spend"),
            description: spendDescription.trim() || undefined,
        });
    }

    function handleBonus(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage(null);

        if (!isSystemUser) {
            setErrorMessage("Only SYSTEM users can issue bonus rewards.");
            return;
        }

        if (!bonusUserId.trim()) {
            setErrorMessage("Target user is required for bonus.");
            return;
        }

        if (!Number.isFinite(selectedBonusAmount) || selectedBonusAmount <= 0) {
            setErrorMessage("Bonus amount must be greater than zero.");
            return;
        }

        bonusMutation.mutate({
            userId: bonusUserId.trim(),
            assetCode: bonusAssetCode,
            amount: selectedBonusAmount,
            idempotencyKey: createIdempotencyKey("bonus"),
            description: bonusDescription.trim() || undefined,
        });
    }

    return (
        <AppShell>
            <div className="flex items-start justify-between gap-6">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                        Wallet Actions
                    </p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                        Spend and Bonus
                    </h2>
                    <p className="mt-4 max-w-3xl text-zinc-400">
                        Wallet allows spend operations for USERs and bonus rewards for SYSTEM. Successful payment
                        verification and SYSTEM bonus flows should credit wallets.
                    </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                    Owner Type: {ownerType ?? "UNKNOWN"}
                </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
                <MetricCard
                    label="Spend"
                    value={isNormalUser ? "Enabled" : "USER only"}
                />

                <MetricCard
                    label="Bonus"
                    value={isSystemUser ? "Enabled" : "SYSTEM only"}
                />
            </div>

            <Card className="mt-8">
                <p className="text-sm text-zinc-400">{helperText}</p>
            </Card>

            {errorMessage ? (
                <Card className="mt-8 border-red-500/30 bg-red-500/10">
                    <p className="text-sm font-medium text-red-300">{errorMessage}</p>
                </Card>
            ) : null}

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <Card className={!isNormalUser ? "opacity-60" : undefined}>
                    <p className="text-sm font-medium text-white">Spend wallet credits</p>

                    <form onSubmit={handleSpend} className="mt-6 space-y-5">
                        <div>
                            <label className="text-sm font-medium text-zinc-300">Account</label>
                            <div className="mt-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white">
                                {currentUserLabel}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Select
                                label="Asset"
                                value={spendAssetCode}
                                onChange={(value) => setSpendAssetCode(value as AssetCode)}
                                options={spendAssets}
                                disabled={!isNormalUser}
                            />

                            <Input
                                label="Amount"
                                type="number"
                                value={spendAmount}
                                onChange={setSpendAmount}
                                placeholder="10"
                                disabled={!isNormalUser}
                            />
                        </div>

                        <Input
                            label="Description"
                            value={spendDescription}
                            onChange={setSpendDescription}
                            placeholder="Spend wallet credits"
                            disabled={!isNormalUser}
                        />

                        <button
                            type="submit"
                            disabled={!isNormalUser || spendMutation.isPending}
                            className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {spendMutation.isPending ? "Spending..." : "Spend credits"}
                        </button>
                    </form>

                    {latestSpend ? (
                        <div className="mt-6">
                            <JsonBlock title="Latest Spend Response" value={latestSpend} />
                        </div>
                    ) : null}
                </Card>

                <Card className={!isSystemUser ? "opacity-60" : undefined}>
                    <p className="text-sm font-medium text-white">Issue SYSTEM bonus</p>

                    {!isSystemUser ? (
                        <div className="mt-6 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-xs leading-5 text-yellow-100/80">
                            Your current ROLE is not SYSTEM.
                        </div>
                    ) : null}

                    <form onSubmit={handleBonus} className="mt-6 space-y-5">
                        <div>
                                <UserOptionSelect
                                    label="Target user"
                                    value={bonusUserId}
                                    disabled={!isSystemUser}
                                    onChange={(selectedUser) => {
                                        setBonusUserId(selectedUser?.userId ?? "");
                                        setBonusUserLabel(
                                            selectedUser?.ldap ??
                                            selectedUser?.email ??
                                            ""
                                        );
                                    }}
                                />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Select
                                label="Asset"
                                value={bonusAssetCode}
                                onChange={(value) => setBonusAssetCode(value as AssetCode)}
                                options={bonusAssets}
                                disabled={!isSystemUser}
                            />

                            <Input
                                label="Amount"
                                type="number"
                                value={bonusAmount}
                                onChange={setBonusAmount}
                                placeholder="100"
                                disabled={!isSystemUser}
                            />
                        </div>

                        <Input
                            label="Description"
                            value={bonusDescription}
                            onChange={setBonusDescription}
                            placeholder="SYSTEM reward bonus"
                            disabled={!isSystemUser}
                        />

                        <button
                            type="submit"
                            disabled={!isSystemUser || bonusMutation.isPending}
                            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {bonusMutation.isPending ? "Issuing bonus..." : "Issue bonus"}
                        </button>
                    </form>

                    {latestBonus ? (
                        <div className="mt-6">
                            <JsonBlock title="Latest Bonus Response" value={latestBonus} />
                        </div>
                    ) : null}
                </Card>
            </div>
        </AppShell>
    );
}

type WalletActionErrorOptions = {
    internalUserId: string | null | undefined;
    visibleUserLabel: string | null | undefined;
};

function formatWalletActionError(
    error: unknown,
    { internalUserId, visibleUserLabel }: WalletActionErrorOptions
) {
    const rawMessage = resolveErrorMessage(error, {
        responseFallback: "Request failed. Check backend response.",
    });

    const normalizedUserId = internalUserId?.trim();
    const normalizedLabel = visibleUserLabel?.trim();

    if (
        !normalizedUserId ||
        !normalizedLabel ||
        normalizedUserId === normalizedLabel
    ) {
        return rawMessage;
    }

    return rawMessage.replaceAll(normalizedUserId, normalizedLabel);
}

function Input({
                   label,
                   value,
                   onChange,
                   placeholder,
                   type = "text",
                   disabled = false,
               }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    disabled?: boolean;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-zinc-300">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={placeholder}
                required
            />
        </div>
    );
}

function Select({
                    label,
                    value,
                    onChange,
                    options,
                    disabled = false,
                }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    disabled?: boolean;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-zinc-300">{label}</label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}
