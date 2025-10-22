// Transactions.model.ts

import { model, Schema } from "mongoose";
import { ITransaction } from "./Transactions.interface";

const TransactionSchema=new Schema<ITransaction>({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    package: { type: Schema.Types.ObjectId, ref: 'Package' },
    amount: { type: Number, required: true, default: 0 },
    transactionId: { type: String, required: true },
    status: { type: String, enum:['pending', 'success', 'failed'], required: true },
    PaymentMethod: { type: String, required: true },
},{
    timestamps: true,
    versionKey: false
})


export const TransactionModel=model<ITransaction>('Transaction',TransactionSchema);