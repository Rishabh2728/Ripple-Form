const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code = "UNKNOWN_ERROR", status = 500, details?: any) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("formflow_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new ApiError("Failed to parse response", "RESPONSE_PARSE_ERROR", response.status);
    }
    return {} as T;
  }

  if (!response.ok) {
    const errObj = data?.error || {};
    throw new ApiError(
      errObj.message || "An unexpected error occurred",
      errObj.code || "API_ERROR",
      response.status,
      errObj.issues
    );
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<any>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: any) => request<any>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request<any>("/auth/me"),
  logout: () => request<any>("/auth/logout", { method: "POST" }),

  // Forms
  getForms: (status?: string) => request<any[]>(`/forms${status ? `?status=${status}` : ""}`),
  createForm: (body: any) => request<any>("/forms", { method: "POST", body: JSON.stringify(body) }),
  getForm: (id: string) => request<any>(`/forms/${id}`),
  updateForm: (id: string, body: any) => request<any>(`/forms/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteForm: (id: string, archive = false) => request<any>(`/forms/${id}?archive=${archive}`, { method: "DELETE" }),
  duplicateForm: (id: string) => request<any>(`/forms/${id}/duplicate`, { method: "POST" }),
  getFormHealth: (id: string) => request<any>(`/forms/${id}/health`),
  publishForm: (id: string) => request<any>(`/forms/${id}/publish`, { method: "POST" }),
  unpublishForm: (id: string) => request<any>(`/forms/${id}/unpublish`, { method: "POST" }),

  // Questions
  addQuestion: (formId: string, body: any) => request<any>(`/forms/${formId}/questions`, { method: "POST", body: JSON.stringify(body) }),
  updateQuestion: (questionId: string, body: any) => request<any>(`/questions/${questionId}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteQuestion: (questionId: string) => request<any>(`/questions/${questionId}`, { method: "DELETE" }),
  reorderQuestions: (formId: string, body: any) => request<any>(`/forms/${formId}/questions/reorder`, { method: "POST", body: JSON.stringify(body) }),

  // Public Respondent Flow
  getPublicForm: (slug: string) => request<any>(`/public/forms/${slug}`),
  submitPublicResponse: (slug: string, body: any) => request<any>(`/public/forms/${slug}/responses`, { method: "POST", body: JSON.stringify(body) }),

  // Responses & Analytics
  getResponses: (formId: string, page = 1, pageSize = 20, search?: string) =>
    request<any>(`/forms/${formId}/responses?page=${page}&page_size=${pageSize}${search ? `&search=${encodeURIComponent(search)}` : ""}`),
  getResponseDetail: (responseId: string) => request<any>(`/responses/${responseId}`),
  getAnalytics: (formId: string) => request<any>(`/forms/${formId}/analytics`),
  getExportUrl: (formId: string) => `${API_BASE_URL}/forms/${formId}/responses/export`,

  // Templates
  getTemplates: () => request<any[]>("/templates"),
  useTemplate: (templateId: string) => request<any>(`/templates/${templateId}/use`, { method: "POST" }),

  // AI
  generateAIForm: (prompt: string) => request<any>("/ai/generate-form", { method: "POST", body: JSON.stringify({ prompt }) }),
};
