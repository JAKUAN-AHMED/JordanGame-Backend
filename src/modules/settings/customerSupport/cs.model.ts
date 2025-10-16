import { model, Schema } from "mongoose";
import { ICs } from "./cs.interface";

const contactAndSupportSchema = new Schema<ICs>({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
});

export  const CSModel=model<ICs>('ContactAndSupport',contactAndSupportSchema);