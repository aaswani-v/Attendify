import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import SplashScreen from './components/SplashScreen';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SchedulePage from './pages/SchedulePage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import MarkAttendancePage from './pages/MarkAttendancePage';
import RegisterPage from './pages/RegisterPage';
import PostNoticesPage from './pages/PostNoticesPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ProfilePage from './pages/ProfilePage';
import StudentsPage from './pages/StudentsPage';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <SplashScreen onFinish={() => setLoading(false)} />}
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />

          {/* Dashboard Routes nested under 'Layout' */}
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="attendance" element={<StudentAttendancePage />} />
            <Route path="mark-attendance" element={<MarkAttendancePage />} />
            <Route path="register-student" element={<RegisterPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="notices" element={<PostNoticesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

        </Routes>
      </Router>
    </>
  );
}

export default App;
