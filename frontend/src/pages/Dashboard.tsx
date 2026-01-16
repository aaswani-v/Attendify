/**
 * Dashboard Component - Overview of System
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GlassCard, Grid, GlassButton } from '../styles/glassmorphism';
import { API_ENDPOINTS } from '../utils/api';

const Container = styled.div`
  padding: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
`;

const StatCard = styled(GlassCard)`
  text-align: center;
  padding: 32px;
  
  .stat-value {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .stat-label {
    opacity: 0.8;
    font-size: 16px;
  }
`;

const QuickActionCard = styled(GlassCard)`
  padding: 24px;
  text-align: center;
  cursor: pointer;
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .action-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .action-description {
    opacity: 0.7;
    font-size: 14px;
  }
`;

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({ teachers: 0, rooms: 0, subjects: 0, class_groups: 0, timetable_entries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.GET_RESOURCES);
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const seedDatabase = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SEED_DATABASE, { method: 'POST' });
      const data = await response.json();
      alert(data.message);
      window.location.reload();
    } catch (err) {
      alert('Failed to seed database');
    }
  };

  return (
    <Container>
      <Title>📊 Dashboard</Title>

      <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>System Statistics</h2>
      <Grid columns={5}>
        <StatCard>
          <div className="stat-value">{stats.teachers}</div>
          <div className="stat-label">Teachers</div>
        </StatCard>
        <StatCard>
          <div className="stat-value">{stats.rooms}</div>
          <div className="stat-label">Rooms</div>
        </StatCard>
        <StatCard>
          <div className="stat-value">{stats.subjects}</div>
          <div className="stat-label">Subjects</div>
        </StatCard>
        <StatCard>
          <div className="stat-value">{stats.class_groups}</div>
          <div className="stat-label">Classes</div>
        </StatCard>
        <StatCard>
          <div className="stat-value">{stats.timetable_entries}</div>
          <div className="stat-label">Scheduled</div>
        </StatCard>
      </Grid>

      <h2 style={{ marginTop: '48px', marginBottom: '16px', fontSize: '20px' }}>Quick Actions</h2>
      <Grid columns={3}>
        <QuickActionCard onClick={() => onNavigate('timetable')}>
          <div className="icon">🗓️</div>
          <div className="action-title">View Timetable</div>
          <div className="action-description">See the generated schedule</div>
        </QuickActionCard>
        <QuickActionCard onClick={() => onNavigate('resources')}>
          <div className="icon">📚</div>
          <div className="action-title">Manage Resources</div>
          <div className="action-description">Add teachers, rooms, subjects</div>
        </QuickActionCard>
        <QuickActionCard onClick={() => onNavigate('attendance')}>
          <div className="icon">✅</div>
          <div className="action-title">Attendance Kiosk</div>
          <div className="action-description">Mark student attendance</div>
        </QuickActionCard>
      </Grid>

      {stats.teachers === 0 && (
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <GlassCard style={{ padding: '32px' }}>
            <h3>🚀 Get Started</h3>
            <p style={{ opacity: 0.8, marginTop: '12px', marginBottom: '24px' }}>
              No resources found. Seed the database with sample data to get started quickly.
            </p>
            <GlassButton onClick={seedDatabase}>
              Seed Database
            </GlassButton>
          </GlassCard>
        </div>
      )}
    </Container>
  );
};
