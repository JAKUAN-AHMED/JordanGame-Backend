import { model, Schema } from 'mongoose';
import { IAboutUs } from './aboutUs.interface';
const aboutUsSchema = new Schema<IAboutUs>({
  text: {
    type: String,
    required: true,
  },
},{
  timestamps: true
});

const AboutUs = model<IAboutUs>('AboutUs', aboutUsSchema);
export default AboutUs;