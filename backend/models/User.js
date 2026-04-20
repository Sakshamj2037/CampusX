const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  joinedEvents: [{ type: String }],
  techStack: [{ type: String }],
  role: { type: String, default: '' },
  availability: { type: String, default: 'looking' },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
