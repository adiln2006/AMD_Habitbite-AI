import FoodLog from '../models/FoodLog.js';
import { estimateCalories as aiEstimateCalories } from '../services/geminiService.js';

// POST /api/calories/estimate
export const estimateCalories = async (req, res) => {
  try {
    const { foodName, quantity } = req.body;

    if (!foodName) {
      return res.status(400).json({ message: 'Please provide a food name' });
    }

    const nutrition = await aiEstimateCalories(foodName, quantity || '1 serving');
    res.json(nutrition);
  } catch (error) {
    console.error('Calorie estimation error:', error);
    res.status(500).json({ message: 'Failed to estimate calories' });
  }
};

// GET /api/calories/daily
export const getDailyCalories = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await FoodLog.find({
      userId: req.user._id,
      loggedAt: { $gte: today, $lt: tomorrow },
    }).sort({ loggedAt: 1 });

    const totalCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const totalProtein = logs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const totalCarbs = logs.reduce((sum, log) => sum + (log.carbs || 0), 0);
    const totalFat = logs.reduce((sum, log) => sum + (log.fat || 0), 0);

    // Group by meal time
    const mealBreakdown = {
      breakfast: { calories: 0, items: [] },
      lunch: { calories: 0, items: [] },
      dinner: { calories: 0, items: [] },
      snack: { calories: 0, items: [] },
    };

    logs.forEach(log => {
      if (mealBreakdown[log.mealTime]) {
        mealBreakdown[log.mealTime].calories += log.calories || 0;
        mealBreakdown[log.mealTime].items.push({
          name: log.foodName,
          calories: log.calories,
          type: log.foodType,
        });
      }
    });

    res.json({
      date: today.toISOString().split('T')[0],
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      mealBreakdown,
      logs,
      goalCalories: req.user.dailyCalorieGoal || 2000,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/calories/weekly
export const getWeeklyCalories = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const logs = await FoodLog.find({
      userId: req.user._id,
      loggedAt: { $gte: startDate, $lte: endDate },
    });

    // Group by day
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.loggedAt).toISOString().split('T')[0];
        return logDate === dateStr;
      });

      dailyData.push({
        date: dateStr,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        calories: dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0),
        junkItems: dayLogs.filter(l => l.foodType === 'junk').length,
        healthyItems: dayLogs.filter(l => l.foodType === 'healthy').length,
      });
    }

    res.json({
      weeklyData: dailyData,
      averageCalories: Math.round(dailyData.reduce((s, d) => s + d.calories, 0) / 7),
      goalCalories: req.user.dailyCalorieGoal || 2000,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
