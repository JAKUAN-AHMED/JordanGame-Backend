
import { Model, model, Schema, Types } from "mongoose";
import { Istory, StoryIModel } from "./story.interface";

export interface Ibookmark {
  userId: Types.ObjectId,
  storyId: Types.ObjectId,
  createdAt: Date
}



interface BookMarkModel extends Model<Ibookmark>{
  isBookMarkExistUserId:(id:string,userId:string)=>Promise<Ibookmark>;
  isBookMarkExistId:(id:string)=>Promise<Ibookmark>;
}
const bookmarkSchema = new Schema<Ibookmark,BookMarkModel>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: [true, 'userId required'] },
  storyId: { type: Schema.Types.ObjectId, ref: "Story", required: [true, 'storyid is required too'] },
  createdAt: { type: Date, default: Date.now() }
});
//is bookmark exist
bookmarkSchema.statics.isBookMarkExistId = async function (id: string) {
  return await this.findById(id);
}
bookmarkSchema.statics.isBookMarkExistUserId = async function (storyId: string,userId:string) {
  return await this.findOne({
    storyId,
    userId
  });
}
export const bookmarkModel = model<Ibookmark,BookMarkModel>('BookMark', bookmarkSchema);


//story
const storySchema = new Schema<Istory, StoryIModel>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  caption: { type: String, required: [true, 'caption required'] },
  tags: {
    type: [String],
    required: [true, 'tags is required']
  },
  status:{
    type:String,enum:['pending','draft','post'],default:"pending"
  },
  shared:{
    type:Number,default:0
  },
  description: {
    type: String,
    required: [true, 'description is required']
  },
  mediaUrl: { type: [String], required: [true, 'media url is also required'] },
  type: { type: String, enum: ["video", "audio", "image"], required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000),
  },
});

//delete story automatically
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

//is stroy exist
storySchema.statics.isStoryExistById = async function (id: string) {
  return await this.findById(id);
}

//is story exist by userId
storySchema.statics.isStoryExistByUserId = async function (id: string,userId:string) {
  return await this.findOne({
    _id:id,
    userId
  });
}


export const Story = model<Istory, StoryIModel>('Story', storySchema);

