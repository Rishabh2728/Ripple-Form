export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating"
  | "nps";

export interface QuestionOption {
  id?: string;
  label: string;
  value: string;
  position?: number;
}

export interface QuestionSettings {
  min_length?: number;
  max_length?: number;
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface Question {
  id: string;
  form_id?: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  position: number;
  settings_json?: QuestionSettings;
  options?: QuestionOption[];
}

export type FormStatus = "draft" | "published" | "archived";

export interface FormTheme {
  id: string;
  name: string;
  background: string;
  surface: string;
  accent: string;
  text: string;
  border: string;
}

export interface Form {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  slug: string;
  status: FormStatus;
  theme_id: string;
  theme_data?: Record<string, any>;
  thank_you_title: string;
  thank_you_message: string;
  allow_back_navigation: boolean;
  show_progress: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  questions: Question[];
  question_count?: number;
  response_count?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  workspace_id: string;
  workspace_name: string;
  created_at: string;
  last_login_at?: string;
}

export interface FormHealthIssue {
  question_id?: string;
  question_title?: string;
  issue: string;
}

export interface FormHealthResponse {
  is_valid: boolean;
  issues: FormHealthIssue[];
}

export interface AnswerItem {
  question_id: string;
  value: any;
}

export interface ResponseSubmitRequest {
  respondent_token: string;
  answers: AnswerItem[];
  started_at?: string;
  completion_time_seconds?: number;
}

export interface ResponseListItem {
  id: string;
  respondent_token: string;
  submitted_at?: string;
  completion_time_seconds?: number;
  status: string;
}

export interface ResponseListResponse {
  responses: ResponseListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface AnswerResponse {
  id: string;
  question_id: string;
  value: any;
  created_at: string;
}

export interface IndividualResponseView {
  id: string;
  form_id: string;
  form_version_id: string;
  version_number: number;
  respondent_token: string;
  started_at: string;
  submitted_at?: string;
  completion_time_seconds?: number;
  status: string;
  answers: AnswerResponse[];
  questions_snapshot: Question[];
}

export interface ChoiceBreakdown {
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionAnalytics {
  question_id: string;
  type: QuestionType;
  title: string;
  total_answers: number;
  choices_breakdown?: ChoiceBreakdown[];
  average_score?: number;
  distribution?: Record<string, number>;
  nps_score?: number;
  promoters_pct?: number;
  passives_pct?: number;
  detractors_pct?: number;
  min_value?: number;
  max_value?: number;
  recent_text_responses?: string[];
}

export interface FormAnalyticsResponse {
  form_id: string;
  title: string;
  total_views: number;
  total_started: number;
  total_completed: number;
  completion_rate: number;
  average_completion_time_seconds: number;
  questions: QuestionAnalytics[];
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Partial<Question>[];
}
