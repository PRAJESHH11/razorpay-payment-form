const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes that require authentication
// Think of this as a "security guard" that checks if user has valid ID card (JWT token)
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Token from Authorization header: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in Authorization header');
    } else if (req.cookies.token) {
      // Token from cookie
      token = req.cookies.token;
      console.log('Token found in cookie');
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified for user:', decoded.userId);
      
      // Get user from database (without password)
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists'
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account has been deactivated'
        });
      }
      
      // Add user to request object so other middlewares/controllers can access it
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      };
      
      next(); // Continue to the next middleware/controller
      
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      
      // Handle specific JWT errors
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed'
        });
      }
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check if user has specific roles
// Usage: authorize('admin') or authorize('admin', 'moderator')
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user object exists (should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }
    
    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      console.log(`Access denied for role '${req.user.role}'. Required roles: ${roles.join(', ')}`);
      
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    console.log(`Access granted for role '${req.user.role}'`);
    next(); // User has required role, continue
  };
};

// Optional authentication middleware - doesn't block if no token
// Useful for routes that work for both authenticated and non-authenticated users
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    // If no token, just continue without setting req.user
    if (!token) {
      console.log('No token provided, continuing as guest');
      return next();
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        // Add user to request object
        req.user = {
          userId: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName
        };
        console.log('Optional auth: User authenticated:', user.email);
      }
      
    } catch (jwtError) {
      console.log('Optional auth: Invalid token, continuing as guest');
      // Don't return error, just continue as guest
    }
    
    next();
    
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Don't block the request, just continue
    next();
  }
};

// Middleware to check if user owns a resource
// Useful for ensuring users can only access their own data
const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      
      // Find the resource
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }
      
      // Check if user owns the resource or is admin
      if (resource.userId.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }
      
      // Add resource to request object for use in controller
      req.resource = resource;
      next();
      
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in ownership verification'
      });
    }
  };
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkOwnership
};