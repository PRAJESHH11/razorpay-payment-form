import Contribution from '../models/Contribution.js'

export const getAllContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find()
      .sort({ createdAt: -1 })
      .select('-razorpaySignature')

    res.json({
      success: true,
      count: contributions.length,
      contributions
    })
  } catch (error) {
    console.error('Error fetching contributions:', error)
    res.status(500).json({ error: 'Failed to fetch contributions' })
  }
}

export const getContributionById = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .select('-razorpaySignature')

    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' })
    }

    res.json({
      success: true,
      contribution
    })
  } catch (error) {
    console.error('Error fetching contribution:', error)
    res.status(500).json({ error: 'Failed to fetch contribution' })
  }
}

export const getStats = async (req, res) => {
  try {
    const totalContributions = await Contribution.countDocuments({ paymentStatus: 'completed' })
    const totalAmount = await Contribution.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])

    const recentContributions = await Contribution.find({ paymentStatus: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name amount totalAmount anonymous createdAt')

    res.json({
      success: true,
      stats: {
        totalContributions,
        totalAmount: totalAmount[0]?.total || 0,
        recentContributions
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
}