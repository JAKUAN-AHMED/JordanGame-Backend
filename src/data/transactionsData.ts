import { Types } from 'mongoose';

export const createTransactionsData = (
  userIds: Types.ObjectId[], 
  packageIds: string[]
) => {
  // Helper to generate random transaction ID
  const generateTransactionId = () => {
    return `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Helper to get random payment method
  const getRandomPaymentMethod = (): 'stripe' | 'paypal' | 'cash' => {
    const methods: ('stripe' | 'paypal' | 'cash')[] = ['stripe', 'paypal', 'cash'];
    return methods[Math.floor(Math.random() * methods.length)];
  };

  // Helper to get random status
  const getRandomStatus = (): 'pending' | 'success' | 'failed' => {
    const statuses: ('pending' | 'success' | 'failed')[] = ['success', 'success', 'success', 'success', 'pending', 'failed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  return [
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[0],
      package: packageIds[6], // Premium Pack
      amount: 99.99,
      transactionId: generateTransactionId(),
      status: 'success' as const,
      PaymentMethod: 'stripe' as const,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[1],
      package: packageIds[5], // Elite Pack
      amount: 79.99,
      transactionId: generateTransactionId(),
      status: 'success' as const,
      PaymentMethod: 'paypal' as const,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[2],
      package: packageIds[2], // Standard Pack
      amount: 19.99,
      transactionId: generateTransactionId(),
      status: 'success' as const,
      PaymentMethod: 'stripe' as const,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[3],
      package: packageIds[1], // Basic Pack
      amount: 9.99,
      transactionId: generateTransactionId(),
      status: 'success' as const,
      PaymentMethod: 'stripe' as const,
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[5],
      package: packageIds[3], // Advanced Pack
      amount: 29.99,
      transactionId: generateTransactionId(),
      status: 'success' as const,
      PaymentMethod: 'paypal' as const,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[7],
      package: packageIds[4], // Pro Pack
      amount: 49.99,
      transactionId: generateTransactionId(),
      status: 'success' as const,
      PaymentMethod: 'stripe' as const,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[8],
      package: packageIds[0], // Starter Pack
      amount: 4.99,
      transactionId: generateTransactionId(),
      status: 'success' as const,
      PaymentMethod: 'cash' as const,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[9],
      package: packageIds[3], // Advanced Pack
      amount: 29.99,
      transactionId: generateTransactionId(),
      status: 'pending' as const,
      PaymentMethod: 'stripe' as const,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[5],
      package: packageIds[7], // VIP Pack
      amount: 149.99,
      transactionId: generateTransactionId(),
      status: 'success' as const,
      PaymentMethod: 'paypal' as const,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[0],
      package: packageIds[8], // Ultimate Pack
      amount: 199.99,
      transactionId: generateTransactionId(),
      status: 'failed' as const,
      PaymentMethod: 'stripe' as const,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];
};