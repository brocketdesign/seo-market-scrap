const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path'); // Import path module
const readline = require('readline');
const AdminUser = require('../models/AdminUser');
const connectDB = require('../config/db');

// Load env vars from root .env file
// Construct the absolute path to the .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdminUser = async () => {
  try {
    await connectDB();

    console.log('Creating a new admin user...');
    const username = await prompt('Enter username for admin: ');
    if (!username) {
      console.error('Username cannot be empty.');
      process.exit(1);
    }

    const password = await prompt('Enter password for admin: ');
    if (!password) {
      console.error('Password cannot be empty.');
      process.exit(1);
    }
    
    // Check if user already exists
    const existingUser = await AdminUser.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      console.log('Admin user with this username already exists.');
      process.exit(0);
    }

    const adminData = {
      username: username.toLowerCase(),
      password: password, // Password will be hashed by the pre-save hook in the model
      role: 'admin'
    };

    const admin = new AdminUser(adminData);
    await admin.save();

    console.log(`Admin user "${admin.username}" created successfully!`);
    process.exit(0);

  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    mongoose.disconnect();
  }
};

createAdminUser();
