/**
 * Timetable Grid View Component
 * Displays schedule in a beautiful grid format
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTimetable } from '../hooks/useTimetable';
import { GlassCard, FloatingActionButton, SuccessBanner, ErrorBanner } from '../styles/glassmorphism';
import { TimetableEntry, ClassGroup } from '../utils/types';
import { DAYS, PERIODS } from '../utils/api';

const Container = styled.div`
  padding: 32px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  outline: none;
  cursor: pointer;
  
  option {
    background: #1e293b;
  }
`;

const GridContainer = styled.div`
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 8px;
  min-width: 800px;
`;

const Th = styled.th`
  background: rgba(255, 255, 255, 0.15);
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Td = styled.td`
  padding: 4px;
  text-align: center;
`;

const ClassBlock = styled(GlassCard)`
  padding: 12px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 12px;
  
  .subject-name {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .teacher-name {
    opacity: 0.8;
    margin-bottom: 2px;
  }
  
  .room-number {
    opacity: 0.6;
    font-size: 11px;
  }
`;

const EmptyBlock = styled.div`
  min-height: 80px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
`;

interface TimetableGridProps {
  classGroups: ClassGroup[];
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({ classGroups }) => {
  const { schedule, loading, error, fetchSchedule, generateTimetable } = useTimetable();
  const [selectedClassGroup, setSelectedClassGroup] = useState<number | undefined>();
  const [generating, setGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    fetchSchedule(selectedClassGroup);
  }, [selectedClassGroup, fetchSchedule]);

  const handleGenerate = async () => {
    setGenerating(true);
    setSuccessMessage('');
    try {
      const result = await generateTimetable();
      setSuccessMessage(`Timetable generated successfully! (${result.stats?.solve_time.toFixed(2)}s)`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Create a grid structure
  const gridData: { [key: string]: TimetableEntry } = {};
  schedule.forEach(entry => {
    const key = `${entry.day}-${entry.period}`;
    gridData[key] = entry;
  });

  return (
    <Container>
      <Header>
        <Title>📅 Timetable View</Title>
        <Controls>
          <Select 
            value={selectedClassGroup || 'all'} 
            onChange={(e) => setSelectedClassGroup(e.target.value === 'all' ? undefined : Number(e.target.value))}
          >
            <option value="all">All Classes</option>
            {classGroups.map(cg => (
              <option key={cg.id} value={cg.id}>{cg.name}</option>
            ))}
          </Select>
        </Controls>
      </Header>

      {successMessage && (
        <SuccessBanner>
          <span>✓</span> {successMessage}
        </SuccessBanner>
      )}

      {error && (
        <ErrorBanner>
          <span>⚠</span> {error}
        </ErrorBanner>
      )}

      {loading ? (
        <GlassCard>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading timetable...
          </div>
        </GlassCard>
      ) : schedule.length === 0 ? (
        <GlassCard>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No timetable generated yet</h3>
            <p style={{ opacity: 0.7, marginTop: '12px' }}>
              Click the + button to generate a new timetable
            </p>
          </div>
        </GlassCard>
      ) : (
        <GridContainer>
          <Table>
            <thead>
              <tr>
                <Th>Time</Th>
                {DAYS.map(day => (
                  <Th key={day}>{day}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((time, periodIndex) => (
                <tr key={periodIndex}>
                  <Th>{time}</Th>
                  {DAYS.map((_, dayIndex) => {
                    const entry = gridData[`${dayIndex}-${periodIndex}`];
                    return (
                      <Td key={dayIndex}>
                        {entry ? (
                          <ClassBlock>
                            <div className="subject-name">{entry.subject_code}</div>
                            <div className="teacher-name">{entry.teacher_name}</div>
                            <div className="room-number">Room {entry.room_number}</div>
                          </ClassBlock>
                        ) : (
                          <EmptyBlock>—</EmptyBlock>
                        )}
                      </Td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        </GridContainer>
      )}

      <FloatingActionButton onClick={handleGenerate} disabled={generating}>
        {generating ? '⏳' : '+'}
      </FloatingActionButton>
    </Container>
  );
};
