import { model, Schema } from 'mongoose';
import { ITermsConditions } from './termsConditions.interface';

const termsConditionsSchema = new Schema<ITermsConditions>(
  {
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TermsConditions = model<ITermsConditions>(
  'TermsConditions',
  termsConditionsSchema
);
