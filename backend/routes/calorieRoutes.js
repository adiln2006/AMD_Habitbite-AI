import express from 'express';
import { estimateCalories, getDailyCalories, getWeeklyCalories } from '../controllers/calorieController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/estimate', authMiddleware, estimateCalories);
router.get('/daily', authMiddleware, getDailyCalories);
router.get('/weekly', authMiddleware, getWeeklyCalories);

export default router;
