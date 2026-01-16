import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './features/auth/AuthPage';
import SplashScreen from './components/SplashScreen';
import Layout from './components/layout/Layout';
import Dashboard from './features/dashboard/Dashboard';
import SchedulePage from './features/schedule/SchedulePage';
import StudentAttendancePage from './features/attendance/StudentAttendancePage';
import MarkAttendancePage from './features/attendance/MarkAttendancePage';
import PostNoticesPage from './features/notices/PostNoticesPage';
import ReportsPage from './features/reports/ReportsPage';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import ProfilePage from './features/profile/ProfilePage';
import FaceRecognitionDemo from './pages/FaceRecognitionDemo';
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
          <Route path="/demo" element={<FaceRecognitionDemo />} />

          {/* Dashboard Routes nested under 'Layout' */}
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="attendance" element={<StudentAttendancePage />} />
            <Route path="mark-attendance" element={<MarkAttendancePage />} />
            <Route path="notices" element={<PostNoticesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="face-demo" element={<FaceRecognitionDemo />} />
          </Route>

        </Routes>
      </Router>
    </>
  );
}

export default App;
