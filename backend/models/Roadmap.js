import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String, required: true },
  cuisine: { type: String, required: true },
  duration: { type: Number, enum: [1, 3, 6], required: true }, // months
  plan: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON from Gemini
  isActive: { type: Boolean, default: true },
  calendarSynced: { type: Boolean, default: false },
  progress: { type: Number, default: 0 }, // percentage
}, { timestamps: true });

roadmapSchema.index({ userId: 1, isActive: 1 });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
