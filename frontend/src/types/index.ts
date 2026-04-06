export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "PROCESSING" | "DONE";
  assignedUserId: string | null;
  assignee?: Pick<User, "id" | "name" | "email">;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetEntityId: string;
  details: Record<string, any>;
  createdAt: string;
  actor: Pick<User, "id" | "name" | "email">;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
