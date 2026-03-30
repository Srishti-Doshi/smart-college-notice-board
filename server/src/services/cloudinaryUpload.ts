import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";

export type UploadedAttachment = {
  attachmentUrl: string;
  attachmentType: string;
};

const toDataUri = (buffer: Buffer, mimeType: string) =>
  `data:${mimeType};base64,${buffer.toString("base64")}`;

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
      public_id: file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-"),
      overwrite: false,
    }
  );

  return {
    attachmentUrl: result.secure_url,
    attachmentType: file.mimetype,
  };
};
