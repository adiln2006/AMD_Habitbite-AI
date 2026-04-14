import Roadmap from '../models/Roadmap.js';
import { generateRoadmap as aiGenerateRoadmap } from '../services/geminiService.js';

// POST /api/roadmap/generate
export const generateRoadmap = async (req, res) => {
  try {
    const { goal, cuisine, duration } = req.body;

    if (!goal || !cuisine || !duration) {
      return res.status(400).json({ message: 'Please provide goal, cuisine, and duration' });
    }

    // Deactivate any existing active roadmaps
    await Roadmap.updateMany({ userId: req.user._id, isActive: true }, { isActive: false });

    const plan = await aiGenerateRoadmap(goal, cuisine, duration);

    const roadmap = await Roadmap.create({
      userId: req.user._id,
      goal,
      cuisine,
      duration,
      plan,
    });

    res.status(201).json(roadmap);
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ message: 'Failed to generate roadmap. Please try again.' });
  }
};

// GET /api/roadmap/active
export const getActiveRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id, isActive: true });
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/roadmap/all
export const getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/roadmap/:id/progress
export const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { progress },
      { new: true }
    );
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/roadmap/:id
export const deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.json({ message: 'Roadmap deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
