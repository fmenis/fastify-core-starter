CREATE TABLE "user" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"          TEXT NOT NULL,
  "email"         TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "image"         TEXT,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "session" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"      UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "token"       TEXT NOT NULL UNIQUE,
  "expiresAt"   TIMESTAMP NOT NULL,
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "account" (
  "id"                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"                 UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accountId"              TEXT NOT NULL,
  "providerId"             TEXT NOT NULL,
  "accessToken"            TEXT,
  "refreshToken"           TEXT,
  "accessTokenExpiresAt"   TIMESTAMP,
  "refreshTokenExpiresAt"  TIMESTAMP,
  "scope"                  TEXT,
  "idToken"                TEXT,
  "password"               TEXT,
  "createdAt"              TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "verification" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "identifier"  TEXT NOT NULL,
  "value"       TEXT NOT NULL,
  "expiresAt"   TIMESTAMP NOT NULL,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "jwks" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "publicKey"   TEXT NOT NULL,
  "privateKey"  TEXT NOT NULL,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE "profile"
  ADD CONSTRAINT "profile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;
