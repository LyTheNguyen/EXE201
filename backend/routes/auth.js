const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
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

    console.log('SIGNIN - User from DB:', {
      id: user._id,
      name: user.name,
      email: user.email,
      img: user.img
    });

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
        img: user.img
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

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=google_auth_failed' }),
  async (req, res) => {
    try {
      // User is authenticated, generate JWT token
      const user = req.user;
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token and user info
      const redirectUrl = `http://localhost:3000/login?success=google_auth&token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasMapAccess: user.role === 'admin' ? true : user.hasMapAccess,
        upgradeStatus: user.role === 'admin' ? 'approved' : user.upgradeStatus,
        mapAccessGrantedAt: user.mapAccessGrantedAt,
        mapAccessExpiresAt: user.mapAccessExpiresAt,
        img: user.img || user.photo || null
      }))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('http://localhost:3000/login?error=google_auth_error');
    }
  }
);

// Google Sign-In with ID Token
router.post('/google-signin', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing Google token' });
    }

    // Verify Google ID token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        password: 'google_oauth_' + Math.random().toString(36).substring(2),
        role: email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user',
        hasMapAccess: email.toLowerCase() === 'admin@gmail.com',
        upgradeStatus: email.toLowerCase() === 'admin@gmail.com' ? 'approved' : 'none',
        img: picture || null
      });
      
      await user.save();
    } else {
      // Update user info if needed
      if (!user.img && picture) {
        user.img = picture;
        await user.save();
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasMapAccess: user.hasMapAccess,
        upgradeStatus: user.upgradeStatus,
        img: user.img
      }
    });

  } catch (error) {
    console.error('Google Sign-In Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Google authentication failed' 
    });
  }
});

// Test route to check user data
router.get('/test-user', async (req, res) => {
  try {
    const user = await User.findOne({ email: 'tin@gmail.com' });
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        img: user.img
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint to debug user data
router.post('/debug-signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }
    
    // Log user data
    console.log('DEBUG - User from DB:', {
      id: user._id,
      name: user.name,
      email: user.email,
      img: user.img
    });
    
    // Return user data
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        img: user.img
      }
    });
    
  } catch (error) {
    console.error('DEBUG error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

