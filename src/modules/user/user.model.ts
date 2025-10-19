import { model, Query, Schema, Types } from 'mongoose';
import { TUser, UserModal } from './user.interface';
import bcrypt from 'bcrypt';
import { config } from '../../config';
import { Roles } from '../../middlewares/roles';
import paginationPlugin from '../../common/plugins/paginate';
import { UserStatus } from './user.constant';

// User Schema Definition
const userSchema = new Schema<TUser, UserModal>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    totalCarrots: {
      type: Number,
      default: 0,
    },
    fullName: {
      type: String,
      required: [true, 'Full Name is required'],
    },
    lastLoginAt: {
      type: Date,
      default: Date.now(),
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    address:{
      type: String,
      required: [true, 'Address is required'],
    },
    isHePlayedFirstTime: {
      type: Boolean,
      default: false,
    },
    CurrentGametag: {
      type: String,
      required: false,
      default: 'NewBie',
    },
    role: {
      type: String,
      enum: {
        values: Roles,
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
      default: 'user',
    },
    profileStatus: {
      type: String,
      enum: {
        values: UserStatus,
        message: '{VALUE} is not a valid profile status',
      },
      default: 'active',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastPasswordChange: { type: Date },
    isHeBroughtFirstTime: {
      type: Boolean,
      default: false,
    },
    isResetPassword: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: { type: Date },
    profileImage: {
      type: String, required:true,default:"https://i.pravatar.cc/300?img=50",
    }
  },
  {
    timestamps: true,
    collection: 'users',
    versionKey: false,
  }
);

// Apply the paginate plugin
userSchema.plugin(paginationPlugin as any);

// userSchema.virtual('profile', {
//   ref: 'Profile',
//   localField: 'profileId',
//   foreignField: '_id',
//   justOne: true,
// });

// Static methods
userSchema.statics.isExistUserById = async function (id: string) {
  return await this.findById(id);
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
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt.saltRounds)
    );
  }
  next();
});

// Export the User model
export const User = model<TUser, UserModal>('User', userSchema);
