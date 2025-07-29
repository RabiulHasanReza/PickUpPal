import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LogInPage';
import SignupPage from './pages/SingUpPage';
import DashboardPage from './pages/DashBoardPage';
import DriverDashboardPage from './pages/DriverDashBoardPage';
import NotFoundPage from './pages/NotFoundPage';
import DriverSignUpPage from './pages/DriverSignUp';
import RidePage from './pages/RidePage';
import RideHistoryPage from "./pages/RideHistoryPage";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import SettingsPage from "./pages/SettingsPage";
import DriverRideHistoryPage from "./pages/DriverRideHistoryPage";
import DriverEarningsPage from "./pages/DriverEarningsPage";
import DriverSettingsPage from "./pages/DriverSettingsPage";
import HelpPage from './pages/HelpPage';
import DriverRidePage from './pages/DriverRidePage';
import AboutUsPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/driverdashboard" element={<DriverDashboardPage />} />
        <Route path="/driversignup" element={<DriverSignUpPage />} />
        <Route path="/ride" element={<RidePage />} />
        <Route path="/driver-ride" element={<DriverRidePage/>} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/rider/history" element={<RideHistoryPage />} />
        <Route path="/rider/payments" element={<PaymentMethodsPage />} />
        <Route path="/rider/settings" element={<SettingsPage />} />
        <Route path="/driver/history" element={<DriverRideHistoryPage />} />
        <Route path="/driver/earnings" element={<DriverEarningsPage />} />
        <Route path="/driver/settings" element={<DriverSettingsPage />} />
        <Route path="/help" element={<HelpPage/>} />
        <Route path="/admin" element={<AdminPage/>} />
      </Routes>
    </Router>
  );
}

export default App;