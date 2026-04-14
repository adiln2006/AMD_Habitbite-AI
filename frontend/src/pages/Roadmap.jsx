import { useState, useEffect } from 'react';
import { generateRoadmap as apiGenerateRoadmap, getActiveRoadmap } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

const goals = [
  { id: 'weight_loss', label: 'Weight Loss', emoji: '⚖️' },
  { id: 'muscle_gain', label: 'Muscle Gain', emoji: '💪' },
  { id: 'maintain', label: 'Maintain Health', emoji: '❤️' },
  { id: 'healthy_eating', label: 'Healthy Eating', emoji: '🥗' },
];

const cuisineOptions = ['Indian', 'Italian', 'Mediterranean', 'Japanese', 'Thai', 'Mexican', 'American', 'Mixed'];

const Roadmap = () => {
  const [goal, setGoal] = useState('weight_loss');
  const [cuisine, setCuisine] = useState('Indian');
  const [duration, setDuration] = useState(1);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [fetchingActive, setFetchingActive] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const { data } = await getActiveRoadmap();
        if (data) setRoadmap(data);
      } catch (e) { /* ignore */ }
      setFetchingActive(false);
    };
    fetchActive();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data } = await apiGenerateRoadmap({ goal, cuisine, duration });
      setRoadmap(data);
      toast.success('Roadmap generated!');
    } catch (err) {
      toast.error('Failed to generate roadmap');
    }
    setLoading(false);
  };

  const toggleWeek = (idx) => {
    setExpandedWeeks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const plan = roadmap?.plan;
  const weeks = plan?.weeks || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <p className="section-label">Feature 02</p>
        <h1 className="section-title">Diet Roadmap AI</h1>
        <p className="section-subtitle">
          Generate a personalized diet and exercise plan for 1, 3, or 6 months powered by AI.
        </p>
      </div>

      {/* Config */}
      {!roadmap && (
        <div className="card fade-in fade-in-delay-1" style={{ marginBottom: '32px' }}>
          <div className="roadmap-config">
            {/* Goal */}
            <div className="config-section">
              <h3>🎯 Select Your Goal</h3>
              <div className="goal-options">
                {goals.map(g => (
                  <div key={g.id} className={`goal-option ${goal === g.id ? 'selected' : ''}`}
                    onClick={() => setGoal(g.id)}>
                    <span style={{ fontSize: '1.2rem' }}>{g.emoji}</span>
                    {g.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Cuisine */}
            <div className="config-section">
              <h3>🍽️ Cuisine Preference</h3>
              <select className="input" value={cuisine} onChange={e => setCuisine(e.target.value)}>
                {cuisineOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Duration */}
            <div className="config-section">
              <h3>📅 Duration</h3>
              <div className="duration-options">
                {[1, 3, 6].map(d => (
                  <div key={d} className={`duration-btn ${duration === d ? 'selected' : ''}`}
                    onClick={() => setDuration(d)}>
                    <span className="number">{d}</span>
                    <span className="label">{d === 1 ? 'Month' : 'Months'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={loading}
            style={{ marginTop: '16px' }}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                Generating Roadmap...
              </>
            ) : '🧠 Generate Roadmap'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loader" style={{ marginTop: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--color-text-muted)' }}>AI is designing your personalized roadmap...</p>
          </div>
        </div>
      )}

      {/* Roadmap display */}
      {roadmap && !loading && (
        <div className="fade-in">
          {/* Summary */}
          <div className="card" style={{ marginBottom: '24px', background: 'var(--color-primary-pale)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="section-label">Active Plan</p>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>
                  {goals.find(g => g.id === roadmap.goal)?.emoji} {goals.find(g => g.id === roadmap.goal)?.label} — {roadmap.duration} Month{roadmap.duration > 1 ? 's' : ''}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  {plan?.summary || `${roadmap.cuisine} cuisine • ${weeks.length} weeks planned`}
                </p>
                {plan?.dailyCalorieTarget && (
                  <p style={{ marginTop: '8px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    Daily Target: {plan.dailyCalorieTarget} calories
                  </p>
                )}
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setRoadmap(null)}>
                New Plan
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="roadmap-timeline">
            {weeks.map((week, idx) => (
              <div key={idx} className={`week-card fade-in fade-in-delay-${Math.min(idx + 1, 4)}`}>
                <div className="week-card-header" onClick={() => toggleWeek(idx)}>
                  <h3>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '3px 10px' }}>
                      Week {week.week || idx + 1}
                    </span>
                    {week.theme || `Week ${idx + 1} Plan`}
                  </h3>
                  {expandedWeeks[idx] ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                </div>

                {(expandedWeeks[idx] || idx === 0) && (
                  <div className="week-card-body">
                    {/* Meals */}
                    <div className="meal-grid">
                      {week.meals && Object.entries(week.meals).map(([meal, description]) => (
                        <div key={meal} className="meal-item">
                          <div className="meal-item-label">{meal}</div>
                          <div className="meal-item-value">{description}</div>
                        </div>
                      ))}
                    </div>

                    {/* Exercise */}
                    {week.exercise && (
                      <div className="week-exercise">
                        <div className="week-exercise-title">
                          🏃 {typeof week.exercise === 'string' ? week.exercise : week.exercise.name}
                        </div>
                        {typeof week.exercise === 'object' && (
                          <>
                            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                              Duration: {week.exercise.duration}
                            </p>
                            {week.exercise.steps && (
                              <ul style={{ paddingLeft: '16px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                                {week.exercise.steps.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Tip */}
                    {week.tip && (
                      <div className="week-tip">
                        💡 <span>{week.tip}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
