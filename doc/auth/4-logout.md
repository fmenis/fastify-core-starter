# BA — POST /auth/sign-out

Invalidates the current session and clears the session cookies.

## Internal flow (important!)

1. Reads the session token from cookie or `Authorization` header
2. Deletes the session record from the `session` table — immediately revoked
3. Returns `Set-Cookie: better-auth.session_token=; Max-Age=0` and `better-auth.session_data=; Max-Age=0` to clear the browser cookies
4. Returns `{ success: true }`

## DB records deleted (important!)

| Table     | Notes                      |
| --------- | -------------------------- |
| `session` | Record deleted on sign-out |

## Important: JWT is not revoked (important!)

The session is invalidated immediately, but any JWT already issued remains valid until its natural expiry (15 min). This is a known trade-off of stateless JWTs — once signed, they cannot be revoked.

In practice the risk window is at most 15 minutes.

## Input

No body. The session must be provided via one of:

| Method | How                                            | Client type  |
| ------ | ---------------------------------------------- | ------------ |
| Cookie | `better-auth.session_token` sent automatically | Browser      |
| Header | `Authorization: Bearer <session-token>`        | Mobile / API |

## Output

```json
{ "success": true }
```

`Set-Cookie` headers are returned to clear the session cookies on the client.

## Errors

| Code           | Status | Notes                               |
| -------------- | ------ | ----------------------------------- |
| `UNAUTHORIZED` | 401    | No session cookie / invalid session |
