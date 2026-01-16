/**
 * Resource Management Page
 * Add/Remove Teachers, Rooms, Subjects, and Class Groups
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useResources } from '../hooks/useResources';
import { GlassCard, GlassButton, GlassInput, Grid, Badge } from '../styles/glassmorphism';
import { Modal } from '../components/Modal';

const Container = styled.div`
  padding: 32px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  opacity: 0.8;
`;

const Section = styled.div`
  margin-bottom: 48px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
`;

const ResourceCard = styled(GlassCard)`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResourceInfo = styled.div`
  flex: 1;
  
  .resource-name {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .resource-details {
    opacity: 0.7;
    font-size: 14px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;

export const ResourceManagement: React.FC = () => {
  const {
    teachers,
    rooms,
    subjects,
    classGroups,
    loading,
    fetchAllResources,
    createTeacher,
    deleteTeacher,
    createRoom,
    deleteRoom,
    createSubject,
    deleteSubject,
    createClassGroup,
    deleteClassGroup,
  } = useResources();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'teacher' | 'room' | 'subject' | 'class' | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchAllResources();
  }, [fetchAllResources]);

  const openModal = (type: 'teacher' | 'room' | 'subject' | 'class') => {
    setModalType(type);
    setFormData({});
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalType === 'teacher') {
        await createTeacher({
          name: formData.name,
          email: formData.email || null,
          max_hours_per_day: Number(formData.max_hours_per_day) || 6,
          subject_ids: formData.subject_ids || [],
        });
      } else if (modalType === 'room') {
        await createRoom({
          room_number: formData.room_number,
          capacity: Number(formData.capacity),
          is_lab: formData.is_lab || false,
          room_type: formData.room_type || 'Standard',
        });
      } else if (modalType === 'subject') {
        await createSubject({
          name: formData.name,
          code: formData.code,
          weekly_sessions: Number(formData.weekly_sessions),
          requires_lab: formData.requires_lab || false,
          teacher_ids: formData.teacher_ids || [],
        });
      } else if (modalType === 'class') {
        await createClassGroup({
          name: formData.name,
          semester: Number(formData.semester),
          strength: Number(formData.strength),
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to create resource:', err);
    }
  };

  return (
    <Container>
      <Header>
        <Title>📚 Resource Management</Title>
        <Subtitle>Manage teachers, rooms, subjects, and class groups</Subtitle>
      </Header>

      {/* Teachers */}
      <Section>
        <SectionHeader>
          <SectionTitle>Teachers ({teachers.length})</SectionTitle>
          <GlassButton onClick={() => openModal('teacher')}>+ Add Teacher</GlassButton>
        </SectionHeader>
        <Grid columns={2}>
          {teachers.map(teacher => (
            <ResourceCard key={teacher.id}>
              <ResourceInfo>
                <div className="resource-name">{teacher.name}</div>
                <div className="resource-details">
                  {teacher.email || 'No email'} • Max {teacher.max_hours_per_day}h/day
                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      {teacher.subjects.map((s: any) => (
                        <Badge key={s.id} style={{ marginRight: '4px' }}>{s.code}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </ResourceInfo>
              <GlassButton variant="danger" onClick={() => deleteTeacher(teacher.id)}>
                Delete
              </GlassButton>
            </ResourceCard>
          ))}
        </Grid>
      </Section>

      {/* Rooms */}
      <Section>
        <SectionHeader>
          <SectionTitle>Rooms ({rooms.length})</SectionTitle>
          <GlassButton onClick={() => openModal('room')}>+ Add Room</GlassButton>
        </SectionHeader>
        <Grid columns={3}>
          {rooms.map(room => (
            <ResourceCard key={room.id}>
              <ResourceInfo>
                <div className="resource-name">Room {room.room_number}</div>
                <div className="resource-details">
                  Capacity: {room.capacity} • {room.is_lab ? '🔬 Lab' : '📖 Standard'}
                </div>
              </ResourceInfo>
              <GlassButton variant="danger" onClick={() => deleteRoom(room.id)}>
                Delete
              </GlassButton>
            </ResourceCard>
          ))}
        </Grid>
      </Section>

      {/* Subjects */}
      <Section>
        <SectionHeader>
          <SectionTitle>Subjects ({subjects.length})</SectionTitle>
          <GlassButton onClick={() => openModal('subject')}>+ Add Subject</GlassButton>
        </SectionHeader>
        <Grid columns={2}>
          {subjects.map(subject => (
            <ResourceCard key={subject.id}>
              <ResourceInfo>
                <div className="resource-name">{subject.name} ({subject.code})</div>
                <div className="resource-details">
                  {subject.weekly_sessions} sessions/week • {subject.requires_lab ? 'Lab Required' : 'No Lab'}
                </div>
              </ResourceInfo>
              <GlassButton variant="danger" onClick={() => deleteSubject(subject.id)}>
                Delete
              </GlassButton>
            </ResourceCard>
          ))}
        </Grid>
      </Section>

      {/* Class Groups */}
      <Section>
        <SectionHeader>
          <SectionTitle>Class Groups ({classGroups.length})</SectionTitle>
          <GlassButton onClick={() => openModal('class')}>+ Add Class</GlassButton>
        </SectionHeader>
        <Grid columns={3}>
          {classGroups.map(cg => (
            <ResourceCard key={cg.id}>
              <ResourceInfo>
                <div className="resource-name">{cg.name}</div>
                <div className="resource-details">
                  Semester {cg.semester} • {cg.strength} students
                </div>
              </ResourceInfo>
              <GlassButton variant="danger" onClick={() => deleteClassGroup(cg.id)}>
                Delete
              </GlassButton>
            </ResourceCard>
          ))}
        </Grid>
      </Section>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Add ${modalType === 'class' ? 'Class Group' : modalType?.charAt(0).toUpperCase() + modalType?.slice(1)}`}
        onSubmit={handleSubmit}
        submitLabel="Create"
      >
        {modalType === 'teacher' && (
          <>
            <FormGroup>
              <label>Name *</label>
              <GlassInput
                placeholder="Dr. John Smith"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Email</label>
              <GlassInput
                placeholder="john@university.edu"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Max Hours Per Day</label>
              <GlassInput
                type="number"
                placeholder="6"
                value={formData.max_hours_per_day || ''}
                onChange={(e) => setFormData({ ...formData, max_hours_per_day: e.target.value })}
              />
            </FormGroup>
          </>
        )}

        {modalType === 'room' && (
          <>
            <FormGroup>
              <label>Room Number *</label>
              <GlassInput
                placeholder="101"
                value={formData.room_number || ''}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Capacity *</label>
              <GlassInput
                type="number"
                placeholder="60"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <CheckboxGroup>
                <input
                  type="checkbox"
                  checked={formData.is_lab || false}
                  onChange={(e) => setFormData({ ...formData, is_lab: e.target.checked })}
                />
                <label>Is Lab</label>
              </CheckboxGroup>
            </FormGroup>
          </>
        )}

        {modalType === 'subject' && (
          <>
            <FormGroup>
              <label>Subject Name *</label>
              <GlassInput
                placeholder="Data Structures"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Subject Code *</label>
              <GlassInput
                placeholder="CS201"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Weekly Sessions *</label>
              <GlassInput
                type="number"
                placeholder="4"
                value={formData.weekly_sessions || ''}
                onChange={(e) => setFormData({ ...formData, weekly_sessions: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <CheckboxGroup>
                <input
                  type="checkbox"
                  checked={formData.requires_lab || false}
                  onChange={(e) => setFormData({ ...formData, requires_lab: e.target.checked })}
                />
                <label>Requires Lab</label>
              </CheckboxGroup>
            </FormGroup>
          </>
        )}

        {modalType === 'class' && (
          <>
            <FormGroup>
              <label>Class Name *</label>
              <GlassInput
                placeholder="CSE-A"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Semester *</label>
              <GlassInput
                type="number"
                placeholder="4"
                value={formData.semester || ''}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Strength *</label>
              <GlassInput
                type="number"
                placeholder="60"
                value={formData.strength || ''}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
              />
            </FormGroup>
          </>
        )}
      </Modal>
    </Container>
  );
};
