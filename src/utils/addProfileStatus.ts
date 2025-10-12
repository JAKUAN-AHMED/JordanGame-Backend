import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../modules/user/user.model';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    const dbUrl = process.env.MONGODB_URL;
    if (!dbUrl) throw new Error('MONGODB_URL not set in environment variables');

    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

// Add profileStatus to all existing users
const addProfileStatusToUsers = async () => {
  try {
    console.log('🔄 Starting migration: Adding profileStatus to all users...');

    // Update all users that don't have profileStatus field
    const result = await User.updateMany(
      { profileStatus: { $exists: false } },
      { $set: { profileStatus: 'active' } }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Total users updated: ${result.modifiedCount}`);
    console.log(`📊 Total users matched: ${result.matchedCount}`);

    // Show all users with their profileStatus
    const users = await User.find({}, 'email fullName profileStatus');
    console.log('\n📋 Current users in database:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.fullName} - Status: ${user.profileStatus}`);
    });

  } catch (err) {
    console.error('❌ Error during migration:', err);
    throw err;
  }
};

// Main function
const runMigration = async () => {
  try {
    await connectToDatabase();
    await addProfileStatusToUsers();
    console.log('\n✅ Migration process completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Execute migration
runMigration();
