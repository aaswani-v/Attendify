/**
 * Sidebar Navigation Component
 */

import React from 'react';
import styled from 'styled-components';
import { GlassCard } from '../styles/glassmorphism';

const SidebarContainer = styled(GlassCard)`
  width: 250px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: center;
  background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const NavItem = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  return (
    <SidebarContainer>
      <Logo>Attendify</Logo>
      <NavItem active={activeView === 'dashboard'} onClick={() => onNavigate('dashboard')}>
        📊 Dashboard
      </NavItem>
      <NavItem active={activeView === 'timetable'} onClick={() => onNavigate('timetable')}>
        🗓️ Timetable View
      </NavItem>
      <NavItem active={activeView === 'resources'} onClick={() => onNavigate('resources')}>
        📚 Manage Resources
      </NavItem>
      <NavItem active={activeView === 'attendance'} onClick={() => onNavigate('attendance')}>
        ✅ Attendance Kiosk
      </NavItem>
      <NavItem active={activeView === 'logs'} onClick={() => onNavigate('logs')}>
        📝 Attendance Logs
      </NavItem>
    </SidebarContainer>
  );
};
