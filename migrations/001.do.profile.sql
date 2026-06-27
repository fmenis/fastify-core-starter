CREATE TABLE IF NOT EXISTS "profile" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID UNIQUE,
    "firstName" VARCHAR(50),
    "lastName"  VARCHAR(50),
    "userName"  VARCHAR(50) UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP,
    "deletedAt" TIMESTAMP
);