import mongoose from 'mongoose';

const foodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodName: { type: String, required: true, trim: true },
  foodType: { type: String, enum: ['healthy', 'junk'], required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  mealTime: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  loggedAt: { type: Date, default: Date.now },
  quantity: { type: String, default: '1 serving' },
}, { timestamps: true });

// Index for efficient habit pattern queries
foodLogSchema.index({ userId: 1, loggedAt: -1 });
foodLogSchema.index({ userId: 1, foodType: 1, loggedAt: -1 });

const FoodLog = mongoose.model('FoodLog', foodLogSchema);
export default FoodLog;
