import { model, Schema } from 'mongoose';
import { Country, CountryModel, Profile, TUserProfile } from './profile.interface';
import paginate from '../../common/plugins/paginate';

const profileSchema = new Schema<TUserProfile, Profile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    country:{
      type: String,
      required: [true, 'Country is required'],
      default: 'Bangladesh',
    },
    city: { type: String, required: [true, 'City is required'] },
  
    Tphone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    isverified: { type: Boolean, default: false },
    aboutself: { type: String, required: true },
    age: {
      type: String,
      required: [true, 'Age is required'],
      match: [/^\d+$/, 'Age must be a number'],
    },
    profileImage: { type: Object, default: null },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: [true, 'Gender is required'],
    },
    instName: { type: String, default: null },
    major: {
      type: String,
      enum: [
        'Elementary',
        'High School',
        'Undergraduate',
        'Graduate',
        'PhD',
        'MASTERS',
        'Other',
      ],
      default: null,
    },
    jobTitle: { type: String, default: null },
    prefAgeRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    prefCountry: {
      country: {
        type: String,
        required: [true, 'Preferred country is required'],
        default: 'Bangladesh',
      },
    },
    prefGender: {
      type: String,
      enum: ['Male', 'Female'],
      required: [true, 'Gender preference is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// country schema
const countrySchema = new Schema<Country, CountryModel>({
  country: { type: String, required: [true, 'Country is required'], unique: true },
});

// Static methods
profileSchema.statics.isExistProfileExistByUserId = async function (id: string) {
  return await this.findOne({ user: id });
};

countrySchema.statics.isCountryExist = async function (id: string) {
  return await this.findById(id);
};

countrySchema.statics.isAlreadyCountryExist = async function (id: string) {
  return await this.findById(id);
};

countrySchema.statics.isAlreadyCountryExistByName = async function (name: any) {
  if (!name) return null; // Handle undefined/null

  const countryName = String(name).trim(); // Convert to string and trim

  return await this.findOne({
    country: { $regex: new RegExp(`^${countryName}$`, 'i') },
  });
};

// Export models
export const CountryMODEL = model<Country, CountryModel>('Country', countrySchema);
export const ProfileModel = model<TUserProfile, Profile>('Profile', profileSchema);
