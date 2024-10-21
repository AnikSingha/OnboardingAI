import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from './routes/LandingPage.js';
import BusinessSetup from './misc/BusinessSetup.js';
import AIPrompts from './misc/AIPrompts.js';
import SignUpPage from './routes/SignUpPage.js'; 
import LoginPage from './routes/LoginPage';
import ForgotPassword from './routes/ForgotPassword.js';
import ResetPassword from './routes/ResetPassword.js';
import Schedule from './routes/schedule';
import Dashboard from "./routes/dashboard";
import CallingHistory from "./routes/callinghistory";
import Account from "./routes/account";
import About from "./routes/about";

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
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/callinghistory" element={<CallingHistory />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;