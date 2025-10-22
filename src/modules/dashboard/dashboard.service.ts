// dashboard.service.ts
import { TransactionModel } from '../Transactions/Transactions.model';
import { User } from '../user/user.model';


export const getDashboardOverview = async (selectedYear: number) => {
  // Set year range for filtering
  const yearStart = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
  const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

  // 1. Total Users Count (all time)
  const totalUsers = await User.countDocuments();

  // 2. Total Revenue (all time - sum of all successful transactions)
  const revenueResult = await TransactionModel.aggregate([
    {
      $match: {
        status: 'success',
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: { $round: ['$totalRevenue', 2] },
      },
    },
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // 3. Newest Users Count (last 30 days)
  const newestUsersCount = await User.countDocuments({
    createdAt: {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 4. Revenue Trends (Monthly breakdown for selected year)
  const revenueTrends = await TransactionModel.aggregate([
    {
      $match: {
        status: 'success',
        createdAt: {
          $gte: yearStart,
          $lte: yearEnd,
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.month': 1 },
    },
  ]);

  // Format revenue trends to include all 12 months (with 0 for months with no data)
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const formattedRevenueTrends = monthNames.map((month, index) => {
    const monthData = revenueTrends.find((item) => item._id.month === index + 1);
    return {
      month,
      amount: monthData?.totalAmount || 0,
      count: monthData?.count || 0,
    };
  });

  // Calculate max amount for the chart (for displaying highest point)
  const maxAmount = Math.max(...formattedRevenueTrends.map(item => item.amount));
  const maxMonth = formattedRevenueTrends.find(item => item.amount === maxAmount);

  // 5. Recent Users (last 10 users - all time, not year-specific)
  const recentUsers = await User.find()
    .select('_id fullName email address createdAt profileImage')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Format recent users for display
  const formattedRecentUsers = recentUsers.map((user, index) => ({
    serialId: `#${String(1234 + index).padStart(4, '0')}`,
    userName: user.fullName,
    userEmail: user.email,
    address: user.address || 'N/A',
    date: user.createdAt,
    profileImage: user.profileImage,
    _id: user._id,
  }));

  return {
    overview: {
      totalUsers,
      totalRevenue,
      newestUsers: newestUsersCount,
    },
    revenueTrends: {
      year: selectedYear,
      data: formattedRevenueTrends,
      maxAmount,
      maxMonth: maxMonth?.month || null,
    },
    recentUsers: formattedRecentUsers,
  };
};
