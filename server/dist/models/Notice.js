"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notice = void 0;
const mongoose_1 = require("mongoose");
const notice_1 = require("../types/notice");
const noticeSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    department: {
        type: String,
        required: true,
        trim: true,
        default: "All",
    },
    urgency: {
        type: String,
        enum: notice_1.NOTICE_URGENCIES,
        required: true,
        default: "Medium",
    },
    attachmentUrl: {
        type: String,
        trim: true,
    },
    attachmentName: {
        type: String,
        trim: true,
    },
    attachmentType: {
        type: String,
        trim: true,
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
    pinnedRank: {
        type: Number,
        min: 1,
        max: 3,
    },
    expiresAt: {
        type: Date,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
noticeSchema.index({ category: 1, urgency: 1, createdAt: -1 });
noticeSchema.index({ title: "text", description: "text", department: "text" });
exports.Notice = (0, mongoose_1.model)("Notice", noticeSchema);
