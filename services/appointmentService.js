const Appointment = require('../models/appointment');

class AppointmentService {
  async createAppointment(appointmentData) {
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
