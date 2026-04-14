import express from 'express';
import { generateRecipes, saveRecipe, getSavedRecipes, deleteRecipe, toggleFavorite } from '../controllers/recipeController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', authMiddleware, generateRecipes);
router.post('/save', authMiddleware, saveRecipe);
router.get('/saved', authMiddleware, getSavedRecipes);
router.delete('/:id', authMiddleware, deleteRecipe);
router.put('/:id/favorite', authMiddleware, toggleFavorite);

export default router;
