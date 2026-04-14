import { useState, useEffect } from 'react';
import { getInsights } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Insights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const days = period === 'weekly' ? 7 : 1;
        const { data: res } = await getInsights(days);
        setData(res);
      } catch (e) { /* ignore */ }
      setLoading(false);
    };
    fetchInsights();
  }, [period]);

  const chartData = data?.hourlyDistribution?.filter(h => h.total > 0) || [];
  const peakHour = chartData.length > 0
    ? chartData.reduce((max, h) => h.junk > max.junk ? h : max, chartData[0])
    : null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <p className="section-label">Feature 03</p>
        <h1 className="section-title">Smart Habit Insights</h1>
        <p className="section-subtitle">
          AI analyzes your eating patterns and detects junk food habits to send you pre-notifications.
        </p>
      </div>

      {/* Toggle */}
      <div className="insights-header-row">
        <div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Habit Insights</span>
        </div>
        <div className="toggle-group">
          <button className={`toggle-btn ${period === 'weekly' ? 'active' : ''}`}
            onClick={() => setPeriod('weekly')}>Weekly</button>
          <button className={`toggle-btn ${period === 'daily' ? 'active' : ''}`}
            onClick={() => setPeriod('daily')}>Daily Detail</button>
        </div>
      </div>

      <div className="insights-grid">
        {/* Left: Alerts */}
        <div>
          {/* Compliance */}
          <div className="dashboard-compliance fade-in fade-in-delay-1" style={{ marginBottom: '16px' }}>
            <div className="compliance-label">Total Compliance</div>
            <div className="compliance-value">{data?.compliance || 0}%</div>
            <div className="compliance-sub">of weekly goal met</div>
          </div>

          {/* Alerts list */}
          <div className="alert-list fade-in fade-in-delay-2">
            {data?.alerts?.length > 0 ? (
              data.alerts.map((alert, idx) => (
                <div key={idx} className={`alert-card ${alert.severity}`}>
                  <div className="alert-card-icon">🔔</div>
                  <div className="alert-card-content">
                    <h4>Pattern Detected at {alert.time}</h4>
                    <p>{alert.message}</p>
                    {alert.alternative && (
                      <p style={{ marginTop: '6px', color: 'var(--color-success)', fontWeight: 600 }}>
                        {alert.alternative.emoji} Try: {alert.alternative.alternative} ({alert.alternative.calories} cal)
                      </p>
                    )}
                  </div>
                  <span className="badge badge-danger" style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                    {alert.confidence}%
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="empty-state-icon">🎉</div>
                <div className="empty-state-title">No Junk Patterns Detected</div>
                <div className="empty-state-text">
                  Keep logging your food daily. AI will detect patterns after 3+ days of repeated behavior.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chart */}
        <div className="insight-chart-container fade-in fade-in-delay-2">
          <div className="insight-chart-title">Snack Timing Pattern</div>
          <div className="insight-chart-subtitle">
            {peakHour ? `Sugar & Processed Lipid peaks detected at ${peakHour.label}` : 'Food intake distribution by time'}
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} barGap={2}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A8A8A' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E8E2DA', borderRadius: '8px', fontSize: '13px' }}
                  formatter={(value, name) => [value, name === 'junk' ? '🍔 Junk' : '🥗 Healthy']}
                />
                <Bar dataKey="healthy" stackId="a" fill="#43A047" radius={[2, 2, 0, 0]} />
                <Bar dataKey="junk" stackId="a" fill="#E53935" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={index}
                      fill={peakHour && entry.hour === peakHour.hour ? '#B71C1C' : '#E53935'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">Log food entries to see your eating pattern analysis</div>
            </div>
          )}

          {peakHour && (
            <div style={{
              background: 'var(--color-danger-pale)',
              color: 'var(--color-danger)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textAlign: 'center',
              marginTop: '12px'
            }}>
              ⚠️ PEAK RISK at {peakHour.label} — {peakHour.junk} junk food entries
            </div>
          )}
        </div>
      </div>

      {/* Intervention Cards */}
      <div className="intervention-grid" style={{ marginTop: '24px' }}>
        <div className="intervention-card fade-in fade-in-delay-3">
          <div className="intervention-card-icon">🍴</div>
          <h4>Nutrient Density</h4>
          <p>
            Average snack intake contains <span className="intervention-highlight">
              {data?.junkCount ? Math.round((data.junkCount / Math.max(data.totalLogs, 1)) * 100) : 0}%
            </span> ultra-processed ingredients during peak windows.
          </p>
        </div>
        <div className="intervention-card fade-in fade-in-delay-4">
          <div className="intervention-card-icon">💡</div>
          <h4>AI Intervention</h4>
          <p>
            {data?.alerts?.[0] ? (
              <>Replace {peakHour?.label || 'peak time'} snack with 10 mins of <span className="intervention-highlight">Active Stretching</span> to reset cortisol levels.</>
            ) : (
              'Great job! Keep maintaining your healthy eating habits.'
            )}
          </p>
        </div>
      </div>

      {/* Recent logs */}
      {data?.recentLogs?.length > 0 && (
        <div className="card fade-in fade-in-delay-4" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Recent Food Log</h3>
          {data.recentLogs.map((log, idx) => (
            <div key={idx} className="meal-log-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{log.foodType === 'junk' ? '🍔' : '🥗'}</span>
                <div>
                  <div className="meal-log-item-name">{log.foodName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {new Date(log.loggedAt).toLocaleString('en', { dateStyle: 'short', timeStyle: 'short' })}
                    {' · '}{log.mealTime}
                  </div>
                </div>
              </div>
              <div className="meal-log-item-cal">{log.calories || '—'} cal</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Insights;
