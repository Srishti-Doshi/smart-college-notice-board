"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBufferToCloudinary = void 0;
const cloudinary_1 = require("../config/cloudinary");
const toDataUri = (buffer, mimeType) => `data:${mimeType};base64,${buffer.toString("base64")}`;
const buildUniquePublicId = (originalName) => {
    const baseName = originalName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    return `${baseName || "notice-attachment"}-${Date.now()}-${randomSuffix}`;
};
const uploadBufferToCloudinary = async (file) => {
    if (!(0, cloudinary_1.isCloudinaryConfigured)()) {
        throw new Error("Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env.");
    }
    const result = await cloudinary_1.cloudinary.uploader.upload(toDataUri(file.buffer, file.mimetype), {
        folder: "smart-notice-board",
        resource_type: "auto",
        public_id: buildUniquePublicId(file.originalname),
        overwrite: false,
    });
    return {
        attachmentUrl: result.secure_url,
        attachmentType: file.mimetype,
    };
};
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
