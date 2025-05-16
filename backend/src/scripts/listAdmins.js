const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const AdminUser = require('../models/AdminUser');
const connectDB = require('../config/db');

// Load env vars from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const listAdminUsers = async () => {
  try {
    await connectDB();
    console.log('Fetching admin users...');

    const users = await AdminUser.find({}).select('username role createdAt updatedAt');

    if (users.length === 0) {
      console.log('No admin users found in the database.');
    } else {
      console.log('Admin Users:');
      users.forEach(user => {
        console.log(`  - Username: ${user.username}, Role: ${user.role}, Created: ${user.createdAt}`);
      });
    }
    process.exit(0);
  } catch (error) {
    console.error('Error fetching admin users:', error.message);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
};

listAdminUsers();
