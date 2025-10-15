import { AlreadyExist } from "../../utils/utils";
import { IPackage } from "./package.interface";
import { packageModel } from "./package.model";

// package.service.ts
const createPackage=async(data:Partial<IPackage>)=>{
    //check already exist this package or not
    const existingPackage=await packageModel.findOne({name:data.name});
    await AlreadyExist(existingPackage);
    return await packageModel.create(data);
}

const getAllPackage=async(query:any)=>{
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const data= await packageModel.find(query).skip(skip).limit(limit);
    const total = await packageModel.countDocuments(query);
    const totalPage = Math.ceil(total / limit);
    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPage,
        },
    };
}

const singlePackage=async(id:string)=>{
    const data=await packageModel.findById(id);
    if(!data){
        throw new Error('Package not found');
    }
    return data;
}

const updatePackage=async(id:string,data:Partial<IPackage>)=>{
    const isExist=await packageModel.findByIdAndUpdate(id,{$set:data},{new:true});
    if(!isExist){
        throw new Error('Package not found');
    }
    return isExist;
}


const deletePackage=async(id:string)=>{
    const isExist=await packageModel.findByIdAndDelete(id);
    if(!isExist){
        throw new Error('Package not found');
    }
    return isExist;
}
export const packageService={
    createPackage,
    singlePackage,
    updatePackage,
    getAllPackage,
    deletePackage
}