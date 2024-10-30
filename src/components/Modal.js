import React, { useState } from 'react';
import campaigns from '../routes/campaigns.json'; // Ensure the path is correct

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [contact, setContact] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('10'); // Default hour
  const [minute, setMinute] = useState('00'); // Default minute
  const [ampm, setAmpm] = useState('AM'); // Default AM/PM
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || ''); // Default to first campaign if available

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedTime = `${hour}:${minute} ${ampm}`;
    onSubmit({ contact, date, time: formattedTime, campaignId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Schedule a New Call</h2>
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
            <label className="block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded p-2 w-full"
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
          <div className="mb-4">
            <label className="block mb-1">Campaign</label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="border rounded p-2 w-full"
              required
            >
              {campaigns.map((campaign) => (  // Changed to singular for clarity
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 rounded px-4 py-2">Cancel</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2" style={{marginLeft:10}}>Add Call</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;

