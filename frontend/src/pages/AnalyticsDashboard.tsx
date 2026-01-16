import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GlassCard, Grid } from '../styles/glassmorphism';
import { attendanceService } from '../services/attendanceService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Container = styled.div`
  padding: 32px;
`;

const StatGrid = styled(Grid)`
    margin-bottom: 32px;
`;

const StatCard = styled(GlassCard)`
    text-align: center;
    padding: 24px;
    h2 { font-size: 36px; margin-bottom: 8px; }
    p { opacity: 0.7; }
`;

const ChartContainer = styled(GlassCard)`
    padding: 24px;
    height: 400px;
`;

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        unknown: 0
    });
    
    useEffect(() => {
        attendanceService.getLogs()
            .then(data => {
                const total = data.length;
                const present = data.filter(d => d.status === 'Present').length;
                const unknown = data.filter(d => d.status === 'Unknown' || d.status === 'Rejected').length;
                const absent = total - present - unknown; // Simplistic approach
                setStats({ total, present, absent, unknown });
            })
            .catch(err => console.error(err));
    }, []);

    const pieData = [
        { name: 'Present', value: stats.present, color: '#4caf50' },
        { name: 'Unknown/Fail', value: stats.unknown, color: '#f44336' },
    ];

    return (
        <Container>
            <h1>📈 Real-time Analytics Dashboard</h1>
            
            <StatGrid columns={3}>
                <StatCard>
                    <h2 style={{color: '#4caf50'}}>{stats.present}</h2>
                    <p>Total Present</p>
                </StatCard>
                <StatCard>
                    <h2 style={{color: '#f44336'}}>{stats.unknown}</h2>
                    <p>Failed / Unknown Attempts</p>
                </StatCard>
                <StatCard>
                    <h2>{stats.total}</h2>
                    <p>Total Logs Captured</p>
                </StatCard>
            </StatGrid>

            <Grid columns={2}>
                <ChartContainer>
                    <h3>Attendance Distribution</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                
                 <ChartContainer>
                    <h3>Activity per Day</h3>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', opacity:0.5}}>
                        <p>Not enough history data yet</p>
                    </div>
                </ChartContainer>
            </Grid>
        </Container>
    );
};

export default AnalyticsDashboard;
