// Create this file: backend/routes/googleAuth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Adjust path to your User model
const router = express.Router();

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Sign-In endpoint
router.post('/google', async (req, res) => {
  try {
    console.log('Google auth request received');
    
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify the Google token
    console.log('Verifying Google token...');
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('Google token verified successfully');
    
    const { 
      sub: googleId, 
      email, 
      name: fullName, 
      picture: profilePicture 
    } = payload;

    console.log('Google user data:', { googleId, email, fullName });

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      console.log('Existing user found, logging in');
      
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = profilePicture;
        await user.save();
      }
    } else {
      console.log('Creating new user from Google auth');
      
      // Create new user
      user = new User({
        fullName: fullName,
        email: email,
        googleId: googleId,
        profilePicture: profilePicture,
        authProvider: 'google',
        isEmailVerified: true // Google emails are pre-verified
      });

      await user.save();
      console.log('New user created successfully');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        fullName: user.fullName 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('JWT token generated successfully');

    // Send success response
    res.json({
      success: true,
      message: 'Google authentication successful',
      token: token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        authProvider: 'google'
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Authentication error'
    });
  }
});

module.exports = router;