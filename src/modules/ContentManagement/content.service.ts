import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { ContentModel } from './content.model';
import { Icontent } from './content.interface';

const createContent = async (data: Partial<Icontent>): Promise<Icontent> => {
  const content = await ContentModel.create(data);
  return content;
};

const getAllContent = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters: Record<string, any> = {};

  if (query.category) {
    filters.category = query.category;
  }

  if (query.status) {
    filters.status = query.status;
  }

  const contents = await ContentModel.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ContentModel.countDocuments(filters);
  const totalPage = Math.ceil(total / limit);

  return {
    contents,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};

const getContentById = async (id: string): Promise<Icontent | null> => {
  const content = await ContentModel.findById(id);
  if (!content) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
  }
  return content;
};

const updateContent = async (
  id: string,
  data: Partial<Icontent>
): Promise<Icontent | null> => {
  const content = await ContentModel.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!content) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
  }
  return content;
};

const deleteContent = async (id: string): Promise<any> => {
  const content = await ContentModel.findByIdAndDelete(id);
  if (!content) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
  }
  return content;
};

const getContentByCategory = async (category: string): Promise<Icontent[]> => {
  const contents = await ContentModel.find({ category }).sort({
    createdAt: -1,
  });
  return contents;
};

const getContentByStatus = async (status: string): Promise<Icontent[]> => {
  const contents = await ContentModel.find({ status }).sort({ createdAt: -1 });
  return contents;
};

export const ContentService = {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
  getContentByCategory,
  getContentByStatus,
};
