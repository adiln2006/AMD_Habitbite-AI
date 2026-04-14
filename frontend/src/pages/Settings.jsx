import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';

const goalLabels = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  maintain: 'Maintain Health',
  healthy_eating: 'Healthy Eating',
};

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
    dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
    preferredCuisine: user?.preferredCuisine || 'Indian',
    goal: user?.goal || 'healthy_eating',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        dailyCalorieGoal: Number(form.dailyCalorieGoal),
      });
      updateUser(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <p className="section-label">Account</p>
        <h1 className="section-title">Settings</h1>
        <p className="section-subtitle">Manage your profile, health goals, and preferences.</p>
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        {/* Profile */}
        <div className="settings-section card fade-in fade-in-delay-1">
          <h3>👤 Profile Information</h3>
          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="settings-name">Full Name</label>
            <input id="settings-name" name="name" className="input" value={form.name} onChange={handleChange} />
          </div>
          <div className="settings-row">
            <div className="input-group">
              <label htmlFor="settings-age">Age</label>
              <input id="settings-age" name="age" type="number" className="input" value={form.age} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label htmlFor="settings-weight">Weight (kg)</label>
              <input id="settings-weight" name="weight" type="number" className="input" value={form.weight} onChange={handleChange} />
            </div>
          </div>
          <div className="settings-row">
            <div className="input-group">
              <label htmlFor="settings-height">Height (cm)</label>
              <input id="settings-height" name="height" type="number" className="input" value={form.height} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label htmlFor="settings-email">Email</label>
              <input id="settings-email" className="input" value={user?.email || ''} disabled
                style={{ opacity: 0.6 }} />
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="settings-section card fade-in fade-in-delay-2">
          <h3>🎯 Health Goals</h3>
          <div className="settings-row">
            <div className="input-group">
              <label htmlFor="settings-calorie">Daily Calorie Goal</label>
              <input id="settings-calorie" name="dailyCalorieGoal" type="number" className="input"
                value={form.dailyCalorieGoal} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label htmlFor="settings-goal">Fitness Goal</label>
              <select id="settings-goal" name="goal" className="input" value={form.goal} onChange={handleChange}>
                {Object.entries(goalLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="settings-cuisine">Preferred Cuisine</label>
            <select id="settings-cuisine" name="preferredCuisine" className="input"
              value={form.preferredCuisine} onChange={handleChange}>
              {['Indian', 'Italian', 'Mediterranean', 'Japanese', 'Thai', 'Mexican', 'American', 'Mixed'].map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}
          style={{ marginTop: '8px' }}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
