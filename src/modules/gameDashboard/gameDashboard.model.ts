// gameDashboard.model.ts

import { model, Schema } from "mongoose";
import { IgameDashboard } from "./gameDashboard.interface";

const gameDashboardSchema = new Schema<IgameDashboard>({
    totalCarrots: {
        type: Number,
        required: true,
        default: 0
    },
    user:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    level: {
        type: Number,
        required: true,
        default: 0
    },
    highScoreInFt: {
        type: Number,
        required: true,
        default: 0
    },
    numberOfGamesPlayed: {
        type: Number,
        required: true,
        default: 0
    },
    achievedBadges: {
        type: [Schema.Types.ObjectId],
        default: [],
        ref: 'Content',
    },
});

export const GameDashboardModel = model<IgameDashboard>('GameDashboard', gameDashboardSchema);