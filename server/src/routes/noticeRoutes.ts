import { Router } from "express";
import {
  createNotice,
  deleteNotice,
  getActiveNotices,
  getArchivedNotices,
  updateNotice,
} from "../controllers/noticeController";
import { requireRole } from "../middleware/auth";
import { uploadNoticeAttachment } from "../middleware/upload";

const router = Router();

router.get("/", getActiveNotices);
router.get("/archive", getArchivedNotices);
router.post(
  "/",
  requireRole("admin", "hod"),
  uploadNoticeAttachment.single("attachment"),
  createNotice
);
router.put(
  "/:id",
  requireRole("admin", "hod"),
  uploadNoticeAttachment.single("attachment"),
  updateNotice
);
router.delete("/:id", requireRole("admin", "hod"), deleteNotice);

export default router;
