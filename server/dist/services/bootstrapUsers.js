"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDefaultUsers = void 0;
const User_1 = require("../models/User");
const passwordHash_1 = require("./passwordHash");
const seedUsers = [
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
const ensureDefaultUsers = async () => {
    for (const userConfig of seedUsers) {
        const existingUser = await User_1.User.findOne({ email: userConfig.email });
        if (existingUser) {
            continue;
        }
        const passwordHash = await (0, passwordHash_1.hashPassword)(userConfig.password);
        await User_1.User.create({
            name: userConfig.name,
            email: userConfig.email,
            passwordHash,
            role: userConfig.role,
        });
    }
};
exports.ensureDefaultUsers = ensureDefaultUsers;
