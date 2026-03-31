import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";

export type UploadedAttachment = {
  attachmentUrl: string;
  attachmentType: string;
};

const toDataUri = (buffer: Buffer, mimeType: string) =>
  `data:${mimeType};base64,${buffer.toString("base64")}`;

const buildUniquePublicId = (originalName: string) => {
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `${baseName || "notice-attachment"}-${Date.now()}-${randomSuffix}`;
};

export const uploadBufferToCloudinary = async (
  file: Express.Multer.File
): Promise<UploadedAttachment> => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env."
    );
  }

  const result = await cloudinary.uploader.upload(
    toDataUri(file.buffer, file.mimetype),
    {
      folder: "smart-notice-board",
      resource_type: "auto",
      public_id: buildUniquePublicId(file.originalname),
      overwrite: false,
    }
  );

  return {
    attachmentUrl: result.secure_url,
    attachmentType: file.mimetype,
  };
};
