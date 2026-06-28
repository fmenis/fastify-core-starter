# BA — POST /auth/sign-up/email

Registers a new user with email and password.

## Internal flow (important!)

1. Validates input (format, password length)
2. Checks for duplicate email on `user` table → 422 if found
3. Hashes password with bcrypt (stored in `account`, not `user`)
4. INSERT into `user` (`emailVerified: false`)
5. `databaseHook user.create.after` → INSERT into `profile` (`userId`)
6. INSERT into `session`
7. Returns `{ token, user }` + `Set-Cookie`

## DB records created (important!)

| Table     | Notes                                        |
| --------- | -------------------------------------------- |
| `user`    | `emailVerified: false`                       |
| `account` | bcrypt password hash (BA-managed)            |
| `session` | Active session, token returned to client     |
| `profile` | Created via `databaseHook user.create.after` |

## Session behavior (important!)

BA always creates an active session at sign-up and returns both the token and the cookie. The caller decides whether to forward them to the client or discard them.

## Input

| Field      | Type   | Required | Notes                           |
| ---------- | ------ | -------- | ------------------------------- |
| `name`     | string | Yes      | Display name                    |
| `email`    | string | Yes      | Must be unique                  |
| `password` | string | Yes      | 8–128 chars, hashed with bcrypt |
| `image`    | string | No       | Profile image URL               |

## Output

```json
{ "token": "<session-token>", "user": { ... } }
```

`Set-Cookie` header with the session token is also set.

In this project the session is currently discarded at the wrapper level — see `src/modules/auth/routes/signup.route.ts`.

## Errors

| Code                                    | Status |
| --------------------------------------- | ------ |
| `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` | 422    |
