import { model, Schema } from "mongoose";
import { IPackage } from "./package.interface";

// package.model.ts
const packageSchema = new Schema<IPackage>({
    name: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        default: 'usd',
    },
    price: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'active',
    },
})


export const packageModel = model<IPackage>('Package', packageSchema);
