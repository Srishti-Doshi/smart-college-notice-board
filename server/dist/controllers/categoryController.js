"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.getCategories = void 0;
const Category_1 = require("../models/Category");
const normalizeCategoryName = (value) => value
    ?.trim()
    .replace(/\s+/g, " ");
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
        const existingCategory = await Category_1.Category.findOne({
            name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        });
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
