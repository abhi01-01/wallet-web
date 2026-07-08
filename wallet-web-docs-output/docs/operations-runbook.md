# Operations Runbook

## Common Incidents

### Frontend cannot reach API

Symptoms:

```text
Network error
ERR_CONNECTION_REFUSED
API calls go to localhost:3000 or localhost:3001
```

Checks:

| Check | Expected |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Gateway origin, not frontend origin |
| Docker build args | API base URL passed during build |
| Gateway container | Running and bound to expected host port |
| CORS | Frontend origin allowed |

### User is logged out after refresh

Checks:

| Check | Expected |
|---|---|
| Refresh token exists | `wallet_refresh_token` in storage |
| Refresh endpoint public | `POST /api/v1/auth/refresh-token` reachable through gateway |
| Backend token valid | DB refresh token not expired/revoked |
| Axios refresh flow | Calls refresh before rendering protected pages |

### Google login shows origin error

Symptoms:

```text
[GSI_LOGGER]: The given origin is not allowed for the given client ID
Error 401: invalid_client
no registered origin
```

Resolution:

| Check | Expected |
|---|---|
| Browser `window.location.origin` | Exact origin exists in Google Authorized JavaScript origins |
| OAuth client type | Web application |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same client ID edited in Google Cloud Console |
| Next server | Restarted/rebuilt after env change |

### Payment UI remains on pay/verify card

Cause:

```text
Payment phase still PAY_VERIFY or createdOrder not cleared
```

Expected behavior:

| Event | UI phase |
|---|---|
| Payment success + verify success | CREATE_ORDER |
| Payment failure | CREATE_ORDER |
| Modal dismissed | CREATE_ORDER |
| Verification error | CREATE_ORDER |

### SYSTEM cannot see bonus/dashboard cards

Checks:

| Check | Expected |
|---|---|
| JWT claim | `ownerType: SYSTEM` |
| JWT decoder | Maps `ownerType` into auth user projection |
| Page logic | Uses `ownerType`, not only generic `role` |

### Wallet or ledger SYSTEM dropdown is empty

Checks:

| Check | Expected |
|---|---|
| Endpoint | `GET /api/v1/admin/users/options` exists |
| Access | SYSTEM only |
| Response | `userId`, `email`, `ldap`, `ownerType` |
| Data | At least one active USER account exists |

## Smoke Test Commands

```bash
npm ci
npm run build
```

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
  --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
  -t wallet-web:smoke .
```

```bash
docker run --rm -p 3000:3000 wallet-web:smoke
```
