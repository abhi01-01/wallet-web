"use client";

import { SubmitEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { JsonBlock } from "@/components/ui/json-block";
import { MetricCard } from "@/components/ui/metric-card";
import { useAuth } from "@/features/auth/auth-provider";
import {
    createPaymentOrder,
    getPaymentOrderStatus,
    verifyPayment,
} from "@/features/payments/api";
import type {
    CreatePaymentOrderResponse,
    PaymentOrderStatusResponse,
    PurchasableAssetCode,
    VerifyPaymentResponse,
} from "@/features/payments/types";
import { formatMoney } from "@/lib/format";
import {
    loadRazorpayCheckout,
    type RazorpayCheckoutSuccessResponse,
} from "@/features/payments/razorpay";
import { resolveErrorMessage } from "@/lib/errors";

const purchasableAssets: PurchasableAssetCode[] = ["GOLD", "DIAMOND"];

export default function PaymentsPage() {
    const {user} = useAuth();

    type PaymentPhase = "CREATE_ORDER" | "PAY_VERIFY";
    const [paymentPhase, setPaymentPhase] =
        useState<PaymentPhase>("CREATE_ORDER");

    const ownerType = user?.ownerType ?? user?.role ?? null;
    const isNormalUser = ownerType === "USER";

    const currentUserId = user?.userId ?? user?.subject ?? "";
    const currentUserLabel =
        user?.ldap ?? user?.email ?? user?.displayName ?? "Current user";

    const [assetCode, setAssetCode] = useState<PurchasableAssetCode>("GOLD");
    const [amount, setAmount] = useState("100");

    const [statusOrderId, setStatusOrderId] = useState("");

    const [createdOrder, setCreatedOrder] =
        useState<CreatePaymentOrderResponse | null>(null);
    const [verifiedPayment, setVerifiedPayment] =
        useState<VerifyPaymentResponse | null>(null);
    const [orderStatus, setOrderStatus] =
        useState<PaymentOrderStatusResponse | null>(null);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const createOrderMutation = useMutation({
        mutationFn: createPaymentOrder,
        onSuccess: (order) => {
            setCreatedOrder(order);
            setVerifiedPayment(null);
            setOrderStatus(null);
            setStatusOrderId(order.orderId || order.razorpayOrderId);
            setPaymentPhase("PAY_VERIFY");
            setErrorMessage(null);
        },
        onError: (error) => {
            setPaymentPhase("CREATE_ORDER");
            setCreatedOrder(null);
            setErrorMessage(
                resolveErrorMessage(error, {
                    responseFallback: "Request failed. Check backend response.",
                })
            );
        },
    });

    const verifyMutation = useMutation({
        mutationFn: verifyPayment,
        onSuccess: (response) => {
            setVerifiedPayment(response);
            resetPaymentFlow();
            setErrorMessage(null);
        },
        onError: (error) => {
            resetPaymentFlow();
            setErrorMessage(
                resolveErrorMessage(error, {
                    responseFallback: "Request failed. Check backend response.",
                })
            );
        },
    });

    function resetPaymentFlow() {
        setPaymentPhase("CREATE_ORDER");
        setCreatedOrder(null);
    }

    const orderStatusMutation = useMutation({
        mutationFn: getPaymentOrderStatus,
        onSuccess: (response) => {
            setOrderStatus(response);
            setErrorMessage(null);
        },
        onError: (error) => {
            setErrorMessage(
                resolveErrorMessage(error, {
                    responseFallback: "Request failed. Check backend response.",
                })
            );
        },
    });

    function handleCreateOrder(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage(null);

        if (!isNormalUser) {
            setErrorMessage("Only USER accounts can create payment orders.");
            return;
        }

        if (!currentUserId) {
            setErrorMessage("Authenticated user ID is missing from token.");
            return;
        }

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setErrorMessage("Amount must be greater than zero.");
            return;
        }

        createOrderMutation.mutate({
            userId: currentUserId,
            assetCode,
            amount: numericAmount,
        });
    }

    async function handlePayNow() {
        if (!isNormalUser) {
            setErrorMessage("Only USER accounts can complete wallet payments.");
            return;
        }

        if (!createdOrder) {
            setErrorMessage("Create an order before opening Razorpay checkout.");
            return;
        }

        setErrorMessage(null);

        const loaded = await loadRazorpayCheckout();

        if (!loaded || !window.Razorpay) {
            setErrorMessage("Failed to load Razorpay checkout script.");
            return;
        }

        const key = createdOrder.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        if (!key) {
            setErrorMessage(
                "Razorpay key is missing. Return keyId from backend or set NEXT_PUBLIC_RAZORPAY_KEY_ID."
            );
            return;
        }

        const razorpay = new window.Razorpay({
            key,
            amount: createdOrder.amount,
            currency: createdOrder.currency,
            name: "Wallet Console",
            description: `${assetCode} wallet top-up`,
            image: `${window.location.origin}/wallet-console-logo.svg`,
            order_id: createdOrder.razorpayOrderId,
            prefill: {
                email: user?.email ?? undefined,
            },
            theme: {
                color: "#34d399",
            },
            modal: {
                ondismiss: () => {
                    resetPaymentFlow();
                    setErrorMessage("Payment was cancelled before completion.");
                },
            },
            handler: (response: RazorpayCheckoutSuccessResponse) => {
                verifyMutation.mutate({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                });
            },
        });

        razorpay.on("payment.failed", () => {
            resetPaymentFlow();
            setErrorMessage("Payment failed. Create a new order and try again.");
        });

        razorpay.open();
    }

    function handleCancelCreatedOrder() {
        resetPaymentFlow();
        setErrorMessage(null);
    }

    function handleCheckStatus(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage(null);

        if (!statusOrderId.trim()) {
            setErrorMessage("Order ID is required.");
            return;
        }

        orderStatusMutation.mutate(statusOrderId.trim());
    }

    const isBusy =
        createOrderMutation.isPending ||
        verifyMutation.isPending ||
        orderStatusMutation.isPending;

    return (
        <AppShell>
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                            Payments
                        </p>
                        <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                            Buy Asset Credits
                        </h2>
                        <p className="mt-4 max-w-3xl text-zinc-400">
                            Users can buy credits in the form of GOLD and DIAMOND which can be later spent purchasing in
                            house products.
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                        Owner Type: {ownerType ?? "UNKNOWN"}
                    </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <MetricCard
                        label="Puchase credits"
                        value={isNormalUser ? "Enabled" : "USER only"}
                        description="Convert into coins"
                        icon={<CreditCard className="h-5 w-5"/>}
                    />

                    <MetricCard
                        label="Purchasable Assets"
                        value="GOLD / DIAMOND"
                        description="LOYALTY is reward-only"
                    />

                    <MetricCard
                        label="Check order Status"
                        value="Available"
                        description="Check your created order status"
                        icon={<Search className="h-5 w-5"/>}
                    />
                </div>

                {errorMessage ? (
                    <Card className="mt-8 border-red-500/30 bg-red-500/10">
                        <p className="text-sm font-medium text-red-300">{errorMessage}</p>
                    </Card>
                ) : null}

                <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_460px]">
                    <div className="space-y-6">
                        {!isNormalUser ? (
                            <Card className="border-yellow-400/20 bg-yellow-400/10">
                                <div className="flex gap-3">
                                    <ShieldAlert className="mt-0.5 h-5 w-5 text-yellow-200"/>
                                    <div>
                                        <p className="text-sm font-medium text-yellow-100">
                                            Purchasing products is disabled for SYSTEM accounts.
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-yellow-100/70">
                                            SYSTEM can issue bonus rewards from Wallet Actions and can
                                            check payment order status.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ) : null}

                        {isNormalUser && paymentPhase === "CREATE_ORDER" ? (
                            <Card>
                                <p className="text-sm font-medium text-white">
                                    Create payment order
                                </p>

                                <form onSubmit={handleCreateOrder} className="mt-6 space-y-5">
                                    <div>
                                        <label className="text-sm font-medium text-zinc-300">
                                            Account
                                        </label>
                                        <div
                                            className="mt-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white">
                                            {currentUserLabel}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-medium text-zinc-300">
                                                Asset
                                            </label>
                                            <select
                                                value={assetCode}
                                                onChange={(event) =>
                                                    setAssetCode(
                                                        event.target.value as PurchasableAssetCode
                                                    )
                                                }
                                                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/60"
                                            >
                                                {purchasableAssets.map((asset) => (
                                                    <option key={asset} value={asset}>
                                                        {asset}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-zinc-300">
                                                Amount
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={amount}
                                                onChange={(event) => setAmount(event.target.value)}
                                                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/60"
                                                placeholder="100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div
                                        className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-xs leading-5 text-yellow-100/80">
                                        LOYALTY is intentionally absent from payment creation. It is
                                        reward-only and should be issued only by SYSTEM bonus.
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={createOrderMutation.isPending}
                                        className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {createOrderMutation.isPending
                                            ? "Creating order..."
                                            : "Create Razorpay order"}
                                    </button>
                                </form>
                            </Card>
                        ) : null}

                        {isNormalUser && paymentPhase === "PAY_VERIFY" && createdOrder ? (
                            <Card>
                                <p className="text-sm font-medium text-white">Pay and verify</p>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Order created. Complete payment through Razorpay, then backend
                                    verifies the signature and credits the wallet.
                                </p>

                                <div className="mt-6 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm">
                                    <p className="text-zinc-500">Razorpay Order ID</p>
                                    <p className="mt-1 break-all text-zinc-200">
                                        {createdOrder.razorpayOrderId}
                                    </p>
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm">
                                        <p className="text-zinc-500">Asset</p>
                                        <p className="mt-1 text-zinc-200">{assetCode}</p>
                                    </div>

                                    <div className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm">
                                        <p className="text-zinc-500">Amount</p>
                                        <p className="mt-1 text-zinc-200">
                                            {formatMoney(Number(amount || 0), "INR")}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-3 md:grid-cols-2">
                                    <button
                                        type="button"
                                        disabled={verifyMutation.isPending}
                                        onClick={handlePayNow}
                                        className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {verifyMutation.isPending ? "Verifying..." : "Pay now"}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={verifyMutation.isPending}
                                        onClick={handleCancelCreatedOrder}
                                        className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel order flow
                                    </button>
                                </div>
                            </Card>
                        ) : null}

                        <Card>
                            <p className="text-sm font-medium text-white">Check order status</p>

                            <form onSubmit={handleCheckStatus} className="mt-6 flex gap-3">
                                <div className="relative flex-1">
                                    <Search
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"/>
                                    <input
                                        value={statusOrderId}
                                        onChange={(event) => setStatusOrderId(event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-zinc-900 py-3 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/60"
                                        placeholder="Order ID"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={orderStatusMutation.isPending}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <RefreshCw className="h-4 w-4"/>
                                    Check
                                </button>
                            </form>
                        </Card>
                    </div>

                    <Card>
                        <p className="text-sm font-medium text-white">Payment state</p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Latest order, verification, and status responses.
                        </p>

                        {!createdOrder && !verifiedPayment && !orderStatus && !errorMessage ? (
                            <div
                                className="mt-8 rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-500">
                                No payment activity yet.
                            </div>
                        ) : null}

                        <div className="mt-6 space-y-6">
                            {createdOrder ? (
                                <JsonBlock title="Created Order" value={createdOrder}/>
                            ) : null}

                            {verifiedPayment ? (
                                <JsonBlock title="Verified Payment" value={verifiedPayment}/>
                            ) : null}

                            {orderStatus ? (
                                <JsonBlock title="Order Status" value={orderStatus}/>
                            ) : null}

                            {isBusy ? (
                                <p className="text-sm text-zinc-500">Processing request...</p>
                            ) : null}
                        </div>
                    </Card>
                </div>
        </AppShell>
    );
}
