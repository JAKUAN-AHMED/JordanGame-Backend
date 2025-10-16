import { ICs } from "./cs.interface";
import { CSModel } from "./cs.model";

const createOrUpdateCS = async (payload: Partial<ICs>) => {
  const existingAboutUs = await CSModel.findOne();

  if (existingAboutUs) {
    existingAboutUs.set(payload);
    await existingAboutUs.save();
    return existingAboutUs;
  } else {
    const newAboutUs = await CSModel.create(payload);
    return newAboutUs;
  }
};

const getCS = async () => {
  const result = await CSModel.findOne();
  return result;
};

export const CSservice = { createOrUpdateCS , getCS };