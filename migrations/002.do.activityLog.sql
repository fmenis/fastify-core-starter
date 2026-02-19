CREATE TYPE actor_type AS ENUM ('USER', 'SYSTEM');
CREATE TYPE resource_type AS ENUM ('ACCOUNT', 'ORDER');

CREATE TABLE IF NOT EXISTS "activityLog" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "actorId"      UUID NOT NULL,
  "actorType"    actor_type NOT NULL,
  "action"       TEXT NOT NULL,
  "resourceType" resource_type NOT NULL,
  "resourceId"   UUID NOT NULL,
  "changes"      JSONB,
  "createdAt"    timestamp NOT NULL DEFAULT NOW()
);
