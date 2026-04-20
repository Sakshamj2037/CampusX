const mongoose = require('mongoose');

const FeatureUsageSchema = new mongoose.Schema({
  featureName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: String }
});

module.exports = mongoose.model('FeatureUsage', FeatureUsageSchema);
