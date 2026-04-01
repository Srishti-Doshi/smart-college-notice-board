export const NOTICE_CATEGORIES = [
  "Academic",
  "Placement",
  "Events",
  "General",
] as const;

export const NOTICE_URGENCIES = [
  "Low",
  "Medium",
  "High",
  "Urgent",
] as const;

export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];
export type NoticeUrgency = (typeof NOTICE_URGENCIES)[number];

export interface NoticePayload {
  title: string;
  description: string;
  category: string;
  department: string;
  urgency: NoticeUrgency;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  isPinned?: boolean;
  pinnedRank?: number;
  expiresAt?: string;
  isArchived?: boolean;
  createdBy?: string;
}
