import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { logFood, estimateCalories, getDailyCalories, suggestExercises as apiSuggestExercises } from '../services/api';
import toast from 'react-hot-toast';

const DailyLog = () => {
  const { user } = useAuth();
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1 serving');
  const [foodType, setFoodType] = useState('healthy');
  const [mealTime, setMealTime] = useState('snack');
  const [logging, setLogging] = useState(false);
  const [daily, setDaily] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [exLoading, setExLoading] = useState(false);

  const goalCalories = user?.dailyCalorieGoal || 2000;

  useEffect(() => {
    fetchDaily();
  }, []);

  const fetchDaily = async () => {
    try {
      const { data } = await getDailyCalories();
      setDaily(data);
    } catch (e) { /* ignore */ }
  };

  const handleLog = async () => {
    if (!foodName.trim()) { toast.error('Enter a food name'); return; }
    setLogging(true);
    try {
      // First estimate calories with AI
      let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, category: foodType };
      try {
        const { data } = await estimateCalories({ foodName, quantity });
        nutrition = data;
      } catch (e) { /* use defaults */ }

      // Then log the food
      await logFood({
        foodName: foodName.trim(),
        foodType: nutrition.category || foodType,
        calories: nutrition.calories || 0,
        protein: nutrition.protein || 0,
        carbs: nutrition.carbs || 0,
        fat: nutrition.fat || 0,
        mealTime,
        quantity,
      });

      toast.success(`Logged ${foodName} — ${nutrition.calories || 0} cal`);
      setFoodName('');
      setQuantity('1 serving');
      fetchDaily();
    } catch (err) {
      toast.error('Failed to log food');
    }
    setLogging(false);
  };

  const handleGetExercises = async () => {
    setExLoading(true);
    try {
      const { data } = await apiSuggestExercises({ goal: user?.goal || 'healthy_eating', timeAvailable: 10 });
      setExercises(data.exercises || []);
    } catch (e) {
      toast.error('Failed to get exercise suggestions');
    }
    setExLoading(false);
  };

  const totalCalories = daily?.totalCalories || 0;
  const caloriePercentage = Math.min((totalCalories / goalCalories) * 100, 100);

  // SVG Ring chart
  const ringSize = 140;
  const strokeWidth = 12;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (caloriePercentage / 100) * circumference;

  return (
    <div className="fade-in">
      <div className="page-header">
        <p className="section-label">Feature 04</p>
        <h1 className="section-title">Daily Log</h1>
        <p className="section-subtitle">
          Log your meals, track calories with AI estimation, and get personalized exercise suggestions.
        </p>
      </div>

      <div className="daily-log-grid">
        {/* Left: Food Logger */}
        <div>
          <div className="food-logger-card fade-in fade-in-delay-1">
            <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Log Your Food</h3>

            <div className="input-group">
              <label>Food Name</label>
              <input className="input" placeholder="e.g., Butter Chicken, Salad, Burger..."
                value={foodName} onChange={e => setFoodName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLog()} />
            </div>

            <div className="input-group" style={{ marginTop: '12px' }}>
              <label>Quantity</label>
              <input className="input" placeholder="1 serving, 2 pieces, 1 bowl..."
                value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>

            {/* Food Type */}
            <div className="food-type-selector">
              <div className={`food-type-btn healthy ${foodType === 'healthy' ? 'selected' : ''}`}
                onClick={() => setFoodType('healthy')}>
                <span className="emoji">🥗</span>
                Healthy
              </div>
              <div className={`food-type-btn junk ${foodType === 'junk' ? 'selected' : ''}`}
                onClick={() => setFoodType('junk')}>
                <span className="emoji">🍔</span>
                Junk
              </div>
            </div>

            {/* Meal Time */}
            <div className="input-group">
              <label>Meal Time</label>
            </div>
            <div className="meal-time-selector">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(m => (
                <button key={m}
                  className={`meal-time-btn ${mealTime === m ? 'selected' : ''}`}
                  onClick={() => setMealTime(m)}>
                  {m === 'breakfast' ? '🌅' : m === 'lunch' ? '☀️' : m === 'dinner' ? '🌙' : '🍿'}
                  {' '}{m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            <button className="btn btn-primary btn-lg" onClick={handleLog}
              disabled={logging} style={{ width: '100%', marginTop: '16px' }}>
              {logging ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Estimating & Logging...
                </>
              ) : '🍽️ Log Food'}
            </button>
          </div>

          {/* Today's meals */}
          {daily && (
            <div className="card fade-in fade-in-delay-2" style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Today's Meals</h3>
              {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => {
                const items = daily.mealBreakdown?.[meal]?.items || [];
                if (items.length === 0) return null;
                return (
                  <div key={meal} className="meal-log-section">
                    <h3>
                      {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'dinner' ? '🌙' : '🍿'}
                      {' '}{meal.charAt(0).toUpperCase() + meal.slice(1)}
                      <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>
                        {daily.mealBreakdown[meal].calories} cal
                      </span>
                    </h3>
                    {items.map((item, idx) => (
                      <div key={idx} className="meal-log-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{item.type === 'junk' ? '🍔' : '🥗'}</span>
                          <span className="meal-log-item-name">{item.name}</span>
                        </div>
                        <span className="meal-log-item-cal">{item.calories} cal</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              {daily.logs?.length === 0 && (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <div className="empty-state-text">No meals logged today yet</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Calorie sidebar */}
        <div className="calorie-sidebar">
          {/* Calorie Ring */}
          <div className="calorie-ring-card fade-in fade-in-delay-1">
            <h4 style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Daily Calories
            </h4>
            <div className="calorie-ring">
              <svg width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={ringSize/2} cy={ringSize/2} r={radius}
                  fill="none" stroke="var(--color-border-light)" strokeWidth={strokeWidth} />
                <circle cx={ringSize/2} cy={ringSize/2} r={radius}
                  fill="none"
                  stroke={caloriePercentage > 90 ? 'var(--color-danger)' : caloriePercentage > 70 ? 'var(--color-warning)' : 'var(--color-primary)'}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1s var(--ease-out)' }} />
              </svg>
              <div className="calorie-ring-center">
                <div className="calorie-ring-value">{totalCalories}</div>
                <div className="calorie-ring-label">of {goalCalories}</div>
              </div>
            </div>
            <div className="progress-bar" style={{ marginTop: '8px' }}>
              <div className={`progress-fill ${caloriePercentage > 90 ? 'danger' : caloriePercentage > 70 ? 'warning' : ''}`}
                style={{ width: `${caloriePercentage}%` }}></div>
            </div>

            <div className="calorie-breakdown">
              <div className="calorie-macro">
                <div className="calorie-macro-value">{daily?.totalProtein || 0}g</div>
                <div className="calorie-macro-label">Protein</div>
              </div>
              <div className="calorie-macro">
                <div className="calorie-macro-value">{daily?.totalCarbs || 0}g</div>
                <div className="calorie-macro-label">Carbs</div>
              </div>
              <div className="calorie-macro">
                <div className="calorie-macro-value">{daily?.totalFat || 0}g</div>
                <div className="calorie-macro-label">Fat</div>
              </div>
            </div>
          </div>

          {/* Exercise section */}
          <div className="card fade-in fade-in-delay-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.95rem' }}>🏃 Daily Exercise</h4>
              <button className="btn btn-outline btn-sm" onClick={handleGetExercises} disabled={exLoading}>
                {exLoading ? 'Loading...' : exercises.length > 0 ? 'Refresh' : 'Get Plan'}
              </button>
            </div>

            {exercises.length > 0 ? (
              exercises.map((ex, idx) => (
                <div key={idx} className="exercise-card">
                  <div className="exercise-icon">{ex.emoji || '🏋️'}</div>
                  <div className="exercise-info">
                    <div className="exercise-name">{ex.name}</div>
                    <div className="exercise-detail">{ex.targetArea} • {ex.difficulty}</div>
                  </div>
                  <div className="exercise-duration">
                    <div className="exercise-duration-value">{ex.duration}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                <div className="empty-state-icon">💪</div>
                <div className="empty-state-text">Click "Get Plan" for AI exercise suggestions</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLog;
