import { model, Schema } from 'mongoose';
import { Icontent } from './content.interface';

const contentSchema = new Schema<Icontent>(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['skin', 'power-up', 'achievement', 'obstacles'],
    },
    description: { type: String, required: true },
    imgUrl: { type: String, required: true },
    targetValueInFt: { type: Number, required: false },
    timeInSec: { type: Number, required: false },
    skinType: { type: String, required: false, enum: ['free', 'paid'] ,default:'paid'},
    numberOfCarrot: { type: Number, required: false },
    status: {
      type: String,
      required: true,
      enum: ['active', 'locked'],
      default: 'locked',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ContentModel = model<Icontent>('Content', contentSchema);
