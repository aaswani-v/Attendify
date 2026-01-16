import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GlassCard } from '../../styles/glassmorphism';
import { API_ENDPOINTS } from '../../utils/api';

const Container = styled.div`
  padding: 32px;
`;

const LogItem = styled(GlassCard)`
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StudentAttendancePage = () => {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        // ideally fetch logs for *this* student. 
        // For hackathon/demo, we'll fetch all and maybe filter client side or show all
        fetch(API_ENDPOINTS.GET_ATTENDANCE_LOGS)
            .then(res => res.json())
            .then(data => setLogs(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <Container>
            <h1>📅 My Attendance History</h1>
            <div style={{ marginTop: '24px' }}>
                {logs.length === 0 ? <p>No records found.</p> : (
                    logs.map((log: any) => (
                        <LogItem key={log.id}>
                            <div>
                                <h3>{new Date(log.timestamp).toLocaleDateString()}</h3>
                                <p style={{ opacity: 0.7 }}>{new Date(log.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <span style={{ 
                                color: log.status === 'Present' ? '#4caf50' : '#f44336', 
                                fontWeight: 'bold' 
                            }}>
                                {log.status}
                            </span>
                        </LogItem>
                    ))
                )}
            </div>
        </Container>
    );
};

export default StudentAttendancePage;
