const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cycle = require('../models/Cycle');

// Get all cycles for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const cycles = await Cycle.find({ user: req.userId }).sort({ startDate: -1 });
    res.json({ cycles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new cycle
router.post('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ error: 'startDate and endDate required' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) return res.status(400).json({ error: 'Invalid dates' });
    if (end < start) return res.status(400).json({ error: 'endDate must be >= startDate' });

    // compute period duration in days (inclusive)
    const msPerDay = 24 * 60 * 60 * 1000;
    const durationDays = Math.round((end - start) / msPerDay) + 1;

    // find previous cycle (most recent start before this one)
    const previous = await Cycle.findOne({ user: req.userId, startDate: { $lt: start } }).sort({ startDate: -1 });

    let gapDays = null;
    if (previous) {
      gapDays = Math.round((start - previous.startDate) / msPerDay);
    }

    const cycle = await Cycle.create({
      user: req.userId,
      startDate: start,
      endDate: end,
      periodDurationDays: durationDays,
      gapSincePrevStartDays: gapDays
    });

    res.json({ cycle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a specific cycle by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Cycle.findOneAndDelete({ _id: id, user: req.userId });
    if (!deleted) return res.status(404).json({ error: 'Cycle not found' });
    res.json({ success: true, message: 'Cycle deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit a specific cycle (update start/end date)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Missing dates' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return res.status(400).json({ error: 'End date must be >= start date' });

    const msPerDay = 24 * 60 * 60 * 1000;
    const durationDays = Math.round((end - start) / msPerDay) + 1;

    const updated = await Cycle.findOneAndUpdate(
      { _id: id, user: req.userId },
      { startDate: start, endDate: end, periodDurationDays: durationDays },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Cycle not found' });
    res.json({ cycle: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
