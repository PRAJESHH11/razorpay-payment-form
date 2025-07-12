import express from 'express'
import { 
  getAllContributions, 
  getContributionById, 
  getStats 
} from '../controllers/contributionController.js'

const router = express.Router()

router.get('/contributions', getAllContributions)
router.get('/contributions/:id', getContributionById)
router.get('/stats', getStats)

export default router