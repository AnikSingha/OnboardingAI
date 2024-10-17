import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './routes/LandingPage.js';
import BusinessSetup from './miscBusinessSetup.js';
import AIPrompts from './misc/AIPrompts.js';
import SignUpPage from './routes/SignUpPage.js'; 
import LoginPage from './components/LoginPage';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={<BusinessSetup />} />
        <Route path="/ai-prompts" element={<AIPrompts />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />

      </Routes>
    </Router>
  );
}

export default App;