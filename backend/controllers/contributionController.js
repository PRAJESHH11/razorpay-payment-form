// import Contribution from '../models/Contribution.js'

// export const getAllContributions = async (req, res) => {
//   try {
//     const contributions = await Contribution.find()
//       .sort({ createdAt: -1 })
//       .select('-razorpaySignature')

//     res.json({
//       success: true,
//       count: contributions.length,
//       contributions
//     })
//   } catch (error) {
//     console.error('Error fetching contributions:', error)
//     res.status(500).json({ error: 'Failed to fetch contributions' })
//   }
// }

// export const getContributionById = async (req, res) => {
//   try {
//     const contribution = await Contribution.findById(req.params.id)
//       .select('-razorpaySignature')

//     if (!contribution) {
//       return res.status(404).json({ error: 'Contribution not found' })
//     }

//     res.json({
//       success: true,
//       contribution
//     })
//   } catch (error) {
//     console.error('Error fetching contribution:', error)
//     res.status(500).json({ error: 'Failed to fetch contribution' })
//   }
// }

// export const getStats = async (req, res) => {
//   try {
//     const totalContributions = await Contribution.countDocuments({ paymentStatus: 'completed' })
//     const totalAmount = await Contribution.aggregate([
//       { $match: { paymentStatus: 'completed' } },
//       { $group: { _id: null, total: { $sum: '$totalAmount' } } }
//     ])

//     const recentContributions = await Contribution.find({ paymentStatus: 'completed' })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select('name amount totalAmount anonymous createdAt')

//     res.json({
//       success: true,
//       stats: {
//         totalContributions,
//         totalAmount: totalAmount[0]?.total || 0,
//         recentContributions
//       }
//     })
//   } catch (error) {
//     console.error('Error fetching stats:', error)
//     res.status(500).json({ error: 'Failed to fetch statistics' })
//   }
// }

const Contribution = require('../models/Contribution');

// @desc    Create new contribution
// @route   POST /api/contributions
// @access  Private (requires authentication)
const createContribution = async (req, res) => {
  try {
    console.log('Creating contribution for user:', req.user.userId);
    
    const {
      fullName,
      email,
      phone,
      address,
      amount,
      contributionType,
      category,
      message,
      paymentId,
      razorpayOrderId
    } = req.body;
    
    // Validation
    if (!fullName || !email || !phone || !address || !amount || !contributionType || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    if (!paymentId || !razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment information is required'
      });
    }
    
    // Create contribution
    const contribution = new Contribution({
      // User info
      userId: req.user.userId, // From auth middleware
      fullName,
      email,
      phone,
      address,
      
      // Contribution details
      amount,
      contributionType,
      category,
      message,
      
      // Payment info
      paymentId,
      razorpayOrderId,
      paymentStatus: 'pending'
    });
    
    await contribution.save();
    
    console.log('Contribution created successfully:', contribution._id);
    
    res.status(201).json({
      success: true,
      message: 'Contribution created successfully',
      contribution
    });
    
  } catch (error) {
    console.error('Create contribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating contribution',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all contributions
// @route   GET /api/contributions
// @access  Private (requires authentication)
const getContributions = async (req, res) => {
  try {
    console.log('Getting contributions for user:', req.user.userId);
    
    // Regular users can only see their own contributions
    // Admins can see all contributions
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.userId };
    
    const contributions = await Contribution.find(filter)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 }); // Newest first
    
    res.status(200).json({
      success: true,
      count: contributions.length,
      contributions
    });
    
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contributions'
    });
  }
};

// @desc    Get single contribution
// @route   GET /api/contributions/:id
// @access  Private (requires authentication)
const getContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate('userId', 'fullName email');
    
    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution not found'
      });
    }
    
    // Check if user owns this contribution or is admin
    if (contribution.userId._id.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own contributions.'
      });
    }
    
    res.status(200).json({
      success: true,
      contribution
    });
    
  } catch (error) {
    console.error('Get contribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contribution'
    });
  }
};

// @desc    Update contribution
// @route   PUT /api/contributions/:id
// @access  Private (requires authentication)
const updateContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    
    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution not found'
      });
    }
    
    // Check if user owns this contribution or is admin
    if (contribution.userId.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own contributions.'
      });
    }
    
    // Update allowed fields
    const allowedUpdates = ['paymentStatus', 'razorpayPaymentId', 'razorpaySignature', 'message'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const updatedContribution = await Contribution.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    console.log('Contribution updated:', updatedContribution._id);
    
    res.status(200).json({
      success: true,
      message: 'Contribution updated successfully',
      contribution: updatedContribution
    });
    
  } catch (error) {
    console.error('Update contribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contribution'
    });
  }
};

// @desc    Delete contribution
// @route   DELETE /api/contributions/:id
// @access  Private (Admin only)
const deleteContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    
    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution not found'
      });
    }
    
    await contribution.deleteOne();
    
    console.log('Contribution deleted:', req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Contribution deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete contribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contribution'
    });
  }
};

// @desc    Get contribution statistics
// @route   GET /api/contributions/stats
// @access  Private (Admin only)
const getContributionStats = async (req, res) => {
  try {
    const stats = await Contribution.aggregate([
      {
        $match: { paymentStatus: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalContributions: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalAmount: 0,
      totalContributions: 0,
      averageAmount: 0
    };
    
    res.status(200).json({
      success: true,
      stats: result
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

module.exports = {
  createContribution,
  getContributions,
  getContribution,
  updateContribution,
  deleteContribution,
  getContributionStats
};