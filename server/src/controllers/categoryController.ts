import { type Request, type Response } from "express";
import { Category } from "../models/Category";
import { Notice } from "../models/Notice";

type CategoryRequest = Request<
  unknown,
  unknown,
  {
    name?: string;
    newName?: string;
    createdBy?: string;
  }
>;

type CategoryNameParams = {
  categoryName: string;
};

const normalizeCategoryName = (value?: string) =>
  value
    ?.trim()
    .replace(/\s+/g, " ");

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findCategoryByName = async (name?: string) => {
  const normalizedName = normalizeCategoryName(name);

  if (!normalizedName) {
    return null;
  }

  return Category.findOne({
    name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
  });
};

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

    const existingCategory = await findCategoryByName(normalizedName);

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

export const updateCategory = async (
  req: Request<CategoryNameParams, unknown, CategoryRequest["body"]>,
  res: Response
) => {
  try {
    const currentName = normalizeCategoryName(req.params.categoryName);
    const nextName = normalizeCategoryName(req.body.newName);

    if (!currentName || !nextName) {
      return res.status(400).json({ error: "Current and new category names are required." });
    }

    const category = await findCategoryByName(currentName);

    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    const duplicateCategory = await findCategoryByName(nextName);

    if (duplicateCategory && duplicateCategory.id !== category.id) {
      return res.status(409).json({ error: "Category already exists." });
    }

    category.name = nextName;
    await category.save();

    await Notice.updateMany(
      { category: { $regex: `^${escapeRegex(currentName)}$`, $options: "i" } },
      { $set: { category: nextName } }
    );

    return res.json({ name: category.name });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to update category.",
    });
  }
};

export const deleteCategory = async (
  req: Request<CategoryNameParams>,
  res: Response
) => {
  try {
    const categoryName = normalizeCategoryName(req.params.categoryName);

    if (!categoryName) {
      return res.status(400).json({ error: "Category name is required." });
    }

    const category = await findCategoryByName(categoryName);

    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    const noticesUsingCategory = await Notice.countDocuments({
      category: { $regex: `^${escapeRegex(category.name)}$`, $options: "i" },
    });

    if (noticesUsingCategory > 0) {
      return res.status(409).json({
        error: `Cannot delete category while ${noticesUsingCategory} notices still use it.`,
      });
    }

    await category.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to delete category.",
    });
  }
};
