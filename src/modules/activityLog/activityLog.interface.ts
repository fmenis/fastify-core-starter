import type {
  ActorType,
  JsonValue,
  ResourceType,
} from "../../generated/kysely/types.js";

export interface ActivityLog {
  id: string;
  actorId: string;
  actorType: ActorType;
  action: string;
  resourceType: ResourceType;
  resourceId: string;
  changes: JsonValue | null;
  createdAt: Date;
}

export type CreateActivityLog = Omit<ActivityLog, "id" | "createdAt">;
