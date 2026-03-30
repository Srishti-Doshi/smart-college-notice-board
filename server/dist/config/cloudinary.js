"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.isCloudinaryConfigured = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
if (cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret) {
    cloudinary_1.v2.config({
        cloud_name: cloudinaryCloudName,
        api_key: cloudinaryApiKey,
        api_secret: cloudinaryApiSecret,
    });
}
const isCloudinaryConfigured = () => Boolean(cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret);
exports.isCloudinaryConfigured = isCloudinaryConfigured;
