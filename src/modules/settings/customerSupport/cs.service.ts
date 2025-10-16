import { ICs } from "./cs.interface";
import { CSModel } from "./cs.model";

export const createOrUpdateCS = async (payload: Partial<ICs>) => {
  // Find the existing document (you might want to add a filter, e.g., by _id or email)
  let existingDocument = await CSModel.findOne();

  if (existingDocument) {
    // Update only if payload has fields
    if (payload.email && payload.email !== existingDocument.email) {
      existingDocument.email = payload.email;
    }

    if (payload.phone && payload.phone !== existingDocument.phone) {
      existingDocument.phone = payload.phone;
    }

    await existingDocument.save();
    return existingDocument;
  } else {
    // Create new document
    const newCS = await CSModel.create(payload);
    return newCS;
  }
};

const getCS = async () => {
  const result = await CSModel.findOne();
  return result;
};

export const CSservice = { createOrUpdateCS , getCS };