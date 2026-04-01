import { Schema, model, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    createdBy: {
      type: String,
      trim: true,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ name: 1 }, { unique: true });

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

export const Category = model("Category", categorySchema);
