import express from 'express';
import { suggestExercises, getDailyExercise } from '../controllers/exerciseController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/suggest', authMiddleware, suggestExercises);
router.get('/daily', authMiddleware, getDailyExercise);

export default router;
