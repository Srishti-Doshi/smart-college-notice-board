"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../config/db");
const Notice_1 = require("../models/Notice");
const demoNotices = [
    {
        title: "Semester Midterm Schedule Released",
        description: "The official midterm exam schedule for all second-year batches has been published. Students should verify subject timings and room allocations before Friday.",
        category: "Academic",
        department: "All",
        urgency: "High",
        isPinned: true,
        pinnedRank: 1,
        createdBy: "Academic Office",
        attachmentUrl: "https://example.com/midterm-schedule.pdf",
        expiresAt: new Date("2026-04-10T18:00:00.000Z"),
    },
    {
        title: "Campus Placement Drive by Infosys",
        description: "Eligible final-year students can register for the Infosys placement process. Resume screening closes this week and the aptitude round will be held in the central lab.",
        category: "Placement",
        department: "CSE",
        urgency: "Urgent",
        isPinned: true,
        pinnedRank: 2,
        createdBy: "Placement Cell",
        attachmentUrl: "https://example.com/infosys-drive-details.pdf",
        expiresAt: new Date("2026-04-05T18:00:00.000Z"),
    },
    {
        title: "Tech Fest Volunteer Orientation",
        description: "All registered volunteers for the annual tech fest must attend the orientation session in Seminar Hall 2. Team leads and reporting slots will be announced there.",
        category: "Events",
        department: "All",
        urgency: "Medium",
        isPinned: true,
        pinnedRank: 3,
        createdBy: "Student Council",
        expiresAt: new Date("2026-04-03T14:00:00.000Z"),
    },
    {
        title: "Library Night Hours Extended",
        description: "The central library will remain open until 10 PM during the exam preparation week. Students must carry their ID cards for entry after regular hours.",
        category: "General",
        department: "All",
        urgency: "Low",
        createdBy: "Library Team",
        expiresAt: new Date("2026-04-20T17:00:00.000Z"),
    },
    {
        title: "Scholarship Document Verification Window",
        description: "Students shortlisted for the merit scholarship must complete document verification at the administration block between 11 AM and 3 PM on working days.",
        category: "Academic",
        department: "MBA",
        urgency: "High",
        createdBy: "Scholarship Desk",
        attachmentUrl: "https://example.com/scholarship-checklist.pdf",
        expiresAt: new Date("2026-04-08T17:00:00.000Z"),
    },
    {
        title: "Guest Lecture on Embedded Systems",
        description: "ECE department invites all interested students to a guest lecture on embedded systems design and current industry applications. Limited seating is available.",
        category: "Events",
        department: "ECE",
        urgency: "Medium",
        createdBy: "ECE Department",
        expiresAt: new Date("2026-04-15T10:00:00.000Z"),
    },
    {
        title: "Hostel Water Supply Maintenance",
        description: "Water supply will be interrupted in Blocks A and B between 6 AM and 9 AM on Sunday due to maintenance work. Students are advised to plan accordingly.",
        category: "General",
        department: "All",
        urgency: "Medium",
        createdBy: "Campus Facilities",
        expiresAt: new Date("2026-04-06T09:00:00.000Z"),
    },
    {
        title: "Previous Coding Contest Results",
        description: "Results for the inter-department coding contest have been archived. Students can still review rankings, problem statements, and participation certificates.",
        category: "Events",
        department: "CSE",
        urgency: "Low",
        createdBy: "Coding Club",
        isArchived: true,
        expiresAt: new Date("2026-03-10T10:00:00.000Z"),
    },
];
const seedNotices = async () => {
    await (0, db_1.connectDatabase)();
    for (const notice of demoNotices) {
        await Notice_1.Notice.findOneAndUpdate({ title: notice.title }, { $set: notice }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
    }
    console.log(`Seeded ${demoNotices.length} demo notices.`);
    process.exit(0);
};
seedNotices().catch((error) => {
    console.error("Failed to seed demo notices:", error);
    process.exit(1);
});
