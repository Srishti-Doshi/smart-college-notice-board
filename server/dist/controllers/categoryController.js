"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const Category_1 = require("../models/Category");
const Notice_1 = require("../models/Notice");
const normalizeCategoryName = (value) => value
    ?.trim()
    .replace(/\s+/g, " ");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const findCategoryByName = async (name) => {
    const normalizedName = normalizeCategoryName(name);
    if (!normalizedName) {
        return null;
    }
    return Category_1.Category.findOne({
        name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
    });
};
const getCategories = async (_req, res) => {
    try {
        const categories = await Category_1.Category.find({}, { name: 1 }).sort({ name: 1, _id: 1 });
        return res.json(categories.map((category) => category.name));
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch categories.",
        });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const normalizedName = normalizeCategoryName(req.body.name);
        if (!normalizedName) {
            return res.status(400).json({ error: "Category name is required." });
        }
        const existingCategory = await findCategoryByName(normalizedName);
        if (existingCategory) {
            return res.status(409).json({ error: "Category already exists." });
        }
        const category = await Category_1.Category.create({
            name: normalizedName,
            createdBy: req.body.createdBy?.trim() || "Admin",
        });
        return res.status(201).json(category);
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to create category.",
        });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
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
        await Notice_1.Notice.updateMany({ category: { $regex: `^${escapeRegex(currentName)}$`, $options: "i" } }, { $set: { category: nextName } });
        return res.json({ name: category.name });
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to update category.",
        });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const categoryName = normalizeCategoryName(req.params.categoryName);
        if (!categoryName) {
            return res.status(400).json({ error: "Category name is required." });
        }
        const category = await findCategoryByName(categoryName);
        if (!category) {
            return res.status(404).json({ error: "Category not found." });
        }
        const noticesUsingCategory = await Notice_1.Notice.countDocuments({
            category: { $regex: `^${escapeRegex(category.name)}$`, $options: "i" },
        });
        if (noticesUsingCategory > 0) {
            return res.status(409).json({
                error: `Cannot delete category while ${noticesUsingCategory} notices still use it.`,
            });
        }
        await category.deleteOne();
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to delete category.",
        });
    }
};
exports.deleteCategory = deleteCategory;
