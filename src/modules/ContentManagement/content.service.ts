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
  if (query.name) {
    filters.name = query.name;
  }

  if (query.searchTerm) {
    const searchRegex = new RegExp(query.searchTerm, 'i');
    filters.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  const contents = await ContentModel.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ContentModel.countDocuments(filters);
  const totalPage = Math.ceil(total / limit);

  //overview
   const totalContent = await ContentModel.countDocuments();
  const totalSkin = await ContentModel.countDocuments({ category: 'skin' });
  const totalAchievement = await ContentModel.countDocuments({
    category: 'achievement',
  });
  const totalPowerUp = await ContentModel.countDocuments({
    category: 'power-up',
  });
  const totalObstacle = await ContentModel.countDocuments({
    category: 'obstacles',
  });

  const overview:any={
    totalContent,
    totalSkin,
    totalAchievement,
    totalPowerUp,
    totalObstacle
  }

  return {
    contents,
    overview,
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


export const ContentService = {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
};
