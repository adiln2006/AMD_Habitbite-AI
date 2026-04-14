import express from 'express';
import { logFood, getPatterns, getAlerts, getInsights, getHistory } from '../controllers/habitController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/log', authMiddleware, logFood);
router.get('/patterns', authMiddleware, getPatterns);
router.get('/alerts', authMiddleware, getAlerts);
router.get('/insights', authMiddleware, getInsights);
router.get('/history', authMiddleware, getHistory);

export default router;
