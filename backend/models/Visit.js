const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  device: { type: String, default: 'Desktop' }
});

module.exports = mongoose.model('Visit', VisitSchema);
