import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  age: { type: Number, default: null },
  weight: { type: Number, default: null }, // in kg
  height: { type: Number, default: null }, // in cm
  dailyCalorieGoal: { type: Number, default: 2000 },
  preferredCuisine: { type: String, default: 'Indian' },
  goal: { type: String, enum: ['weight_loss', 'muscle_gain', 'maintain', 'healthy_eating'], default: 'healthy_eating' },
  avatar: { type: String, default: '' },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
