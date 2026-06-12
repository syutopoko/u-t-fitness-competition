export type Language = "ja" | "en";
export type UserRole = "member" | "admin";
export type RecordStatus = "normal" | "pending" | "approved" | "rejected";
export type EventType =
  | "push_ups"
  | "grip_strength"
  | "sit_ups"
  | "sit_and_reach"
  | "dead_hang";

export type Profile = {
  id: string;
  instagram_name: string;
  role: UserRole;
  preferred_language: Language;
  created_at: string;
  updated_at: string;
};

export type FitnessRecord = {
  id: string;
  user_id: string;
  event_type: EventType;
  value: number;
  unit: string;
  measured_at: string;
  comment: string | null;
  status: RecordStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BodyMeasurement = {
  id: string;
  user_id: string;
  measured_at: string;
  height_cm: number | null;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  language: Language | "both";
  is_published: boolean;
  published_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RankingRecord = {
  id: string;
  user_id: string;
  instagram_name: string;
  event_type: EventType;
  value: number;
  unit: string;
  measured_at: string;
  created_at: string;
};
