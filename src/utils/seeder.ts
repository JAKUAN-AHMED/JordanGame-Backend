import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Models
import { User } from '../modules/user/user.model';
import { packageModel } from '../modules/package/package.model';
import { ContentModel } from '../modules/ContentManagement/content.model';
import { GameDashboardModel } from '../modules/gameDashboard/gameDashboard.model';
import { CollectionModel } from '../modules/collections/collections.model';
import { TransactionModel } from '../modules/Transactions/Transactions.model';

// Data
import { usersData } from '../data/userData';
import { packagesData } from '../data/packageData';
import { contentsData } from '../data/contentData';

import { createCollectionsData } from '../data/collectionsData';
import { createTransactionsData } from '../data/transactionsData';
import { createGameDashboardData } from '../data/gameDashboardData';

// Load environment variables
dotenv.config();

// Function to drop the entire database
const dropDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log('------------> Database dropped successfully! <------------');
  } catch (err) {
    console.error('Error dropping database:', err);
  }
};

// Function to seed users
const seedUsers = async () => {
  try {
    await User.deleteMany();
    const modifiedData = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );
    const insertedUsers = await User.insertMany(modifiedData);
    console.log('✅ Users seeded successfully!');
    return insertedUsers.map(u => u._id);
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    throw err;
  }
};

// Seed packages
const seedPackages = async () => {
  try {
    await packageModel.deleteMany({});
    const insertedPackages = await packageModel.insertMany(packagesData);
    console.log('✅ Packages seeded successfully!');
    return insertedPackages.map(p => p._id.toString());
  } catch (err) {
    console.error('❌ Error seeding packages:', err);
    throw err;
  }
};

// Seed content data
const seedContents = async () => {
  try {
    await ContentModel.deleteMany({});
    const insertedContents = await ContentModel.insertMany(contentsData);
    console.log('✅ Contents seeded successfully!');
    
    // Separate content IDs by category
    const skinIds = insertedContents
      .filter(c => c.category === 'skin')
      .map(c => c._id.toString());
    
    const powerUpIds = insertedContents
      .filter(c => c.category === 'power-up')
      .map(c => c._id.toString());
    
    const achievementIds = insertedContents
      .filter(c => c.category === 'achievement')
      .map(c => c._id.toString());
    
    return { skinIds, powerUpIds, achievementIds, allContentIds: insertedContents.map(c => c._id.toString()) };
  } catch (err) {
    console.error('❌ Error seeding contents:', err);
    throw err;
  }
};

// Seed game dashboards
const seedGameDashboards = async (userIds: Types.ObjectId[], achievementIds: string[]) => {
  try {
    await GameDashboardModel.deleteMany({});
    const gameDashboardData = createGameDashboardData(userIds, achievementIds);
    await GameDashboardModel.insertMany(gameDashboardData);
    console.log('✅ Game Dashboards seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding game dashboards:', err);
    throw err;
  }
};

// Seed collections
const seedCollections = async (
  userIds: Types.ObjectId[], 
  skinIds: string[], 
  powerUpIds: string[], 
  packageIds: string[]
) => {
  try {
    await CollectionModel.deleteMany({});
    const collectionsData = createCollectionsData(userIds, skinIds, powerUpIds, packageIds);
    await CollectionModel.insertMany(collectionsData);
    console.log('✅ Collections seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding collections:', err);
    throw err;
  }
};

// Seed transactions
const seedTransactions = async (userIds: Types.ObjectId[], packageIds: string[]) => {
  try {
    await TransactionModel.deleteMany({});
    const transactionsData = createTransactionsData(userIds, packageIds);
    await TransactionModel.insertMany(transactionsData);
    console.log('✅ Transactions seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding transactions:', err);
    throw err;
  }
};

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    const dbUrl = process.env.MONGODB_URL;
    if (!dbUrl) throw new Error('MONGODB_URL not set in environment variables');

    await mongoose.connect(dbUrl);
    console.log('🔌 Connected to MongoDB');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    console.log('\n🌱 Starting database seeding...\n');
    
    await connectToDatabase();
    await dropDatabase();
    
    // Seed in order (respecting dependencies)
    const userIds = await seedUsers();
    const packageIds = await seedPackages();
    const { skinIds, powerUpIds, achievementIds } = await seedContents();
    
    // Seed collections that depend on users and content
    await seedGameDashboards(userIds, achievementIds);
    await seedCollections(userIds, skinIds, powerUpIds, packageIds);
    await seedTransactions(userIds, packageIds);

    console.log('\n✨ Database seeding completed successfully! ✨');
    console.log('\n📊 Seeding Summary:');
    console.log(`   - Users: ${userIds.length}`);
    console.log(`   - Packages: ${packageIds.length}`);
    console.log(`   - Contents: ${skinIds.length + powerUpIds.length + achievementIds.length}`);
    console.log(`   - Game Dashboards: ${userIds.length} (10 minimum)`);
    console.log(`   - Collections: ${userIds.length} (10 minimum)`);
    console.log(`   - Transactions: 10\n`);
    
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Execute seeding
seedDatabase();