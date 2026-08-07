export type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

export type Todo = {
  id: string;
  title: string;
  detail: string;
  priority: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  token: string;
  user: User;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || "İstek tamamlanamadı.", response.status);
  }

  return data as T;
}

export function register(input: { name: string; email: string; password: string }) {
  return request<AuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return request<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCurrentUser(token: string) {
  return request<{ user: User }>("/auth/me", {}, token);
}

export function getTodos(token: string) {
  return request<{ todos: Todo[] }>("/todos", {}, token);
}

export function createTodo(
  token: string,
  input: { title: string; detail: string; priority: boolean },
) {
  return request<{ todo: Todo }>(
    "/todos",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export function updateTodo(
  token: string,
  todoId: string,
  input: Partial<Pick<Todo, "title" | "detail" | "priority" | "completed">>,
) {
  return request<{ todo: Todo }>(
    `/todos/${todoId}`,
    { method: "PATCH", body: JSON.stringify(input) },
    token,
  );
}

export function removeTodo(token: string, todoId: string) {
  return request<void>(`/todos/${todoId}`, { method: "DELETE" }, token);
}

export function getNotes(token: string) {
  return request<{ notes: Note[] }>("/notes", {}, token);
}

export function createNote(token: string, content: string) {
  return request<{ note: Note }>(
    "/notes",
    { method: "POST", body: JSON.stringify({ content }) },
    token,
  );
}
