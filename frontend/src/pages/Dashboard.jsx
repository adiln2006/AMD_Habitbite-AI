import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDailyCalories, getInsights } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HiOutlineBookOpen, HiOutlinePencilAlt, HiOutlineMap, HiOutlineLightBulb, HiOutlineLightningBolt } from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();
  const [calories, setCalories] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [calRes, insRes] = await Promise.all([
          getDailyCalories().catch(() => ({ data: null })),
          getInsights(7).catch(() => ({ data: null })),
        ]);
        setCalories(calRes.data);
        setInsights(insRes.data);
      } catch (e) { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const todayCalories = calories?.totalCalories || 0;
  const goalCalories = calories?.goalCalories || user?.dailyCalorieGoal || 2000;
  const compliance = insights?.compliance || 0;
  const chartData = insights?.hourlyDistribution?.filter(h => h.total > 0) || [];

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <p className="section-label">Protocol 04</p>
        <h1 className="section-title">Activity & Insights</h1>
        <p className="section-subtitle">
          Your metabolic baseline is shifting. Synchronize your physical movement with your predicted hunger windows.
        </p>
      </div>

      {/* Welcome banner */}
      <div className="dashboard-welcome fade-in fade-in-delay-1">
        <h2>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</h2>
        <p>Track your nutrition, build healthy habits, and let AI optimize your diet.</p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card fade-in fade-in-delay-1">
          <div className="stat-card-icon primary">🔥</div>
          <div className="stat-card-value">{todayCalories}</div>
          <div className="stat-card-label">Calories Today</div>
        </div>
        <div className="stat-card fade-in fade-in-delay-2">
          <div className="stat-card-icon success">🥗</div>
          <div className="stat-card-value">{insights?.healthyCount || 0}</div>
          <div className="stat-card-label">Healthy Meals</div>
        </div>
        <div className="stat-card fade-in fade-in-delay-3">
          <div className="stat-card-icon warning">🍔</div>
          <div className="stat-card-value">{insights?.junkCount || 0}</div>
          <div className="stat-card-label">Junk Meals</div>
        </div>
        <div className="stat-card fade-in fade-in-delay-4">
          <div className="stat-card-icon danger">🔔</div>
          <div className="stat-card-value">{insights?.alerts?.length || 0}</div>
          <div className="stat-card-label">Active Alerts</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/daily-log" className="quick-action-btn">
          <span className="icon">📝</span>
          Log Food
        </Link>
        <Link to="/recipes" className="quick-action-btn">
          <span className="icon">🍳</span>
          Generate Recipe
        </Link>
        <Link to="/roadmap" className="quick-action-btn">
          <span className="icon">🗺️</span>
          View Roadmap
        </Link>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left: Exercise regimen + Compliance */}
        <div>
          {/* Compliance card */}
          <div className="dashboard-compliance fade-in fade-in-delay-2">
            <div className="compliance-label">Total Compliance</div>
            <div className="compliance-value">{compliance}%</div>
            <div className="compliance-sub">of weekly goal met</div>
          </div>

          {/* Intervention cards */}
          <div className="intervention-grid" style={{ marginTop: '16px' }}>
            <div className="intervention-card fade-in fade-in-delay-3">
              <div className="intervention-card-icon">🍴</div>
              <h4>Nutrient Density</h4>
              <p>Average snack intake contains <span className="intervention-highlight">{insights?.junkCount ? Math.round((insights.junkCount / Math.max(insights.totalLogs, 1)) * 100) : 0}%</span> junk food items this week.</p>
            </div>
            <div className="intervention-card fade-in fade-in-delay-4">
              <div className="intervention-card-icon">💡</div>
              <h4>AI Intervention</h4>
              <p>{insights?.alerts?.[0]?.message || 'Keep eating healthy! No junk patterns detected yet.'}</p>
            </div>
          </div>
        </div>

        {/* Right: Habit insights chart */}
        <div className="insight-chart-container fade-in fade-in-delay-2">
          <div className="insight-chart-title">Snack Timing Pattern</div>
          <div className="insight-chart-subtitle">Food intake distribution by time of day</div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={2}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A8A8A' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E8E2DA', borderRadius: '8px', fontSize: '13px' }}
                  formatter={(value, name) => [value, name === 'junk' ? '🍔 Junk' : '🥗 Healthy']}
                />
                <Bar dataKey="healthy" stackId="a" fill="#43A047" radius={[2, 2, 0, 0]} />
                <Bar dataKey="junk" stackId="a" fill="#E53935" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">Log food to see your eating patterns here</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
