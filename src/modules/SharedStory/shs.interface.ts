import { Types } from "mongoose";

export interface Ishs{
    sender:Types.ObjectId,
    receiver:Types.ObjectId,
    story:Types.ObjectId
}


