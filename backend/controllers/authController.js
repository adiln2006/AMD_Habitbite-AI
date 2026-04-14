import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, age, weight, height } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, age, weight, height });
    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dailyCalorieGoal: user.dailyCalorieGoal,
      preferredCuisine: user.preferredCuisine,
      goal: user.goal,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dailyCalorieGoal: user.dailyCalorieGoal,
      preferredCuisine: user.preferredCuisine,
      goal: user.goal,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, age, weight, height, dailyCalorieGoal, preferredCuisine, goal } = req.body;

    if (name) user.name = name;
    if (age) user.age = age;
    if (weight) user.weight = weight;
    if (height) user.height = height;
    if (dailyCalorieGoal) user.dailyCalorieGoal = dailyCalorieGoal;
    if (preferredCuisine) user.preferredCuisine = preferredCuisine;
    if (goal) user.goal = goal;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      age: updatedUser.age,
      weight: updatedUser.weight,
      height: updatedUser.height,
      dailyCalorieGoal: updatedUser.dailyCalorieGoal,
      preferredCuisine: updatedUser.preferredCuisine,
      goal: updatedUser.goal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/logout
export const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out successfully' });
};
