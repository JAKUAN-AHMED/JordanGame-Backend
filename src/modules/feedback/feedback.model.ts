// import { model, Schema } from "mongoose";
// import { Ifeedback } from "./feedback.interface";

// const feedbackSchema=new Schema<Ifeedback>({
//     story:{
//         type:Schema.Types.ObjectId,
//         required:[true,'storyId is required field'],
//         ref:'Story'
//     },
//     user:{
//         type:Schema.Types.ObjectId,
//         required:[true,'userId is required field'],
//         ref:'User'
//     },
//     comment:{
//         type:String,
//         required:[true,'comment is required field'],
//     },
//     rating:{
//         type:Number,
//         required:[true,'Ratings are required field'],
//     },
//     imgurl:{
//         type:String
//     }
// })

// export const feedbackModel=model<Ifeedback>('feedback',feedbackSchema);