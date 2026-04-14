import { suggestExercises as aiSuggestExercises } from '../services/geminiService.js';

// POST /api/exercise/suggest
export const suggestExercises = async (req, res) => {
  try {
    const { goal, timeAvailable } = req.body;

    const exercises = await aiSuggestExercises(
      goal || req.user.goal || 'healthy_eating',
      timeAvailable || 10
    );

    res.json({ exercises });
  } catch (error) {
    console.error('Exercise suggestion error:', error);
    res.status(500).json({ message: 'Failed to suggest exercises' });
  }
};

// GET /api/exercise/daily
export const getDailyExercise = async (req, res) => {
  try {
    const exercises = await aiSuggestExercises(
      req.user.goal || 'healthy_eating',
      10
    );

    res.json({
      date: new Date().toISOString().split('T')[0],
      exercises,
      totalDuration: exercises.reduce((sum, ex) => {
        const mins = parseInt(ex.duration) || 3;
        return sum + mins;
      }, 0) + ' min',
      totalCaloriesBurned: exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 20), 0),
    });
  } catch (error) {
    console.error('Daily exercise error:', error);
    res.status(500).json({ message: 'Failed to get daily exercises' });
  }
};
