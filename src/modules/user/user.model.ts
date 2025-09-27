import { model, Query, Schema, Types } from 'mongoose';
import { TProfileImage, TUser, UserModal } from './user.interface';
import paginate from '../../common/plugins/paginate';
import bcrypt from 'bcrypt';
import { config } from '../../config';
import { Roles } from '../../middlewares/roles';

// User Schema Definition
const userSchema = new Schema<TUser, UserModal>(
  {

    _id:{
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId(),
    },
    email: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, 
      select: false,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    role: {
      type: String,
      enum: {
        values: Roles,
        message: "{VALUE} is not a valid role",
      },
      required: [true, "Role is required"],
      default: "user",
    },
    isEmailVerified: { type: Boolean, default: false },
    phone: { type: String },
    lastPasswordChange: { type: Date },
    isResetPassword: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    profile: { type: Schema.Types.ObjectId, ref: "Profile" },

    //social login fields
    provider: { type: String, default: "local" },
    providerId: { type: String },
    fname: { type: String ,required:[true,'this is a required field']},
  },
  { timestamps: true,versionKey:false }
);


// Apply the paginate plugin
userSchema.plugin(paginate);


// userSchema.virtual('profile', {
//   ref: 'Profile',
//   localField: 'profile',
//   foreignField: '_id',
//   justOne: true,
// });

// Static methods
userSchema.statics.isExistUserById = async function (id: string) {
  return await this.findById(id).populate('profile');
};

userSchema.statics.isExistUserByEmail = async function (email: string) {
  return await this.findOne({ email });
};

userSchema.statics.isMatchPassword = async function (
  password: string,
  hashPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashPassword);
};
userSchema.statics.isUserDeletedById = async function (
  id: string
): Promise<boolean | null> {
  return await User.findById(id);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this?.password!= await bcrypt.hash(
      this.password!,
      Number(config.bcrypt.saltRounds)
    );
  }
  next();
});

// Add a custom query middleware to exclude deleted users

userSchema.pre(/^find/, function (next) {
  // Add condition to exclude deleted users
  (this as Query<any, any>).where({ status: { $ne: 'isDeleted' } });
  next();
});

// Export the User model
export const User = model<TUser, UserModal>('User', userSchema);
