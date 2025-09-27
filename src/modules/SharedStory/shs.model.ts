import { model, Schema } from 'mongoose';
import { Ishs } from './shs.interface';

const shsSchema = new Schema<Ishs>({
  story: {
    type: Schema.Types.ObjectId,
    required: [true, 'storyId required field'],
    ref: 'Story',
  },
  sender: {
    type: Schema.Types.ObjectId,
    required: [true, 'senderId required field'],
    ref: 'User',
  },
  receiver: {
    type: Schema.Types.ObjectId,
    required: [true, 'receiverId required field'],
    ref: 'User',
  },
},{
    timestamps:true,
    versionKey:false
});

export const shsModel = model<Ishs>('SharedStoryList', shsSchema);
