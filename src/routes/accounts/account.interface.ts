export interface Account {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateAccount = Pick<
  Account,
  "firstName" | "lastName" | "userName" | "email" | "password"
>;
