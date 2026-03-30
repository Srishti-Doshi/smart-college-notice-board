"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadNoticeAttachment = void 0;
const multer_1 = __importDefault(require("multer"));
const allowedMimeTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
]);
exports.uploadNoticeAttachment = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
        if (allowedMimeTypes.has(file.mimetype)) {
            callback(null, true);
            return;
        }
        callback(new Error("Only PDF, DOC, DOCX, PNG, and JPG files are allowed."));
    },
});
