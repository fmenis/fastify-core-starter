export interface Profile {
  id: string;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type CreateProfile = Pick<Profile, "userId"> &
  Partial<Pick<Profile, "firstName" | "lastName" | "userName">>;
