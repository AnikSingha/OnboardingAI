import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AIPrompts = () => {
  const [user, setUser] = useState(null);
  const [promptResponse, setPromptResponse] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/');
    } else {
      setUser(storedUser);
      setPromptResponse(storedUser.promptResponses || []);
    }
  }, [navigate]);

  const handleSubmitPrompt = (e) => {
    e.preventDefault();
    if (newPrompt.trim() === '') return;

    
    const aiResponse = `AI response to: "${newPrompt}"`;

    const updatedPromptResponses = [
      ...promptResponse,
      { prompt: newPrompt, response: aiResponse }
    ];

    setPromptResponse(updatedPromptResponses);
    setNewPrompt('');

    const updatedUser = { ...user, promptResponses: updatedPromptResponses };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI Interaction</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Submit a New Prompt</h2>
          <form onSubmit={handleSubmitPrompt} className="space-y-4">
            <textarea
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
              rows="4"
              placeholder="Enter your prompt here..."
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Submit Prompt
            </button>
          </form>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Prompt History</h2>
          {promptResponse.length === 0 ? (
            <p className="text-gray-500">No prompts submitted yet.</p>
          ) : (
            <ul className="space-y-4">
              {promptResponse.map((item, index) => (
                <li key={index} className="border-b pb-4">
                  <p className="font-semibold">Prompt: {item.prompt}</p>
                  <p className="mt-2">Response: {item.response}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPrompts;