import { Model, Types } from "mongoose";



export interface Istory {
    user: Types.ObjectId,
    caption: string,
    description:string,
    tags:string[],
    mediaUrl: string[],
    shared:number,
    status:"draft"|"pending"|"post",
    type: "audio" | "video"|"image",
    createdAt: Date,
    expiresAt: Date
}

export interface StoryIModel extends Model<Istory>{
    isStoryExistById:(id:string)=>Promise<Istory>;
    isStoryExistByUserId:(id:string,userId:string)=>Promise<Istory>;
}