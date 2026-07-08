# Payments and Razorpay Checkout

Payments are USER-only for order creation and checkout. USER and SYSTEM accounts can check order status.

## Access Rules

| Action | USER | SYSTEM |
|---|---:|---:|
| Create payment order | Yes | No |
| Pay and verify | Yes | No |
| Check order status | Yes | Yes |

## Payment UI State Machine

```mermaid
stateDiagram-v2
    [*] --> CREATE_ORDER
    CREATE_ORDER --> PAY_VERIFY: create-order success
    PAY_VERIFY --> CREATE_ORDER: payment verified
    PAY_VERIFY --> CREATE_ORDER: payment failed
    PAY_VERIFY --> CREATE_ORDER: Razorpay modal dismissed
    PAY_VERIFY --> CREATE_ORDER: backend verification failed
    PAY_VERIFY --> CREATE_ORDER: cancel order flow
```

## Checkout Flow

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Web as wallet-web
    participant Razorpay
    participant Gateway as api-gateway
    participant Service as wallet-service

    User->>Web: Select asset and amount
    Web->>Gateway: POST /api/v1/payments/create-order
    Gateway->>Service: Forward request
    Service-->>Gateway: local order + razorpayOrderId
    Gateway-->>Web: order response
    Web->>Web: Hide create-order card, show pay/verify card
    Web->>Razorpay: Open checkout
    alt payment success
        Razorpay-->>Web: payment id + signature
        Web->>Gateway: POST /api/v1/payments/verify
        Gateway->>Service: Verify signature and credit wallet
        Service-->>Gateway: verification response
        Gateway-->>Web: success
        Web->>Web: Reset to CREATE_ORDER phase
    else payment failure or dismissed
        Razorpay-->>Web: failed or dismissed
        Web->>Web: Reset to CREATE_ORDER phase
    end
```

## Asset Rules

| Asset | Payment order creation |
|---|---:|
| GOLD | Enabled |
| DIAMOND | Enabled |
| LOYALTY | Disabled; reward-only asset |

## Razorpay Webhook

`POST /api/v1/webhooks/razorpay` is not called by Wallet Web. Razorpay calls this endpoint server-to-server using the configured webhook URL and `X-Razorpay-Signature` header.

Frontend verification gives immediate UX feedback. Webhook reconciliation protects against browser crashes, network failures, and late payment events.

## Failure Handling

| Failure | UI behavior |
|---|---|
| Create order fails | Stay in CREATE_ORDER phase and show error |
| Payment modal dismissed | Reset to CREATE_ORDER phase |
| Payment failed event | Reset to CREATE_ORDER phase |
| Verification API fails | Reset to CREATE_ORDER phase and show error |
| Verification succeeds | Reset to CREATE_ORDER phase and show latest verification state |
