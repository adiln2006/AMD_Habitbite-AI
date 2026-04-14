import express from 'express';
import { generateRoadmap, getActiveRoadmap, getAllRoadmaps, updateProgress, deleteRoadmap } from '../controllers/roadmapController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', authMiddleware, generateRoadmap);
router.get('/active', authMiddleware, getActiveRoadmap);
router.get('/all', authMiddleware, getAllRoadmaps);
router.put('/:id/progress', authMiddleware, updateProgress);
router.delete('/:id', authMiddleware, deleteRoadmap);

export default router;
