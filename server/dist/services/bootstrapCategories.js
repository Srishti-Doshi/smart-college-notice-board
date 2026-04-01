"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDefaultCategories = void 0;
const Category_1 = require("../models/Category");
const notice_1 = require("../types/notice");
const ensureDefaultCategories = async () => {
    for (const categoryName of notice_1.NOTICE_CATEGORIES) {
        const existingCategory = await Category_1.Category.findOne({
            name: { $regex: `^${categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        });
        if (existingCategory) {
            continue;
        }
        await Category_1.Category.create({
            name: categoryName,
            createdBy: "System",
        });
    }
};
exports.ensureDefaultCategories = ensureDefaultCategories;
