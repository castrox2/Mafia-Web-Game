import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Room || mongoose.model("Room", roomSchema);
