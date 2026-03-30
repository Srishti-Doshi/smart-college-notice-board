import "dotenv/config";
import cors from "cors";
import express from "express";
import { attachAuthUser } from "./middleware/auth";
import authRoutes from "./routes/authRoutes";
import noticeRoutes from "./routes/noticeRoutes";

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: clientOrigin,
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

export default app;
