"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";
import { signup, resendOtp } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-provider";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import { getHttpStatus, resolveErrorMessage } from "@/lib/errors";

type AuthTab = "login" | "signup";

export default function LoginPage() {
    const { login, verifyOtpAndLogin} = useAuth();

    const [activeTab, setActiveTab] = useState<AuthTab>("login");
    const googleAuthLabel =
        activeTab === "login"
            ? "Use Google to sign in if your account already exists, or create one if it does not."
            : "Use Google to create an account or continue if one already exists.";

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [otp, setOtp] = useState("");
    const [showOtpBox, setShowOtpBox] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleLogin(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        await run(async () => {
            await login({
                email: loginEmail,
                password: loginPassword,
            });
        });
    }

    async function handleSignup(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (signupPassword !== confirmPassword) {
            setErrorMessage("Password and confirm password do not match.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);
        setInfoMessage(null);

        try {
            const response = await signup({
                email: signupEmail,
                password: signupPassword,
            });

            setInfoMessage(
                response.message ??
                "Account created. Enter the OTP sent to your email."
            );

            setShowOtpBox(true);
        } catch (signupError) {
            const status = getHttpStatus(signupError);

            if (status === 400 || status === 409) {
                try {
                    const resendResponse = await resendOtp({
                        email: signupEmail,
                    });

                    setInfoMessage(
                        resendResponse.message ??
                        "This email is already registered but not verified. Enter the OTP or request a new one."
                    );

                    setShowOtpBox(true);
                    return;
                } catch {
                    setShowOtpBox(false);
                    setErrorMessage(resolveErrorMessage(signupError));
                    return;
                }
            }

            setShowOtpBox(false);
            setErrorMessage(resolveErrorMessage(signupError));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleVerifyOtp() {
        await run(async () => {
            await verifyOtpAndLogin({
                email: signupEmail,
                otp,
            });
        });
    }

    async function handleResendOtp() {
        await run(async () => {
            const response = await resendOtp({
                email: signupEmail,
            });

            setInfoMessage(response.message ?? "OTP resent successfully.");
        });
    }

    async function run(action: () => Promise<void>) {
        setIsSubmitting(true);
        setErrorMessage(null);
        setInfoMessage(null);

        try {
            await action();
        } catch (error) {
            setErrorMessage(resolveErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,#134e4a_0%,#09090b_36%,#000000_100%)] px-6 py-10 text-zinc-50">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
                <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 shadow-2xl shadow-black/50 backdrop-blur xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="hidden border-r border-white/10 bg-white/[0.03] p-10 xl:block">
                        <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">
                            Wallet Console
                        </p>

                        <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-tight text-white">
                            Internal wallet operations with ledger-grade visibility.
                        </h1>

                        <p className="mt-6 max-w-lg text-sm leading-7 text-zinc-400">
                            Monitor balances, immutable double-entry ledger movement,
                            transaction lifecycle, Kafka outbox publishing, and audit
                            consumption from one dashboard.
                        </p>

                        <div className="mt-10 grid gap-3">
                            <Feature label="Double-entry ledger" />
                            <Feature label="Kafka transactional outbox" />
                            <Feature label="Payment and wallet event audit" />
                            <Feature label="Gateway-secured admin APIs" />
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10">
                        <div className="xl:hidden">
                            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
                                Wallet Console
                            </p>
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                                Sign in
                            </h1>
                        </div>

                        <div className="hidden xl:block">
                            <h2 className="text-3xl font-semibold tracking-tight">
                                Access console
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-zinc-400">
                                Use email login, Google auth, or create a verified account.
                            </p>
                        </div>

                        <div className="mt-8 grid grid-cols-2 rounded-2xl border border-white/10 bg-zinc-900 p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("login");
                                    setErrorMessage(null);
                                    setInfoMessage(null);
                                }}
                                className={
                                    activeTab === "login"
                                        ? "rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950"
                                        : "rounded-xl px-4 py-3 text-sm font-semibold text-zinc-400 transition hover:bg-white/10 hover:text-white"
                                }
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("signup");
                                    setErrorMessage(null);
                                    setInfoMessage(null);
                                }}
                                className={
                                    activeTab === "signup"
                                        ? "rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950"
                                        : "rounded-xl px-4 py-3 text-sm font-semibold text-zinc-400 transition hover:bg-white/10 hover:text-white"
                                }
                            >
                                Sign up
                            </button>
                        </div>

                        {activeTab === "login" ? (
                            <div className="mt-8">
                                <form onSubmit={handleLogin} className="space-y-5">
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={loginEmail}
                                        onChange={setLoginEmail}
                                        placeholder="system@example.com"
                                        autoComplete="email"
                                    />

                                    <Input
                                        label="Password"
                                        type="password"
                                        value={loginPassword}
                                        onChange={setLoginPassword}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSubmitting ? "Signing in..." : "Sign in"}
                                    </button>
                                </form>

                            </div>

                        ) : null}

                        {activeTab === "signup" ? (
                            <div className="mt-8">
                                <form onSubmit={handleSignup} className="space-y-5">
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={signupEmail}
                                        onChange={setSignupEmail}
                                        placeholder="user@example.com"
                                        autoComplete="email"
                                    />

                                    <Input
                                        label="Password"
                                        type="password"
                                        value={signupPassword}
                                        onChange={setSignupPassword}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />

                                    <Input
                                        label="Confirm password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSubmitting ? "Creating account..." : "Create account"}
                                    </button>
                                </form>

                                {showOtpBox ? (
                                    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            Enter the OTP sent to {signupEmail}. If the previous OTP expired, request a new one.
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            Enter the OTP sent to {signupEmail}.
                                        </p>

                                        <div className="mt-4">
                                            <Input
                                                label="OTP"
                                                type="text"
                                                value={otp}
                                                onChange={setOtp}
                                                placeholder="123456"
                                                autoComplete="one-time-code"
                                            />
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={handleResendOtp}
                                                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Resend OTP
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={handleVerifyOtp}
                                                className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Verify OTP
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="my-7 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                                or
                            </span>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <GoogleAuthButton label={googleAuthLabel} />

                        {infoMessage ? (
                            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                {infoMessage}
                            </div>
                        ) : null}

                        {errorMessage ? (
                            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {errorMessage}
                            </div>
                        ) : null}

                    </div>
                </section>
            </div>
        </main>
    );
}

function Feature({ label }: { label: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
            {label}
        </div>
    );
}

function Input({
                   label,
                   type,
                   value,
                   onChange,
                   placeholder,
                   autoComplete,
               }: {
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    autoComplete?: string;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-zinc-300">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60"
                placeholder={placeholder}
                autoComplete={autoComplete}
                required
            />
        </div>
    );
}
