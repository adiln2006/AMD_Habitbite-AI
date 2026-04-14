import Recipe from '../models/Recipe.js';
import { generateRecipes as aiGenerateRecipes } from '../services/geminiService.js';

// POST /api/recipes/generate
export const generateRecipes = async (req, res) => {
  try {
    const { ingredients, cuisine } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one ingredient' });
    }

    const recipes = await aiGenerateRecipes(ingredients, cuisine || 'any');
    res.json({ recipes });
  } catch (error) {
    console.error('Recipe generation error:', error);
    res.status(500).json({ message: 'Failed to generate recipes. Please try again.' });
  }
};

// POST /api/recipes/save
export const saveRecipe = async (req, res) => {
  try {
    const { title, ingredients, steps, cuisine, prepTime, calories, healthTip } = req.body;

    const recipe = await Recipe.create({
      userId: req.user._id,
      title,
      ingredients,
      steps,
      cuisine,
      prepTime,
      calories,
      healthTip,
    });

    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/recipes/saved
export const getSavedRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/recipes/:id
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/recipes/:id/favorite
export const toggleFavorite = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.user._id });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    recipe.isFavorite = !recipe.isFavorite;
    await recipe.save();
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
