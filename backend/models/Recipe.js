import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  ingredients: [{ type: String }],
  steps: [{ type: String }],
  cuisine: { type: String, default: 'General' },
  prepTime: { type: String, default: '15 min' },
  calories: { type: Number, default: 0 },
  healthTip: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false },
  generatedBy: { type: String, default: 'ai' },
}, { timestamps: true });

recipeSchema.index({ userId: 1, createdAt: -1 });

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;
