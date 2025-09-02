import { model, Schema } from 'mongoose';
import { Profile, TUserProfile } from './profile.interface';


const profileSchema = new Schema<TUserProfile, Profile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    aboutself: { type: String, required: true },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: [true, 'Gender is required'],
    },
    avatar:{
      type:String
    },
    nickname:{
      type:String
    },
    dateofBirth:{
      type:Date,
      required:true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Static methods
profileSchema.statics.isExistProfileExistByUserId = async function (id: string) {
  return await this.findOne({ user: id });
};



// Export models
export const ProfileModel = model<TUserProfile, Profile>('Profile', profileSchema);
