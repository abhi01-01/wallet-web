export type PurchasableAssetCode = "GOLD" | "DIAMOND";

export type CreatePaymentOrderRequest = {
    userId: string;
    assetCode: PurchasableAssetCode;
    amount: number;
};

export type CreatePaymentOrderResponse = {
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId?: string;
    receipt?: string;
    status?: string;
};

export type VerifyPaymentRequest = {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
};

export type VerifyPaymentResponse = {
    paymentId?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    orderId?: string;
    status?: string;
    message?: string;
};

export type PaymentOrderStatusResponse = {
    orderId?: string;
    razorpayOrderId?: string;
    status?: string;
    amount?: number;
    currency?: string;
    assetCode?: string;
    createdAt?: string;
    updatedAt?: string;
};
