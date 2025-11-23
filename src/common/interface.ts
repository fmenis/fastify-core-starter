export interface DocumentationError {
  code: string;
  description: string;
  apis: string[];
  statusCode: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}
