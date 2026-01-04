const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('📝 Signup request received:', { name, email, password: password ? '***' : 'missing' });

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Validation failed: missing fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and password' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    console.log('👤 Creating new user...');
    // Set role to admin if email is admin@gmail.com, otherwise 'user'
    const role = email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user';
    // Admin automatically gets map access
    const hasMapAccess = role === 'admin';
    const user = new User({ 
      name, 
      email, 
      password, 
      role: role,  // Explicitly set role
      hasMapAccess: hasMapAccess,  // Admin gets map access automatically
      upgradeStatus: role === 'admin' ? 'approved' : 'none'  // Admin is auto-approved
    });
    
    // Validate before saving
    const validationError = user.validateSync();
    if (validationError) {
      console.error('❌ Validation error:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: validationError.message
      });
    }

    await user.save();
    console.log('✅ User saved successfully:', { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      hasMapAccess: user.hasMapAccess,
      upgradeStatus: user.upgradeStatus
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🎉 Signup successful for:', email);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasMapAccess: user.hasMapAccess,
        upgradeStatus: user.upgradeStatus,
      },
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Ensure admin always has map access (in case it was changed)
    if (user.role === 'admin' && !user.hasMapAccess) {
      user.hasMapAccess = true;
      user.upgradeStatus = 'approved';
      user.mapAccessGrantedAt = new Date();
      // Admin access never expires
      user.mapAccessExpiresAt = null;
      await user.save();
    }
    
    // Check if user's map access has expired
    if (user.hasMapAccess && user.mapAccessExpiresAt) {
      const now = new Date();
      if (now > user.mapAccessExpiresAt) {
        // Access expired, revoke it
        user.hasMapAccess = false;
        user.upgradeStatus = 'none';
        await user.save();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasMapAccess: user.role === 'admin' ? true : user.hasMapAccess,
        upgradeStatus: user.role === 'admin' ? 'approved' : user.upgradeStatus,
        mapAccessGrantedAt: user.mapAccessGrantedAt,
        mapAccessExpiresAt: user.mapAccessExpiresAt,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;

