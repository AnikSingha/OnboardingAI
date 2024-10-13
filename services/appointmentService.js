const Appointment = require('../models/appointment');
const availableDateService = require('./availableDateService');

class AppointmentService {
  async createAppointment(appointmentData) {
    const availableDate = await availableDateService.decrementAvailableSlots(appointmentData.date);
    if (!availableDate) {
      throw new Error('No available slots for the selected date');
    }
    const appointment = new Appointment(appointmentData);
    return await appointment.save();
  }

  async getAppointments() {
    return await Appointment.find();
  }

  async getAppointmentById(id) {
    return await Appointment.findById(id);
  }

  async updateAppointment(id, appointmentData) {
    return await Appointment.findByIdAndUpdate(id, appointmentData, { new: true });
  }

  async deleteAppointment(id) {
    return await Appointment.findByIdAndDelete(id);
  }
}

module.exports = new AppointmentService();
