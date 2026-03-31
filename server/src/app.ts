import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { attachAuthUser } from "./middleware/auth";
import authRoutes from "./routes/authRoutes";
import noticeRoutes from "./routes/noticeRoutes";

const app = express();
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.CLIENT_ORIGIN ||
  "http://localhost:3000,https://smart-college-notice-board-first.onrender.com"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(attachAuthUser);

app.get("/", (_req, res) => {
  res.send("College Notice Board Server is running.");
});

app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);

const clientBuildPath = path.resolve(__dirname, "../../client/build");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientBuildPath));

  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      next();
      return;
    }

    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

export default app;
