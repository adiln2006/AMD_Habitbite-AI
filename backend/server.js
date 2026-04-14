import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import calorieRoutes from './routes/calorieRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/calories', calorieRoutes);
app.use('/api/exercise', exerciseRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Static Frontend for Cloud Run Single Container Deployment
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HabitBite AI Server is running 🚀' });
  });
}

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 HabitBite AI Server running on port ${PORT}`);
  });
});
