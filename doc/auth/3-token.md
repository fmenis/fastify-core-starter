# BA — GET /auth/token

Exchanges a valid session for a short-lived JWT access token.

## Internal flow (important!)

1. Reads the session token from cookie or `Authorization` header
2. Checks `better-auth.session_data` cookie (encrypted cache, 5 min) → if valid, skips DB query
3. If cache expired or absent → queries `session` table by token
4. Validates session: exists, not expired, not revoked → 401 otherwise
5. Signs a new JWT with the server's EdDSA private key
6. Returns `{ token: "<jwt>" }`

## Input

No body. The session must be provided via one of:

| Method | How                                            | Client type  |
| ------ | ---------------------------------------------- | ------------ |
| Cookie | `better-auth.session_token` sent automatically | Browser      |
| Header | `Authorization: Bearer <session-token>`        | Mobile / API |

## Output

```json
{ "token": "<jwt>" }
```

The JWT is signed with **EdDSA (Ed25519)** and contains:

```json
{ "id": "uuid", "email": "user@example.com" }
```

Valid for **15 minutes**. After expiry, call this endpoint again.

## Usage after this call

```
Authorization: Bearer <jwt>
```

Send this header on every protected API call. The JWT is verified by `authentication.plugin.ts` against the public JWKS (`/auth/jwks`) — no DB query involved.

## Errors

| Code           | Status | Notes                                                       |
| -------------- | ------ | ----------------------------------------------------------- |
| `UNAUTHORIZED` | 401    | No session cookie / invalid session token / session expired |

## Notes

- Every call returns a **new** JWT — there is no token reuse.
- The session token itself is never forwarded to protected API endpoints; only the JWT is.
- Public JWKS endpoint for JWT verification: `GET /auth/jwks`.
