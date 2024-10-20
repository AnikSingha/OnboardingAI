import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './routes/LandingPage.js';
import BusinessSetup from './misc/BusinessSetup.js';
import AIPrompts from './misc/AIPrompts.js';
import SignUpPage from './routes/SignUpPage.js'; 
import LoginPage from './routes/LoginPage';
import ForgotPassword from './routes/ForgotPassword.js';
import ResetPassword from './routes/ResetPassword.js';

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
        <Route path="forgot-password" element={<ForgotPassword/>} />
        <Route path="reset-password" element={<ResetPassword/>} />

      </Routes>
    </Router>
  );
}

export default App;