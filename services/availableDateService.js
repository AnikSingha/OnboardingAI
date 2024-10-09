const AvailableDate = require('../models/availableDate');

class AvailableDateService {
  async addAvailableDate(date, slots) {
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const availableDate = new AvailableDate({ date: utcDate, availableSlots: slots });
    return await availableDate.save();
  }

  async getAvailableDates() {
    return await AvailableDate.find({ availableSlots: { $gt: 0 } }).sort('date');
  }

  async decrementAvailableSlots(date) {
    return await AvailableDate.findOneAndUpdate(
      { date, availableSlots: { $gt: 0 } },
      { $inc: { availableSlots: -1 } },
      { new: true }
    );
  }
}

module.exports = new AvailableDateService();
