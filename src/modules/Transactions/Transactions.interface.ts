// Transactions.interface.ts

import { Types } from "mongoose";


export interface ITransaction {
    _id: string;
    user: Types.ObjectId;
    amount: number;
    package: Types.ObjectId;
    transactionId: string;
    status: 'pending' | 'success' | 'failed';
    PaymentMethod: 'stripe' | 'paypal' | 'cash';
}