import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController";
import { requireRole } from "../middleware/auth";

const router = Router();

router.get("/", getCategories);
router.post("/", requireRole("admin"), createCategory);
router.put("/:categoryName", requireRole("admin"), updateCategory);
router.delete("/:categoryName", requireRole("admin"), deleteCategory);

export default router;
