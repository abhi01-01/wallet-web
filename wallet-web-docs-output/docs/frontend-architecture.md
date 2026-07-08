# Frontend Application Architecture

Wallet Web uses feature-based organization. Each domain owns API calls, types, and page-specific UI components.

## Layering

```mermaid
flowchart TB
    App["src/app\nroute segments"]
    Layout["components/layout\nAppShell, Sidebar, Topbar"]
    UI["components/ui\nCard, MetricCard, JsonBlock"]
    Features["features/*\ndomain API, types, components"]
    Lib["lib\napi client, response unwrap, formatters"]

    App --> Layout
    App --> UI
    App --> Features
    Features --> Lib
    Features --> UI
    Layout --> Features
```

## Feature Modules

| Module | Responsibility |
|---|---|
| `features/auth` | Token storage, JWT decoding, auth provider, protected route, Google auth button |
| `features/users` | SYSTEM user option dropdown for wallets, ledger, and bonus flows |
| `features/wallets` | Balance API, normalization, summary cards, records table, details panel |
| `features/ledger` | Asset-filtered ledger API, table, entry details |
| `features/payments` | Razorpay script loading, order creation, verification, status checks |
| `features/wallet-actions` | Spend and bonus request contracts |
| `features/messaging` | Outbox and Kafka audit dashboards |
| `features/profile` | Close-account API |

## State Categories

| State | Storage |
|---|---|
| Access token | `localStorage` |
| Refresh token | `localStorage` |
| Authenticated user projection | React context from decoded JWT |
| Server data | TanStack Query |
| Form transitions | Local component state |
| Payment phase | Explicit component state: `CREATE_ORDER` or `PAY_VERIFY` |

## API Client Flow

```mermaid
sequenceDiagram
    autonumber
    participant Page
    participant QueryOrMutation as Query/Mutation
    participant ApiClient as Axios apiClient
    participant Gateway
    participant Auth as Auth Refresh

    Page->>QueryOrMutation: trigger request
    QueryOrMutation->>ApiClient: call API
    ApiClient->>ApiClient: attach access token
    ApiClient->>Gateway: request
    alt access token valid
        Gateway-->>ApiClient: 2xx response
    else access token expired
        Gateway-->>ApiClient: 401
        ApiClient->>Auth: refreshAccessTokenSafely()
        Auth-->>ApiClient: new access token
        ApiClient->>Gateway: retry original request once
        Gateway-->>ApiClient: response
    end
    ApiClient-->>QueryOrMutation: normalized response
    QueryOrMutation-->>Page: UI state
```

## Component Rules

| Rule | Rationale |
|---|---|
| Keep user UUID internal | Avoid leaking implementation identifiers in UI |
| Use reusable `UserOptionSelect` | Prevent duplicate SYSTEM dropdown logic |
| Hide SYSTEM-only cards from USER | Reduce confusion and accidental invalid actions |
| Hide USER-only cards from SYSTEM | Keep operational flows aligned with backend authorization |
| Never expose idempotency key fields | Idempotency is a system concern, not an operator field |
| Normalize API responses near API module | Page components stay aligned to domain objects |
