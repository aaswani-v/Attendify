/**
 * Attendance Logs View
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GlassCard, Grid, Badge } from '../styles/glassmorphism';
import { API_ENDPOINTS } from '../utils/api';
import { AttendanceLog } from '../utils/types';

const Container = styled.div`
  padding: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
`;

const LogCard = styled(GlassCard)`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogInfo = styled.div`
  flex: 1;
  
  .log-name {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .log-details {
    opacity: 0.7;
    font-size: 14px;
  }
`;

export const AttendanceLogs: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.GET_ATTENDANCE_LOGS);
        const data = await response.json();
        setLogs(data.reverse()); // Most recent first
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Container>
      <Title>📝 Attendance Logs</Title>

      {loading ? (
        <GlassCard>
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading logs...</div>
        </GlassCard>
      ) : logs.length === 0 ? (
        <GlassCard>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No attendance logs yet</h3>
            <p style={{ opacity: 0.7, marginTop: '12px' }}>
              Attendance records will appear here once students start marking attendance
            </p>
          </div>
        </GlassCard>
      ) : (
        <Grid columns={1}>
          {logs.map(log => (
            <LogCard key={log.id}>
              <LogInfo>
                <div className="log-name">
                  {log.student_name || 'Unknown Student'}
                  {log.roll_number && ` (${log.roll_number})`}
                </div>
                <div className="log-details">
                  {formatTimestamp(log.timestamp)}
                </div>
              </LogInfo>
              <Badge color={log.status === 'Present' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}>
                {log.status}
              </Badge>
            </LogCard>
          ))}
        </Grid>
      )}
    </Container>
  );
};
