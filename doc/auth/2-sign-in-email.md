# BA — POST /auth/sign-in/email

Authenticates an existing user with email and password.

## Internal flow (important!)

1. Looks up user by email on `user` table → 401 if not found
2. Compares password against bcrypt hash in `account` table → 401 if mismatch
3. _(when `requireEmailVerification: true`)_ checks `emailVerified` → 403 if false
4. INSERT into `session` (new record for every sign-in)
5. If `session.cookieCache.enabled: true` → serializes encrypted session data into the cookie, avoiding a DB round-trip for the next 5 min (`cookieCache.maxAge`)
6. Returns `{ token, user }` + `Set-Cookie`

## DB records created (important!)

| Table     | Notes                                  |
| --------- | -------------------------------------- |
| `session` | New record on every successful sign-in |

## Session behavior (important!)

Unlike sign-up, the session token and cookie are intentionally forwarded to the client — this is the authentication endpoint.

Multiple sessions for the same user are allowed (e.g., different devices). Each sign-in creates an independent session record.

## Input

| Field        | Type    | Required | Notes                                          |
| ------------ | ------- | -------- | ---------------------------------------------- |
| `email`      | string  | Yes      |                                                |
| `password`   | string  | Yes      |                                                |
| `rememberMe` | boolean | No       | If `false` or omitted, cookie has no `Max-Age` |

## Output

```json
{ "token": "<session-token>", "user": { ... } }
```

`Set-Cookie` header with the session token is also set. If `rememberMe: true`, the cookie expires in 30 days (`session.expiresIn`). Otherwise it is a session cookie (no `Max-Age`, cleared when the browser closes).

## Errors

| Code                        | Status | Notes                                      |
| --------------------------- | ------ | ------------------------------------------ |
| `INVALID_EMAIL_OR_PASSWORD` | 401    |                                            |
| `EMAIL_NOT_VERIFIED`        | 403    | Only when `requireEmailVerification: true` |
