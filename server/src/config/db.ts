import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to server/.env.");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB Atlas");
};
