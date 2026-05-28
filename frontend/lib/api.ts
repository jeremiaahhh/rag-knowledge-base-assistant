import type {
  ChatResponse,
  DocumentList,
  DocumentRead,
  HealthResponse,
  ResetResponse,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { parseJson?: boolean },
): Promise<T> {
  const { parseJson = true, ...rest } = init ?? {};
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body && !(rest.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...rest.headers,
    },
  });

  if (!response.ok) {
    let code: string | undefined;
    let message = `Request failed with status ${response.status}`;
    let details: unknown;
    try {
      const body = await response.json();
      code = body?.error?.code;
      message = body?.error?.message ?? message;
      details = body?.error?.details;
    } catch {
      /* non-JSON body */
    }
    throw new ApiError(message, response.status, code, details);
  }

  if (response.status === 204 || !parseJson) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  health: () => request<HealthResponse>("/health"),
  listDocuments: () => request<DocumentList>("/documents"),
  getDocument: (id: string) => request<DocumentRead>(`/documents/${id}`),
  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<DocumentRead>("/documents/upload", {
      method: "POST",
      body: form,
    });
  },
  deleteDocument: (id: string) =>
    request<void>(`/documents/${id}`, { method: "DELETE", parseJson: false }),
  resetKnowledgeBase: () =>
    request<ResetResponse>("/documents/reset", { method: "POST" }),
  chat: (question: string, top_k?: number) =>
    request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ question, top_k }),
    }),
};
