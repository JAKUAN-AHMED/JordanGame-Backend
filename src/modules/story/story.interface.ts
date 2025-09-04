import { Types } from "mongoose";

export interface Istory {
    userId: Types.ObjectId,
    caption: string,
    mediaUrl: string,
    type: "audio" | "video"|"image",
    createdAt: Date,
    expiresAt: Date
}