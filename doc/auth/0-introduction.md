# Authentication model

The project uses a **hybrid session + JWT** model, following the refresh token pattern.

## Refresh token pattern

The session token acts as a **refresh token**: it is long-lived, server-side and revocable. The JWT acts as an **access token**: it is short-lived and stateless.

The session token is **never sent to API endpoints** — it is only used to obtain a new JWT. All protected API calls require a valid JWT in the `Authorization` header.

```
POST /auth/login
  → DB: INSERT session (token = "abc123xyz")
  → Cookie: better-auth.session_token = "abc123xyz"
  → Cookie: better-auth.session_data  = <encrypted data, 5 min>

GET /auth/token  (using session cookies)
  → BA reads session_data (cache hit, no DB query)
  → after 5 min: BA reads session_token → DB query
  → returns signed JWT (15 min)

GET /api/*  (protected)
  → Authorization: Bearer <JWT>
  → authentication.plugin.ts verifies signature against JWKS
  → no DB query

JWT expired
  → client calls GET /auth/token again with session cookie → new JWT
```

## Authentication flow

```
1. Register    POST /auth/register       → creates user (no session returned)
2. Login       POST /auth/login          → session token + cookie (30 days)
3. Get token   GET  /auth/token          → JWT access token (15 min)
4. API call    GET  /api/*               → Authorization: Bearer <JWT>
5. JWT expired                           → repeat step 3
6. Logout      POST /auth/logout         → session invalidated in DB, cookie cleared
```

## Elements

**`better-auth.session_token`** (cookie)

Contains the opaque string that identifies the session, e.g. `abc123xyz`. It is the reference to a row in the `session` table in the DB. Created at login, valid for 30 days. Has no cryptographic meaning — it is just a key.

---

**`better-auth.session_data`** (cookie)

An encrypted cache of the session data (userId, expiresAt, etc.) serialized directly into the cookie. Exists to avoid a DB query every time BA needs to validate the session. Expires after 5 minutes (`cookieCache.maxAge`). After expiry, BA falls back to reading from the DB using `session_token`.

---

**Session token** (concept)

The value inside `better-auth.session_token`. The term "session token" refers to the string, not the cookie. The same value can travel as a cookie (browser) or as `Authorization: Bearer` (mobile). In both cases it is the same session identifier.

---

**JWT**

Cryptographically signed token (EdDSA), obtained by calling `GET /auth/token` with the session cookie. Contains `{ id, email }` in the payload. Valid for 15 minutes. Does not require a DB lookup to be verified — only the public key from `/auth/jwks` is needed.

---

## Summary

|                        | Purpose                          | TTL     | DB?                |
| ---------------------- | -------------------------------- | ------- | ------------------ |
| `session_token` cookie | carries the session ID           | 30 days | Yes, it is the key |
| `session_data` cookie  | session data cache               | 5 min   | No                 |
| Session token (value)  | identifies the session in the DB | 30 days | Stored in DB       |
| JWT                    | authenticates API calls          | 15 min  | No                 |

The two cookies work together: `session_data` optimises performance, `session_token` is the fallback when the cache expires. The JWT is the end product — the credential that actually travels to the API.
