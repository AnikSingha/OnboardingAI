import React from "react";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css';
import Homepage from "./pages/Homepage";
import Schedule from './pages/schedule';
import Dashboard from "./pages/dashboard";
import CallingHistory from "./pages/callinghistory";
import Account from "./pages/account";
import About from "./pages/about";

export default function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Homepage />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/callinghistory" element={<CallingHistory />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  )
}
