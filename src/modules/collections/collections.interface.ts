import { Types } from "mongoose";

// collections.interface.ts
export interface Icollection{
    _id:string;
    user:Types.ObjectId;
    skin?:Types.ObjectId[];
    carrotPackages?:Types.ObjectId[];
    PowerUps?:Types.ObjectId[];
    IsFirstTime:boolean;
}