import { model, Schema } from "mongoose";
import { Ist, TagImodel } from "./st.interface";


const tagSchema=new Schema<Ist,TagImodel>({
    name:{
        type:String,
        required:[true,'name is required']
    },
    tag:{
        type:[String],
        required:[true,'tag is required']
    }
},
{
    timestamps:true,
    versionKey:false
})

tagSchema.statics.isTagExistById=async function(id:string){
    return  this.findById(id);
}

export const tagModel=model<Ist,TagImodel>('tag',tagSchema);