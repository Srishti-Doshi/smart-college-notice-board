import app from "./app";
import { connectDatabase } from "./config/db";
import { ensureDefaultCategories } from "./services/bootstrapCategories";
import { ensureDefaultUsers } from "./services/bootstrapUsers";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    await ensureDefaultCategories();
    await ensureDefaultUsers();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
};

void startServer();
