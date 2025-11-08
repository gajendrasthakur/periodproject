const mongoose = require('mongoose');

const CycleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  periodDurationDays: { type: Number },  // end - start + 1 (optional)
  gapSincePrevStartDays: { type: Number } // difference between this start and previous start
}, { timestamps: true });

module.exports = mongoose.model('Cycle', CycleSchema);
