const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerName: String,
  email: String,
  phone: String,
  date: Date,
  time: String,
  service: String,
  notes: String
});

module.exports = mongoose.model('Appointment', appointmentSchema);
