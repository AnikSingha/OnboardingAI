import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './routes/LandingPage.js';
import BusinessSetup from './BusinessSetup.js';
import AIPrompts from './AIPrompts.js';
import SignUpPage from './routes/SignUpPage.js'; 



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={<BusinessSetup />} />
        <Route path="/ai-prompts" element={<AIPrompts />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;