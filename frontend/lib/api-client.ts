const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");

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
      throw new ApiError("Failed to parse server response", "RESPONSE_PARSE_ERROR", response.status);
    }
    return {} as T;
  }

  if (!response.ok) {
    let errObj = data?.error;
    if (!errObj && data?.detail) {
      if (typeof data.detail === "object" && data.detail.error) {
        errObj = data.detail.error;
      } else if (typeof data.detail === "object") {
        errObj = data.detail;
      } else if (typeof data.detail === "string") {
        errObj = { message: data.detail };
      }
    }
    errObj = errObj || {};

    const message = errObj.message || (typeof data?.detail === "string" ? data.detail : "An unexpected error occurred");
    const code = errObj.code || "API_ERROR";

    throw new ApiError(
      message,
      code,
      response.status,
      errObj.issues
    );
  }

  return data as T;
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => request<any>("/auth/me"),

  // Forms
  getForms: (page = 1, limit = 10, search = "", status = "") => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    return request<any[]>(`/forms${params.toString() ? `?${params.toString()}` : ""}`);
  },

  createForm: (data: { title: string; description?: string; theme_id?: string; questions?: any[] }) =>
    request<any>("/forms", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getForm: (id: string) => request<any>(`/forms/${id}`),

  updateForm: (id: string, data: Partial<{ title: string; description: string; theme_id: string; thank_you_title: string; thank_you_message: string; allow_back_navigation: boolean; show_progress: boolean }>) =>
    request<any>(`/forms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteForm: (id: string) =>
    request<{ message: string }>(`/forms/${id}`, {
      method: "DELETE",
    }),

  duplicateForm: (id: string) =>
    request<any>(`/forms/${id}/duplicate`, {
      method: "POST",
    }),

  publishForm: (id: string) =>
    request<{ id: string; status: string; published_at: string; version_number: number }>(`/forms/${id}/publish`, {
      method: "POST",
    }),

  unpublishForm: (id: string) =>
    request<{ id: string; status: string }>(`/forms/${id}/unpublish`, {
      method: "POST",
    }),

  getFormHealth: (id: string) =>
    request<{ form_id: string; is_valid: boolean; issues: any[] }>(`/forms/${id}/health`),

  // Questions
  addQuestion: (formId: string, data: { type: string; title: string; description?: string; required?: boolean; position?: number; settings_json?: any; options?: any[] }) =>
    request<any>(`/forms/${formId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateQuestion: (questionId: string, data: Partial<{ type: string; title: string; description: string; required: boolean; position: number; settings_json: any; options: any[] }>) =>
    request<any>(`/questions/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteQuestion: (questionId: string) =>
    request<{ message: string }>(`/questions/${questionId}`, {
      method: "DELETE",
    }),

  reorderQuestions: (formId: string, data: { questions: { id: string; position: number }[] }) =>
    request<{ message: string }>(`/forms/${formId}/questions/reorder`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Templates
  getTemplates: () => request<any[]>("/templates"),
  useTemplate: (templateId: string) =>
    request<any>(`/templates/${templateId}/use`, {
      method: "POST",
    }),

  // AI Generator
  generateFormAI: (prompt: string) =>
    request<any>("/ai/generate", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),

  generateAIForm: (prompt: string) =>
    request<any>("/ai/generate", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),

  // Public Respondent Endpoints
  getPublicForm: (slug: string) => request<any>(`/public/f/${slug}`),

  submitPublicResponse: (slug: string, data: { respondent_token: string; answers: { question_id: string; value: any }[]; completion_time_seconds?: number }) =>
    request<{ response_id: string; status: string; thank_you_title: string; thank_you_message: string }>(`/public/f/${slug}/submit`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Response Management & Analytics
  getResponses: (formId: string, page = 1, limit = 15, search = "") => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append("search", search);
    return request<{ responses: any[]; total: number; page: number; total_pages: number }>(`/forms/${formId}/responses?${params.toString()}`);
  },

  getResponseDetail: (responseId: string) => request<any>(`/responses/${responseId}`),

  getExportUrl: (formId: string) => `${API_BASE_URL}/forms/${formId}/responses/export`,

  getAnalytics: (formId: string) => request<any>(`/forms/${formId}/analytics`),
};
