"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, UserCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-provider";
import { clearTokens } from "@/features/auth/auth-storage";
import { closeAccount } from "@/features/profile/api";
import { resolveErrorMessage } from "@/lib/errors";

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth();

    const ownerType = user?.ownerType ?? user?.role ?? null;
    const isNormalUser = ownerType === "USER";

    const [confirmForfeitBalance, setConfirmForfeitBalance] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const ldap =
        user?.ldap ??
        (user?.email?.includes("@") ? user.email.split("@")[0] : null);

    async function handleCloseAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage(null);

        if (!isNormalUser) {
            setErrorMessage("Only USER accounts can close their own account.");
            return;
        }

        if (!confirmForfeitBalance) {
            setErrorMessage("You must confirm that remaining wallet balance may be forfeited.");
            return;
        }

        if (confirmationText.trim() !== "DELETE") {
            setErrorMessage("Type DELETE to confirm account closure.");
            return;
        }

        try {
            setIsDeleting(true);

            await closeAccount({
                confirmForfeitBalance: true,
            });

            clearTokens();
            router.replace("/login");
        } catch (error) {
            setErrorMessage(
                resolveErrorMessage(error, {
                    fallback: "Failed to close account.",
                })
            );
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <AppShell>
            <div className="flex items-start justify-between gap-6">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                        Profile
                    </p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                        Account Profile
                    </h2>
                    <p className="mt-4 max-w-3xl text-zinc-400">
                        View account identity information and manage account lifecycle.
                    </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                    Owner Type: {ownerType ?? "UNKNOWN"}
                </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_460px]">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <UserCircle className="h-6 w-6 text-emerald-300" />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-white">User information</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <InfoTile label="LDAP" value={ldap ?? "Unavailable"} />
                        <InfoTile label="Email" value={user?.email ?? "Unavailable"} />
                        <InfoTile label="Owner Type" value={ownerType ?? "UNKNOWN"} />
                        <InfoTile label="Session Subject" value="Hidden" />
                    </div>

                </Card>

                {isNormalUser ? (
                    <Card className="border-red-500/30 bg-red-500/10">
                        <div className="flex gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />

                            <div>
                                <p className="text-sm font-medium text-red-200">
                                    Close account
                                </p>
                                <p className="mt-2 text-sm leading-6 text-red-100/70">
                                    This action closes your account. Any remaining wallet balance
                                    may be forfeited depending on backend rules.
                                </p>
                            </div>
                        </div>

                        {errorMessage ? (
                            <div className="mt-5 rounded-xl border border-red-300/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                                {errorMessage}
                            </div>
                        ) : null}

                        <form onSubmit={handleCloseAccount} className="mt-6 space-y-5">
                            <label className="flex items-start gap-3 text-sm text-red-100/80">
                                <input
                                    type="checkbox"
                                    checked={confirmForfeitBalance}
                                    onChange={(event) =>
                                        setConfirmForfeitBalance(event.target.checked)
                                    }
                                    className="mt-1"
                                />
                                <span>
                  I understand that remaining wallet balances may be forfeited.
                </span>
                            </label>

                            <div>
                                <label className="text-sm font-medium text-red-100">
                                    Type DELETE to confirm
                                </label>
                                <input
                                    value={confirmationText}
                                    onChange={(event) => setConfirmationText(event.target.value)}
                                    className="mt-2 w-full rounded-xl border border-red-300/20 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-300/60"
                                    placeholder="DELETE"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    isDeleting ||
                                    !confirmForfeitBalance ||
                                    confirmationText.trim() !== "DELETE"
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Trash2 className="h-4 w-4" />
                                {isDeleting ? "Closing account..." : "Close account"}
                            </button>
                        </form>
                    </Card>
                ) : (
                    <Card>
                        <p className="text-sm font-medium text-white">Account lifecycle</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Close-account action is hidden for SYSTEM accounts. SYSTEM
                            accounts should not delete themselves through the user profile
                            flow.
                        </p>
                    </Card>
                )}
            </div>
        </AppShell>
    );
}

function InfoTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                {label}
            </p>
            <p className="mt-2 break-all text-sm text-zinc-200">{value}</p>
        </div>
    );
}
