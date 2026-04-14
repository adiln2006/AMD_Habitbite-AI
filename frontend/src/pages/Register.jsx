import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', weight: '', height: '' });
  const { register, loading, user } = useAuth();
  const navigate = useNavigate();

  if (user) { navigate('/dashboard', { replace: true }); return null; }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
      });
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-brand">
            <h1>HabitBite AI</h1>
            <p>Begin Your Journey</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" className="input" placeholder="John Doe"
                value={form.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="reg-email">Email Address</label>
              <input id="reg-email" name="email" type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" className="input" placeholder="Min 6 characters"
                value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label htmlFor="age">Age</label>
                <input id="age" name="age" type="number" className="input" placeholder="25"
                  value={form.age} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input id="weight" name="weight" type="number" className="input" placeholder="70"
                  value={form.weight} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="height">Height (cm)</label>
                <input id="height" name="height" type="number" className="input" placeholder="170"
                  value={form.height} onChange={handleChange} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
