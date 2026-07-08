import { apiClient } from "@/lib/api-client";
import { unwrapApiResponse } from "@/lib/api-response";
import type {
    CreatePaymentOrderRequest,
    CreatePaymentOrderResponse,
    PaymentOrderStatusResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
} from "./types";

type UnknownObject = Record<string, unknown>;

export async function createPaymentOrder(request: CreatePaymentOrderRequest) {
    const response = await apiClient.post(
        "/api/v1/payments/create-order",
        request
    );

    const payload = unwrapApiResponse<UnknownObject>(response.data);

    return normalizeCreateOrderResponse(payload);
}

export async function verifyPayment(request: VerifyPaymentRequest) {
    const response = await apiClient.post("/api/v1/payments/verify", request);

    const payload = unwrapApiResponse<UnknownObject>(response.data);

    return normalizeVerifyPaymentResponse(payload);
}

export async function getPaymentOrderStatus(orderId: string) {
    const response = await apiClient.get(
        `/api/v1/payments/order-status/${encodeURIComponent(orderId)}`
    );

    const payload = unwrapApiResponse<UnknownObject>(response.data);

    return normalizeOrderStatusResponse(payload);
}

function normalizeCreateOrderResponse(
    payload: UnknownObject
): CreatePaymentOrderResponse {
    const razorpayOrderId =
        payload.razorpayOrderId ??
        payload.razorpay_order_id ??
        payload.orderId ??
        payload.id;

    const orderId = payload.orderId ?? payload.paymentOrderId ?? razorpayOrderId;

    if (typeof razorpayOrderId !== "string" || razorpayOrderId.length === 0) {
        throw new Error("Create order response does not contain Razorpay order id");
    }

    return {
        orderId: String(orderId),
        razorpayOrderId,
        amount: Number(payload.amount ?? 0),
        currency: String(payload.currency ?? "INR"),
        keyId:
            typeof payload.keyId === "string"
                ? payload.keyId
                : typeof payload.key === "string"
                    ? payload.key
                    : undefined,
        receipt:
            typeof payload.receipt === "string"
                ? payload.receipt
                : undefined,
        status:
            typeof payload.status === "string"
                ? payload.status
                : undefined,
    };
}

function normalizeVerifyPaymentResponse(
    payload: UnknownObject
): VerifyPaymentResponse {
    return {
        paymentId:
            typeof payload.paymentId === "string" ? payload.paymentId : undefined,
        razorpayPaymentId:
            typeof payload.razorpayPaymentId === "string"
                ? payload.razorpayPaymentId
                : typeof payload.razorpay_payment_id === "string"
                    ? payload.razorpay_payment_id
                    : undefined,
        razorpayOrderId:
            typeof payload.razorpayOrderId === "string"
                ? payload.razorpayOrderId
                : typeof payload.razorpay_order_id === "string"
                    ? payload.razorpay_order_id
                    : undefined,
        orderId:
            typeof payload.orderId === "string" ? payload.orderId : undefined,
        status:
            typeof payload.status === "string" ? payload.status : undefined,
        message:
            typeof payload.message === "string" ? payload.message : undefined,
    };
}

function normalizeOrderStatusResponse(
    payload: UnknownObject
): PaymentOrderStatusResponse {
    return {
        orderId:
            typeof payload.orderId === "string"
                ? payload.orderId
                : typeof payload.id === "string"
                    ? payload.id
                    : undefined,
        razorpayOrderId:
            typeof payload.razorpayOrderId === "string"
                ? payload.razorpayOrderId
                : typeof payload.razorpay_order_id === "string"
                    ? payload.razorpay_order_id
                    : undefined,
        status:
            typeof payload.status === "string" ? payload.status : undefined,
        amount:
            payload.amount === undefined || payload.amount === null
                ? undefined
                : Number(payload.amount),
        currency:
            typeof payload.currency === "string" ? payload.currency : undefined,
        assetCode:
            typeof payload.assetCode === "string" ? payload.assetCode : undefined,
        createdAt:
            typeof payload.createdAt === "string" ? payload.createdAt : undefined,
        updatedAt:
            typeof payload.updatedAt === "string" ? payload.updatedAt : undefined,
    };
}