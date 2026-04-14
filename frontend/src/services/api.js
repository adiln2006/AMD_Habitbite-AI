import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('habitbite_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const logoutUser = () => API.post('/auth/logout');
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Recipes
export const generateRecipes = (data) => API.post('/recipes/generate', data);
export const saveRecipe = (data) => API.post('/recipes/save', data);
export const getSavedRecipes = () => API.get('/recipes/saved');
export const deleteRecipe = (id) => API.delete(`/recipes/${id}`);
export const toggleFavorite = (id) => API.put(`/recipes/${id}/favorite`);

// Roadmap
export const generateRoadmap = (data) => API.post('/roadmap/generate', data);
export const getActiveRoadmap = () => API.get('/roadmap/active');
export const getAllRoadmaps = () => API.get('/roadmap/all');
export const updateRoadmapProgress = (id, data) => API.put(`/roadmap/${id}/progress`, data);
export const deleteRoadmap = (id) => API.delete(`/roadmap/${id}`);

// Habits
export const logFood = (data) => API.post('/habits/log', data);
export const getPatterns = (days) => API.get(`/habits/patterns?days=${days || 7}`);
export const getAlerts = () => API.get('/habits/alerts');
export const getInsights = (days) => API.get(`/habits/insights?days=${days || 7}`);
export const getHistory = (page) => API.get(`/habits/history?page=${page || 1}`);

// Calories
export const estimateCalories = (data) => API.post('/calories/estimate', data);
export const getDailyCalories = () => API.get('/calories/daily');
export const getWeeklyCalories = () => API.get('/calories/weekly');

// Exercise
export const suggestExercises = (data) => API.post('/exercise/suggest', data);
export const getDailyExercise = () => API.get('/exercise/daily');

export default API;
