export type RazorpayCheckoutSuccessResponse = {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
};

export type RazorpayPaymentFailedResponse = {
    error?: {
        code?: string;
        description?: string;
        source?: string;
        step?: string;
        reason?: string;
        metadata?: {
            order_id?: string;
            payment_id?: string;
        };
    };
};

export type RazorpayCheckoutOptions = {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;

    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };

    theme?: {
        color?: string;
    };

    handler: (response: RazorpayCheckoutSuccessResponse) => void;

    modal?: {
        ondismiss?: () => void;
    };
};

export type RazorpayInstance = {
    open: () => void;
    on: (
        eventName: "payment.failed",
        callback: (response: RazorpayPaymentFailedResponse) => void
    ) => void;
};

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
    }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export function loadRazorpayCheckout(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve(false);
            return;
        }

        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const existingScript = document.querySelector<HTMLScriptElement>(
            `script[src="${RAZORPAY_SCRIPT_URL}"]`
        );

        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true));
            existingScript.addEventListener("error", () => resolve(false));
            return;
        }

        const script = document.createElement("script");
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
}
