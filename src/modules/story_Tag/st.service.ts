import AppError from "../../errors/AppError";
import { NotFound } from "../../utils/utils";
import { Ist } from "./st.interface";
import { tagModel } from "./st.model";

const createTag = async (payload: Ist) => {
    const { tag, name } = payload;
    const isTagExist = await tagModel.findOne({
        $or: [
            { name },                    // Check if name already exists
            { tag: { $in: [tag] } },   // Check if name exists in any tag array
        ]
    });

    if (isTagExist) {
        throw new AppError(409, 'Already Exist');
    }
    return await tagModel.create(payload);
}

const updateTag = async (id: string, payload: Partial<Ist>) => {
    const { tag, name } = payload;
    
    // Check if tag exists
    const isExist = await tagModel.findById(id);
    await NotFound(isExist, 'Tag not found for this id!');
    
    // Build update object
    const updateData: any = {};
    if (name) updateData.name = name;
    if (tag) updateData.tag = tag; // This replaces entire array
    
    const updatedData = await tagModel.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
    );
    
    return updatedData;
};

const addTagsToArray = async (id: string, newTags: string[]) => {
    const isExist = await tagModel.findById(id);
    await NotFound(isExist, 'Tag not found for this id!');
    
    const updatedData = await tagModel.findByIdAndUpdate(
        id,
        { $addToSet: { tag: { $each: newTags } } }, // Prevents duplicates
        { new: true, runValidators: true }
    );
    
    return updatedData;
};


const removeTagsFromArray = async (id: string, tagsToRemove: string[]) => {
    const isExist = await tagModel.findById(id);
    await NotFound(isExist, 'Tag not found for this id!');
    
    const updatedData = await tagModel.findByIdAndUpdate(
        id,
        { $pull: { tag: { $in: tagsToRemove } } },
        { new: true, runValidators: true }
    );
    
    return updatedData;
};


const getAllTags = async (query: any = {}) => {
    const { page = 1, limit = 10, search, ...filters } = query;
    
    // Build search query
    const searchQuery: any = { ...filters };
    if (search) {
        searchQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { tag: { $regex: search, $options: 'i' } }
        ];
    }
    
    const skip = (page - 1) * limit;
    
    const [tags, total] = await Promise.all([
        tagModel.find(searchQuery)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 }),
        tagModel.countDocuments(searchQuery)
    ]);
    
    return {
        tags,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        }
    };
};



const getSingleTag = async (id: string) => {
    const tag = await tagModel.findById(id);
    await NotFound(tag, 'Tag not found for this id!');
    return tag;
};


const deleteTag = async (id: string) => {
    const isExist = await tagModel.findById(id);
    await NotFound(isExist, 'Tag not found for this id!');
    
    const deletedTag = await tagModel.findByIdAndDelete(id);
    return deletedTag;
};


const deleteMultipleTags = async (ids: string[]) => {
    const result = await tagModel.deleteMany({ _id: { $in: ids } });
    
    if (result.deletedCount === 0) {
        throw new AppError(404, 'No tags found to delete');
    }
    
    return {
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} tags deleted successfully`
    };
};

export const TagServices={
    updateTag,
    createTag,
    deleteTag,
    deleteMultipleTags,
    getSingleTag,
    getAllTags,
    removeTagsFromArray,
    addTagsToArray
    
}