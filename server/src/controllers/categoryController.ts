import { type Request, type Response } from "express";
import { Category } from "../models/Category";

type CategoryRequest = Request<
  unknown,
  unknown,
  {
    name?: string;
    createdBy?: string;
  }
>;

const normalizeCategoryName = (value?: string) =>
  value
    ?.trim()
    .replace(/\s+/g, " ");

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find({}, { name: 1 }).sort({ name: 1, _id: 1 });
    return res.json(categories.map((category) => category.name));
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch categories.",
    });
  }
};

export const createCategory = async (req: CategoryRequest, res: Response) => {
  try {
    const normalizedName = normalizeCategoryName(req.body.name);

    if (!normalizedName) {
      return res.status(400).json({ error: "Category name is required." });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });

    if (existingCategory) {
      return res.status(409).json({ error: "Category already exists." });
    }

    const category = await Category.create({
      name: normalizedName,
      createdBy: req.body.createdBy?.trim() || "Admin",
    });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create category.",
    });
  }
};
