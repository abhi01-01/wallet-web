# Profile and Account Closure

The profile page displays non-sensitive identity information and allows USER accounts to close their own account.

## Displayed Identity

| Field | Display |
|---|---|
| LDAP | Email string before `@` |
| Email | Account email |
| Owner Type | `USER` or `SYSTEM` |
| User ID | Hidden |

## Close Account API

```http
DELETE /api/v1/auth/close-account
Content-Type: application/json

{
  "confirmForfeitBalance": true
}
```

Axios uses `data` for DELETE request bodies.

```ts
apiClient.delete("/api/v1/auth/close-account", {
  data: {
    confirmForfeitBalance: true,
  },
});
```

## UX Rules

| Owner type | Close account button |
|---|---:|
| USER | Visible |
| SYSTEM | Hidden/blocked |

## Confirmation Flow

```mermaid
flowchart TD
    Profile["Open profile"]
    Owner{"ownerType == USER?"}
    Hidden["Show account lifecycle card only"]
    Form["Show close-account form"]
    Check["User checks forfeit balance confirmation"]
    Type["User types DELETE"]
    Submit["DELETE /api/v1/auth/close-account"]
    Success["Clear tokens and redirect /login"]
    Error["Show API error"]

    Profile --> Owner
    Owner -- no --> Hidden
    Owner -- yes --> Form
    Form --> Check --> Type --> Submit
    Submit -- success --> Success
    Submit -- failure --> Error
```

Backend remains responsible for preventing SYSTEM account closure through this endpoint.
