import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import LandingPage from './routes/LandingPage';
import BusinessSetup from './misc/BusinessSetup';
import AIPrompts from './misc/AIPrompts';
import SignUpPage from './routes/SignUpPage'; 
import LoginPage from './routes/LoginPage';
import ForgotPassword from './routes/ForgotPassword';
import ResetPassword from './routes/ResetPassword';
import Schedule from './routes/SchedulePage';
import Dashboard from "./routes/Dashboard";
import ContactsPage from "./routes/ContactsPage";
import CampaignsPage from "./routes/CampaignsPage";
import NewCampaign from "./routes/NewCampaign";
import CampaignDetails from "./routes/CampaignDetails";
import SettingsPage from "./routes/SettingsPage";
import EmployeePage from "./routes/EmployeePage";
import { AuthProvider } from './AuthContext.js';


function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/setup" element={<BusinessSetup />} />
          <Route path="/ai-prompts" element={<AIPrompts />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/new" element={<NewCampaign />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
