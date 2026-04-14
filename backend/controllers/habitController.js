import FoodLog from '../models/FoodLog.js';
import { analyzePatterns } from '../utils/habitAnalyzer.js';

// POST /api/habits/log
export const logFood = async (req, res) => {
  try {
    const { foodName, foodType, calories, protein, carbs, fat, mealTime, quantity } = req.body;

    if (!foodName || !foodType || !mealTime) {
      return res.status(400).json({ message: 'Please provide foodName, foodType, and mealTime' });
    }

    const log = await FoodLog.create({
      userId: req.user._id,
      foodName,
      foodType,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      mealTime,
      quantity: quantity || '1 serving',
      loggedAt: new Date(),
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/habits/patterns
export const getPatterns = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const analysis = await analyzePatterns(req.user._id, days);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/habits/alerts
export const getAlerts = async (req, res) => {
  try {
    const analysis = await analyzePatterns(req.user._id, 7);
    res.json({ alerts: analysis.alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/habits/insights
export const getInsights = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await FoodLog.find({
      userId: req.user._id,
      loggedAt: { $gte: startDate },
    }).sort({ loggedAt: -1 });

    // Calculate stats
    const totalLogs = logs.length;
    const junkCount = logs.filter(l => l.foodType === 'junk').length;
    const healthyCount = logs.filter(l => l.foodType === 'healthy').length;
    const healthyPercentage = totalLogs > 0 ? Math.round((healthyCount / totalLogs) * 100) : 0;

    // Daily breakdown
    const dailyBreakdown = {};
    logs.forEach(log => {
      const dateKey = new Date(log.loggedAt).toISOString().split('T')[0];
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = { date: dateKey, junk: 0, healthy: 0, totalCalories: 0 };
      }
      if (log.foodType === 'junk') dailyBreakdown[dateKey].junk++;
      else dailyBreakdown[dateKey].healthy++;
      dailyBreakdown[dateKey].totalCalories += log.calories || 0;
    });

    // Get pattern analysis
    const analysis = await analyzePatterns(req.user._id, days);

    res.json({
      totalLogs,
      junkCount,
      healthyCount,
      healthyPercentage,
      compliance: healthyPercentage,
      dailyBreakdown: Object.values(dailyBreakdown),
      patterns: analysis.patterns,
      alerts: analysis.alerts,
      hourlyDistribution: analysis.hourlyDistribution,
      recentLogs: logs.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/habits/history
export const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await FoodLog.find({ userId: req.user._id })
      .sort({ loggedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FoodLog.countDocuments({ userId: req.user._id });

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
