// collections.model.ts

import { model, Schema } from 'mongoose';
import { Icollection } from './collections.interface';

const CollectionSchema = new Schema<Icollection>({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  skin: [{ type: Schema.Types.ObjectId, ref: 'Content' ,default:[]}],
  carrotPackages: [{ type: Schema.Types.ObjectId, ref: 'Package',default:[] }],
  PowerUps: [{ type: Schema.Types.ObjectId, ref: 'Content' ,default:[]}],
},
{
  timestamps: true,
  versionKey: false,
});


export const CollectionModel=model<Icollection>('Collection',CollectionSchema);
