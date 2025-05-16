const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Authenticate admin user & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  console.log('[AdminController] Attempting loginAdmin...');
  console.log('[AdminController] Request body:', req.body);
  console.log('[AdminController] Request headers:', req.headers);

  const { username, password } = req.body;

  if (!username || !password) {
    console.log('[AdminController] Username or password not provided in request body.');
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    console.log(`[AdminController] Searching for user: ${username.toLowerCase()}`);
    // Check for user
    const user = await AdminUser.findOne({ username: username.toLowerCase() });

    if (!user) {
      console.log(`[AdminController] User "${username.toLowerCase()}" not found in database.`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log(`[AdminController] User "${user.username}" found. Role: ${user.role}`);

    // Check if password matches
    console.log(`[AdminController] Comparing password for user "${user.username}"`);
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log(`[AdminController] Password mismatch for user "${user.username}".`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log(`[AdminController] Password matched for user "${user.username}".`);

    // User matched, create JWT
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  loginAdmin,
};
