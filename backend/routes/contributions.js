// // import express from 'express'
// // import { 
// //   getAllContributions, 
// //   getContributionById, 
// //   getStats 
// // } from '../controllers/contributionController.js'

// // const router = express.Router()

// // router.get('/contributions', getAllContributions)
// // router.get('/contributions/:id', getContributionById)
// // router.get('/stats', getStats)

// // export default router




// const express = require('express');
// const router = express.Router();

// // Import controller functions
// const {
//   createContribution,
//   getContributions,
//   getContribution,
//   updateContribution,
//   deleteContribution,
//   getContributionStats
// } = require('../controllers/contributionController');

// // Import middleware
// const { protect, authorize } = require('../middleware/auth');

// // @route   POST /api/contributions
// // @desc    Create new contribution
// // @access  Private (requires authentication)
// router.post('/', protect, createContribution);

// // @route   GET /api/contributions
// // @desc    Get all contributions (user gets their own, admin gets all)
// // @access  Private (requires authentication)
// router.get('/', protect, getContributions);

// // @route   GET /api/contributions/stats
// // @desc    Get contribution statistics
// // @access  Private (Admin only)
// router.get('/stats', protect, authorize('admin'), getContributionStats);

// // @route   GET /api/contributions/:id
// // @desc    Get single contribution
// // @access  Private (requires authentication)
// router.get('/:id', protect, getContribution);

// // @route   PUT /api/contributions/:id
// // @desc    Update contribution
// // @access  Private (requires authentication)
// router.put('/:id', protect, updateContribution);

// // @route   DELETE /api/contributions/:id
// // @desc    Delete contribution
// // @access  Private (Admin only)
// router.delete('/:id', protect, authorize('admin'), deleteContribution);

// module.exports = router;


const express = require('express');
const router = express.Router();

// Simple test route first
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Contributions routes are working!'
  });
});

// Export the router - THIS LINE IS CRUCIAL
module.exports = router;