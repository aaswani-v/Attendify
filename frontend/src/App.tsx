/**
 * Main App Component
 * Unified Enterprise System - Attendance + Timetable
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { TimetableGrid } from './pages/TimetableGrid';
import { ResourceManagement } from './pages/ResourceManagement';
import { AttendanceKiosk } from './pages/AttendanceKiosk';
import { AttendanceLogs } from './pages/AttendanceLogs';
import { useResources } from './hooks/useResources';
import './styles/global.css';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 250px;
  overflow-y: auto;
`;

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const { classGroups, fetchAllResources } = useResources();

  useEffect(() => {
    fetchAllResources();
  }, [fetchAllResources]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveView} />;
      case 'timetable':
        return <TimetableGrid classGroups={classGroups} />;
      case 'resources':
        return <ResourceManagement />;
      case 'attendance':
        return <AttendanceKiosk />;
      case 'logs':
        return <AttendanceLogs />;
      default:
        return <Dashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <AppContainer>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <MainContent>{renderView()}</MainContent>
    </AppContainer>
  );
};

export default App;
