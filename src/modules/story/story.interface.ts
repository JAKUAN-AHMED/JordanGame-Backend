import { Model, Types } from "mongoose";



export interface Istory {
    user: Types.ObjectId,
    caption: string,
    medianame?:string
    description:string,
    tags:string[],
    viewCount: number,
    mediaUrl: string[],
    shared:number,
    thumbnail?:string,
    views?:number,
    duration?:string,
    status:"draft"|"pending"|"post",
    type: "audio" | "video"|"image",
    createdAt: Date,
    expiresAt: Date
}

export interface StoryIModel extends Model<Istory>{
    isStoryExistById:(id:string)=>Promise<Istory>;
    isStoryExistByUserId:(id:string,userId:string)=>Promise<Istory>;
}