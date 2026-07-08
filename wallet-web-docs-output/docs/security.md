# Security Considerations

Wallet Web is a browser application and does not own final authorization. It reduces invalid actions in the UI and relies on gateway/backend enforcement for security.

## Security Boundaries

| Boundary | Responsibility |
|---|---|
| Browser | Stores tokens, renders owner-aware UI, sends API requests |
| wallet-web | UX gating and token refresh behavior |
| api-gateway | JWT validation, CORS, rate limiting, route protection |
| wallet-service | Business authorization, ownership checks, financial invariants |
| External providers | Google identity proof, Razorpay payment proof |

## Token Handling

| Control | Current implementation |
|---|---|
| Access token | Stored client-side and attached to API requests |
| Refresh token | Stored client-side, used for boot restoration and 401 recovery |
| Corrupt refresh token | Clears session and redirects to login |
| Revoked refresh token | Clears session on next boot/refresh attempt |
| Logout | Calls backend revoke endpoint, then clears local session |

## Sensitive Data Rules

| Data | UI rule |
|---|---|
| UUID userId | Kept internal; not displayed as identity |
| Refresh token | Never displayed |
| Access token | Never displayed |
| Idempotency key | Generated internally; not editable |
| Razorpay signature | Used for verification only; not surfaced as normal UI data |

## CORS and Origin Controls

Production frontend origin must be configured in:

- API Gateway CORS allowlist
- Google OAuth Authorized JavaScript origins
- Razorpay dashboard/domain expectations where applicable

## Frontend Hardening Checklist

| Check | Status target |
|---|---|
| No console logging of tokens | Required |
| No rendering of user UUID as identity | Required |
| SYSTEM-only routes hidden from USER | Required |
| USER-only destructive actions hidden from SYSTEM | Required |
| Refresh failure clears all local tokens | Required |
| API errors rendered without stack traces | Required |
| Build uses production gateway URL | Required |
| Public env vars contain no secrets | Required |
