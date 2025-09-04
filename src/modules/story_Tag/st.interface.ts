import { Model } from "mongoose";

export  interface Ist{
    name:string,
    tag:string[]
}


export interface TagImodel extends Model<Ist>{
    isTagExistById:(id:string)=>Promise<Ist>;
}
