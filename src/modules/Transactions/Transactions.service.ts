// Transactions.service.ts

import { NotFound } from '../../utils/utils';
import { packageModel } from '../package/package.model';
import { ITransaction } from './Transactions.interface';
import { TransactionModel } from './Transactions.model';

const makePayment = async (data: Partial<ITransaction>) => {

  //check the package is exist or not 
  const isExistPackage=await packageModel.findById(data.package);
  await NotFound(isExistPackage,'Package not found');
  if(data){
    data.amount=Number(isExistPackage?.price) ?? 0;
  }
  return await TransactionModel.create(data);
};

const getMyTransaction = async (userId: string) => {
  return await TransactionModel.find({ user: userId }).populate('user').populate('package');
};

const getAllTransaction = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters: any = {};
  if (query.fullName) {
    filters['user.fullName'] = { $regex: query.fullName, $options: 'i' };
  }
  if (query.email) {
    filters['user.email'] = { $regex: query.email, $options: 'i' };
  }

  const pipeline = [
    // --- Join user collection ---
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },

    // --- Join package collection ---
    {
      $lookup: {
        from: 'packages',
        localField: 'package',
        foreignField: '_id',
        as: 'package',
      },
    },
    {
      $unwind: {
        path: '$package',
        preserveNullAndEmptyArrays: true,
      },
    },

    // --- Apply filters on populated user ---
    ...(Object.keys(filters).length > 0 ? [{ $match: filters }] : []),

    // --- Clean fields (remove sensitive user data) ---
    {
      $project: {
        _id: 1,
        amount: 1,
        transactionId: 1,
        status: 1,
        PaymentMethod: 1,
        createdAt: 1,
        updatedAt: 1,

        // user info
        'user._id': 1,
        'user.fullName': 1,
        'user.email': 1,
        'user.phone': 1,
        'user.address': 1,
        'user.profileImage': 1,
        'user.role': 1,
        'user.profileStatus': 1,
        'user.totalCarrots': 1,
        'user.lastLoginAt': 1,

        // package info
        'package._id': 1,
        'package.name': 1,
        'package.price': 1,
        'package.description': 1,
        'package.type': 1,
        'package.duration': 1,
      },
    },

    // --- Pagination metadata + data ---
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ];

  const result = await TransactionModel.aggregate(pipeline);

  return {
    data: result[0]?.data || [],
    meta: {
      total: result[0]?.metadata[0]?.total || 0,
      page,
      limit,
    },
  };
};



const singleTransaction = async (id: string) => {
  return await TransactionModel.findById(id).populate({
    path: 'user',
    select: 'fullName email phone address profileImage role profileStatus totalCarrots lastLoginAt',
  })
  .populate({
    path: 'package',
    select: 'name price description type duration',
  });
};

export const TransactionService = {
  makePayment,
  getMyTransaction,
  getAllTransaction,
  singleTransaction
};
