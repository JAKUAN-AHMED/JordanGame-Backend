import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../modules/user/user.model';
import { usersData } from '../data/userData';
import bcrypt from 'bcrypt';
import { packageModel } from '../modules/package/package.model';
import { packagesData } from '../data/packageData';
import { ContentModel } from '../modules/ContentManagement/content.model';
import { contentsData } from '../data/contentData';
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
    const ModifiedData=await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10), 
      }))
    );
    await User.insertMany(ModifiedData);
    console.log('Users seeded successfully!');
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};


//seed packages

const seedPackages = async () => {
  try {
    await packageModel.deleteMany({});
    await packageModel.insertMany(packagesData);
    console.log('Packages seeded successfully!');
  } catch (err) {
    console.error('Error seeding packages:', err);
  }
};

//seed content data


const seedContents = async () => {
  try {
    await ContentModel.deleteMany({});
    await ContentModel.insertMany(contentsData);
    console.log('Contents seeded successfully!');
  } catch (err) {
    console.error('Error seeding contents:', err);
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
    await seedPackages();
    await seedContents();

    console.log('➡️  Users seeding Sucessfully <--------------');
    console.log('➡️  Packages seeding Sucessfully <--------------');
    console.log('➡️  Contents seeding Sucessfully <--------------');
    console.log('➡️  Database seeding completed <--------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect().then(() => console.log('Disconnected from MongoDB'));
  }
};



// Execute seeding
seedDatabase();
