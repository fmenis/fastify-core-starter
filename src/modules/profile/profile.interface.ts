export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type CreateProfile = Pick<
  Profile,
  "firstName" | "lastName" | "userName" | "email" | "password"
>;
