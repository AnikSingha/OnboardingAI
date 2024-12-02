import React, { useState } from 'react';

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [contact, setContact] = useState('');
  const [number, setNumber] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
  
    try {
      // Convert 12-hour format to 24-hour format
      let hours = parseInt(hour);
      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
  
      // Format hours and minutes properly with leading zeros
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minute.toString().padStart(2, '0');
  
      // Create date string in ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
      const dateObj = new Date(`${date}T${formattedHours}:${formattedMinutes}:00`);
  
      // Validate the date
      if (isNaN(dateObj)) {
        throw new Error('Invalid date or time');
      }
  
      // Convert to ISO string
      const isoDate = dateObj.toISOString();
  
      console.log('Submitting schedule:', {
        name: contact,
        number: number,
        date: isoDate,
        originalValues: { date, hour, minute, ampm }
      });
  
      onSubmit({ 
        name: contact, 
        number: number, 
        date: isoDate 
      });
      onClose();
  
    } catch (error) {
      console.error('Date creation error:', error);
      alert('Please enter a valid date and time');
    }
  };

  const isFormValid = contact && number && date && hour && minute && ampm;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">

        <h2 className="text-xl font-bold mb-4 text-center">Schedule A New Call</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Contact</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Number</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="border rounded p-2 w-full"
              required
              pattern="^[0-9]{10}$"
              title="Phone number should be 10 digits"
            />
          </div>

          <div class = "flex justify-between">
            <div className="mb-4">
              <label className="block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}  // Add this line to prevent past dates
                className="border rounded p-2 w-[120%]"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Time</label>
              <div className="flex">
                <select value={hour} onChange={(e) => setHour(e.target.value)} className="border rounded p-2 mr-2">
                  {[...Array(12).keys()].map(i => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <select value={minute} onChange={(e) => setMinute(e.target.value)} className="border rounded p-2 mr-2">
                  {[0, 15, 30, 45].map(i => (
                    <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <select value={ampm} onChange={(e) => setAmpm(e.target.value)} className="border rounded p-2">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={handleClose} className="bg-gray-300 hover:bg-gray-400 rounded px-4 py-2">Cancel</button>
            <button type="submit" className={`bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 ${isFormValid ? '' : 'opacity-50 cursor-not-allowed'}`} disabled={!isFormValid}>
              Add Call
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;



