export interface Account {
  id: string;
  firstName: string;
  lastName: string;
  nicknameName?: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
