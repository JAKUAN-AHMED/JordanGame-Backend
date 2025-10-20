// Transactions.service.ts

import { get } from 'mongoose';
import { ITransaction } from './Transactions.interface';
import { TransactionModel } from './Transactions.model';

const makePayment = async (data: Partial<ITransaction>) => {
  return await TransactionModel.create(data);
};

const getMyTransaction = async (userId: string) => {
  return await TransactionModel.find({ user: userId });
};

const getAllTransaction = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters: Record<string, any> = {};
  if (query.name) {
    filters.user.fullName = { $regex: query.fullName, $options: 'i' };
  }
  if (query.email) {
    filters.user.email = { $regex: query.email, $options: 'i' };
  }
  const pipeline = [
    {
      $lookup: {
        from: 'transactions',
        localField: 'user',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $unwind: {
        path: '$users',
        preserveNullAndEmptyArrays: true,
      },
    },
    //filteres users early
    ...Object.keys(filters).length>0 ? [{ $match: filters }] : [],
    {
        $replaceRoot: { newRoot: '$users' },
    },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    }
  ];

  const result = await TransactionModel.aggregate(pipeline);

  return {
    data: result[0]?.data || [],
    meta:{
        total: result[0]?.metadata[0]?.total || 0,
        page,
        limit,
    }
  };
};


const singleTransaction = async (id: string) => {
  return await TransactionModel.findById(id);
};

export const TransactionService = {
  makePayment,
  getMyTransaction,
  getAllTransaction,
  singleTransaction
};
