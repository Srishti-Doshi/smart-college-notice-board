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

export interface Notice {
  _id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  department: string;
  urgency: NoticeUrgency;
  attachmentUrl?: string;
  attachmentType?: string;
  isPinned: boolean;
  pinnedRank?: number;
  expiresAt?: string;
  isArchived: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
