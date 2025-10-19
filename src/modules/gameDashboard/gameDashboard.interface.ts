// gameDashboard.interface.ts

import { Types } from "mongoose";

export interface IgameDashboard {
    _id: string;
    user: Types.ObjectId;
    totalCarrots: number;
    highScoreInFt: number;
    level?: number;
    numberOfGamesPlayed: number;
    achievedBadges: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}