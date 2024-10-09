const mongoose = require('mongoose');

const availableDateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  availableSlots: {
    type: Number,
    required: true,
    min: 0
  }
});

module.exports = mongoose.model('AvailableDate', availableDateSchema);
