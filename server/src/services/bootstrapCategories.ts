import { Category } from "../models/Category";
import { NOTICE_CATEGORIES } from "../types/notice";

export const ensureDefaultCategories = async () => {
  for (const categoryName of NOTICE_CATEGORIES) {
    const existingCategory = await Category.findOne({
      name: { $regex: `^${categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });

    if (existingCategory) {
      continue;
    }

    await Category.create({
      name: categoryName,
      createdBy: "System",
    });
  }
};
