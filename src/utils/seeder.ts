import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../modules/user/user.model';

// Load environment variables
dotenv.config();

// Sample data for default users - Updated to match new User model
const usersData = [
  {
    fullName: 'Super Admin',
    email: 'superadmin@gmail.com',
    password: '$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO', // Hashed password: 12345678
    profileImage: 'https://i.pravatar.cc/300?img=1',
    role: 'admin',
    profileStatus: 'active',
    isEmailVerified: true,
    isResetPassword: false,
    failedLoginAttempts: 0,
  },
  {
    fullName: 'Testing Admin',
    email: 'admin@gmail.com',
    password: '$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO', // Hashed password: 12345678
    profileImage: 'https://i.pravatar.cc/300?img=2',
    role: 'admin',
    profileStatus: 'active',
    isEmailVerified: true,
    isResetPassword: false,
    failedLoginAttempts: 0,
  },
  {
    fullName: 'Test User One',
    email: 'user1@gmail.com',
    password: '$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO', // Hashed password: 12345678
    profileImage: 'https://i.pravatar.cc/300?img=3',
    role: 'user',
    profileStatus: 'active',
    isEmailVerified: true,
    isResetPassword: false,
    failedLoginAttempts: 0,
  },
  {
    fullName: 'Test User Two',
    email: 'user2@gmail.com',
    password: '$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO', // Hashed password: 12345678
    profileImage: 'https://i.pravatar.cc/300?img=4',
    role: 'user',
    profileStatus: 'active',
    isEmailVerified: true,
    isResetPassword: false,
    failedLoginAttempts: 0,
  },
];

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
    await User.insertMany(usersData);
    console.log('Users seeded successfully!');
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    const dbUrl = process.env.MONGODB_URL;
    if (!dbUrl) throw new Error('MONGODB_URL not set in environment variables');

    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit process with failure
  }
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    await connectToDatabase();
    await dropDatabase();
    await seedUsers();
    console.log('--------------> Database seeding completed <--------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect().then(() => console.log('Disconnected from MongoDB'));
  }
};



// Execute seeding
seedDatabase();
