const AvailableDate = require('../models/availableDate');

class AvailableDateService {
  async addAvailableDate(date, slots) {
    const availableDate = new AvailableDate({ date, availableSlots: slots });
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
