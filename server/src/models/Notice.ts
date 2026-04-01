import { Schema, model, type InferSchemaType } from "mongoose";
import { NOTICE_URGENCIES } from "../types/notice";

const noticeSchema = new Schema(
  {
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
      enum: NOTICE_URGENCIES,
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
  },
  {
    timestamps: true,
  }
);

noticeSchema.index({ category: 1, urgency: 1, createdAt: -1 });
noticeSchema.index({ title: "text", description: "text", department: "text" });

export type NoticeDocument = InferSchemaType<typeof noticeSchema>;

export const Notice = model("Notice", noticeSchema);
