import { Router } from "express";
import { createCategory, getCategories } from "../controllers/categoryController";
import { requireRole } from "../middleware/auth";

const router = Router();

router.get("/", getCategories);
router.post("/", requireRole("admin"), createCategory);

export default router;
