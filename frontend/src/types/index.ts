export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  language: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Meeting {
  id: string;
  user_id: string;
  title: string | null;
  summary: string | null;
  transcript: string | null;
  audio_url: string | null;
  duration: number;
  category: string;
  speakers: string[];
  key_decisions: string[];
  action_items: string[];
  insights: string[];
  sentiment: Record<string, unknown>;
  next_steps: string[];
  is_processed: boolean;
  created_at: string;
  updated_at: string;
  tasks: Task[];
}

export interface MeetingListItem {
  id: string;
  title: string | null;
  duration: number;
  category: string;
  is_processed: boolean;
  sentiment: Record<string, unknown>;
  created_at: string;
  speakers: string[];
  summary: string | null;
}

export interface Task {
  id: string;
  meeting_id: string;
  title: string;
  assigned_to: string | null;
  status: "pending" | "in_progress" | "done";
  created_at: string;
  completed_at: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  meeting_id: string;
  messages: ChatMessage[];
  created_at: string;
}

export interface Analytics {
  total_meetings: number;
  total_tasks: number;
  completed_tasks: number;
  total_duration_minutes: number;
  top_speakers: { name: string; count: number }[];
  category_distribution: { category: string; count: number }[];
  weekly_activity: { date: string; count: number }[];
  recent_tasks: { title: string; status: string; meeting_id: string }[];
}
