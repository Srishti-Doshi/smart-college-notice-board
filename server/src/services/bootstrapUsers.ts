import { User } from "../models/User";
import { hashPassword } from "./passwordHash";
import { type UserRole } from "../types/auth";

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const seedUsers: SeedUser[] = [
  {
    name: process.env.DEFAULT_ADMIN_NAME || "Admin",
    email: (process.env.DEFAULT_ADMIN_EMAIL || "admin@college.edu").toLowerCase(),
    password: process.env.DEFAULT_ADMIN_PASSWORD || "admin1234",
    role: "admin",
  },
  {
    name: process.env.DEFAULT_HOD_NAME || "HOD",
    email: (process.env.DEFAULT_HOD_EMAIL || "hod@college.edu").toLowerCase(),
    password: process.env.DEFAULT_HOD_PASSWORD || "hod1234",
    role: "hod",
  },
  {
    name: process.env.DEFAULT_STUDENT_NAME || "Student",
    email: (process.env.DEFAULT_STUDENT_EMAIL || "student@college.edu").toLowerCase(),
    password: process.env.DEFAULT_STUDENT_PASSWORD || "student1234",
    role: "student",
  },
];

export const ensureDefaultUsers = async () => {
  for (const userConfig of seedUsers) {
    const existingUser = await User.findOne({ email: userConfig.email });
    if (existingUser) {
      continue;
    }

    const passwordHash = await hashPassword(userConfig.password);
    await User.create({
      name: userConfig.name,
      email: userConfig.email,
      passwordHash,
      role: userConfig.role,
    });
  }
};
