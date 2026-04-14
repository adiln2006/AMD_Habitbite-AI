import FoodLog from '../models/FoodLog.js';
import { getSmartAlternative } from '../services/geminiService.js';

/**
 * Analyze food logs for the past N days and detect junk food patterns.
 * Rule: If user eats junk food at the same time slot for 3+ days → pattern detected.
 */
export const analyzePatterns = async (userId, days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all food logs for the period
  const logs = await FoodLog.find({
    userId,
    loggedAt: { $gte: startDate },
  }).sort({ loggedAt: 1 });

  if (logs.length === 0) return { patterns: [], alerts: [] };

  // Group by hour of day + food type
  const hourGroups = {};

  logs.forEach(log => {
    const hour = new Date(log.loggedAt).getHours();
    const key = `${hour}`;
    
    if (!hourGroups[key]) {
      hourGroups[key] = { hour, junkCount: 0, healthyCount: 0, totalDays: 0, foods: [] };
    }

    if (log.foodType === 'junk') {
      hourGroups[key].junkCount++;
      hourGroups[key].foods.push(log.foodName);
    } else {
      hourGroups[key].healthyCount++;
    }
    hourGroups[key].totalDays++;
  });

  const patterns = [];
  const alerts = [];

  for (const [key, data] of Object.entries(hourGroups)) {
    const confidence = data.junkCount / Math.max(days, 1);
    
    // Pattern detected: junk food at same time for 3+ entries
    if (data.junkCount >= 3) {
      const timeStr = formatHour(data.hour);
      const mostCommonJunk = getMostCommon(data.foods);

      patterns.push({
        hour: data.hour,
        timeStr,
        junkCount: data.junkCount,
        healthyCount: data.healthyCount,
        confidence: Math.round(confidence * 100),
        mostCommonFood: mostCommonJunk,
        type: 'junk_pattern',
      });

      // Generate smart alternative using AI
      try {
        const alternative = await getSmartAlternative(mostCommonJunk, timeStr);
        alerts.push({
          time: timeStr,
          hour: data.hour,
          message: `You usually eat junk at ${timeStr} 🍟 Try ${alternative.alternative} instead!`,
          alternative,
          confidence: Math.round(confidence * 100),
          severity: confidence > 0.5 ? 'high' : 'medium',
        });
      } catch (err) {
        alerts.push({
          time: timeStr,
          hour: data.hour,
          message: `You usually eat junk at ${timeStr} 🍟 Try a healthier snack today!`,
          alternative: null,
          confidence: Math.round(confidence * 100),
          severity: confidence > 0.5 ? 'high' : 'medium',
        });
      }
    }
  }

  // Sort alerts by confidence (highest first)
  alerts.sort((a, b) => b.confidence - a.confidence);

  // Build hourly distribution for chart
  const hourlyDistribution = Array.from({ length: 24 }, (_, i) => {
    const data = hourGroups[`${i}`];
    return {
      hour: i,
      label: formatHour(i),
      junk: data?.junkCount || 0,
      healthy: data?.healthyCount || 0,
      total: (data?.junkCount || 0) + (data?.healthyCount || 0),
    };
  });

  return { patterns, alerts, hourlyDistribution };
};

function formatHour(hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h} ${period}`;
}

function getMostCommon(arr) {
  const freq = {};
  arr.forEach(item => {
    freq[item] = (freq[item] || 0) + 1;
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'snack';
}
