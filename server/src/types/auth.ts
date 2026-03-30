export const USER_ROLES = ["student", "admin", "hod"] as const;

export type UserRole = (typeof USER_ROLES)[number];
