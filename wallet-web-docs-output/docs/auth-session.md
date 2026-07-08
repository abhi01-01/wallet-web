# Authentication and Session Persistence

Wallet Web supports email/password login, signup with OTP verification, Google Identity login, access-token persistence, refresh-token restoration, and logout.

## Auth Token Payload

The access token is decoded into a UI-safe projection.

```json
{
  "sub": "5e23b834-774b-4dba-a778-e52b306832ce",
  "email": "something@gmail.com",
  "ownerType": "SYSTEM",
  "iat": 1783262251,
  "exp": 1783263151
}
```

Frontend projection:

| Claim              | UI field                         |
|--------------------|----------------------------------|
| `sub`              | internal `userId` fallback       |
| `email`            | visible account email            |
| `email` before `@` | visible LDAP                     |
| `ownerType`        | access model: `USER` or `SYSTEM` |
| `exp`              | access-token expiry check        |

## Session Boot Flow

```mermaid
flowchart TD
    Boot["App boot"]
    Tokens{"Tokens in storage?"}
    Refresh{"Refresh token present?"}
    CallRefresh["Call /api/v1/auth/refresh-token"]
    Success{"Refresh success?"}
    Accept["Store new access token\nDecode user\nRender protected app"]
    Clear["Clear tokens\nRedirect /login"]

    Boot --> Tokens
    Tokens -- no --> Clear
    Tokens -- yes --> Refresh
    Refresh -- yes --> CallRefresh
    CallRefresh --> Success
    Success -- yes --> Accept
    Success -- no --> Clear
    Refresh -- no --> Clear
```

The refresh token is treated as the real session authority. A corrupted, expired, or revoked refresh token clears the session even if the previous access token has not expired.

## Refresh-on-401 Flow

```mermaid
sequenceDiagram
    autonumber
    participant UI
    participant Api as apiClient
    participant Gateway
    participant Auth as refresh-token endpoint

    UI->>Api: request protected resource
    Api->>Gateway: request with access token
    Gateway-->>Api: 401
    Api->>Auth: POST /api/v1/auth/refresh-token
    alt refresh succeeds
        Auth-->>Api: new access token
        Api->>Gateway: retry original request once
        Gateway-->>Api: 2xx
    else refresh fails
        Auth-->>Api: 401/403
        Api->>Api: clear tokens
        Api-->>UI: redirect /login
    end
```

## Google Auth Flow

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Web as wallet-web
    participant Google as Google Identity Services
    participant Gateway as api-gateway
    participant Service as wallet-service

    User->>Web: Click Sign in with Google
    Web->>Google: GoogleLogin component
    Google-->>Web: ID token credential
    Web->>Gateway: POST /api/v1/auth/google { idToken }
    Gateway->>Service: Forward request
    Service->>Service: Verify token audience and identity
    Service-->>Gateway: accessToken + refreshToken
    Gateway-->>Web: AuthResponse
    Web->>Web: persist tokens and navigate /dashboard
```

## Deprecated OAuth Success Endpoint

`POST /api/v1/auth/oauth2/success` is not used by Wallet Web. The active frontend flow uses Google Identity Services and `POST /api/v1/auth/google`.

The deprecated endpoint can remain available temporarily for legacy backend-managed OAuth2 redirect experiments, but it is not part of the production frontend integration.

## Storage Risk

Access and refresh tokens are currently stored in `localStorage`. This is practical for this console but has XSS exposure risk. Production hardening options:

| Option                                           | Trade-off                                                         |
|--------------------------------------------------|-------------------------------------------------------------------|
| `localStorage`                                   | Simple, survives reloads, exposed to XSS                          |
| HttpOnly secure cookie                           | Better token protection, requires backend/gateway cookie strategy |
| In-memory access token + HttpOnly refresh cookie | Stronger browser posture, more implementation complexity          |
