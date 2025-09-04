
import { model, Schema, Types } from "mongoose";
import { Istory } from "./story.interface";

const storySchema = new Schema<Istory>({
  userId: { type: Schema.Types.ObjectId, required: true },
  caption: { type: String },
  mediaUrl: { type: String, required: true },
  type: { type: String, enum: ["video", "audio","image"], required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000),
  },
});

export const Story=model<Istory>('Story',storySchema);
