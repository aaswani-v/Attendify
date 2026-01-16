/**
 * Custom Hook for Resource Management (Teachers, Rooms, Subjects, Classes)
 */

import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../utils/api';
import { Teacher, Room, Subject, ClassGroup } from '../utils/types';

export const useResources = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all resources
  const fetchAllResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [teachersRes, roomsRes, subjectsRes, classGroupsRes] = await Promise.all([
        fetch(API_ENDPOINTS.GET_TEACHERS),
        fetch(API_ENDPOINTS.GET_ROOMS),
        fetch(API_ENDPOINTS.GET_SUBJECTS),
        fetch(API_ENDPOINTS.GET_CLASS_GROUPS),
      ]);

      const [teachersData, roomsData, subjectsData, classGroupsData] = await Promise.all([
        teachersRes.json(),
        roomsRes.json(),
        subjectsRes.json(),
        classGroupsRes.json(),
      ]);

      setTeachers(teachersData);
      setRooms(roomsData);
      setSubjects(subjectsData);
      setClassGroups(classGroupsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }, []);

  // Teacher operations
  const createTeacher = useCallback(async (data: any) => {
    const response = await fetch(API_ENDPOINTS.CREATE_TEACHER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create teacher');
    await fetchAllResources();
    return response.json();
  }, [fetchAllResources]);

  const deleteTeacher = useCallback(async (id: number) => {
    const response = await fetch(API_ENDPOINTS.DELETE_TEACHER(id), { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete teacher');
    await fetchAllResources();
  }, [fetchAllResources]);

  // Room operations
  const createRoom = useCallback(async (data: any) => {
    const response = await fetch(API_ENDPOINTS.CREATE_ROOM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create room');
    await fetchAllResources();
    return response.json();
  }, [fetchAllResources]);

  const deleteRoom = useCallback(async (id: number) => {
    const response = await fetch(API_ENDPOINTS.DELETE_ROOM(id), { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete room');
    await fetchAllResources();
  }, [fetchAllResources]);

  // Subject operations
  const createSubject = useCallback(async (data: any) => {
    const response = await fetch(API_ENDPOINTS.CREATE_SUBJECT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create subject');
    await fetchAllResources();
    return response.json();
  }, [fetchAllResources]);

  const deleteSubject = useCallback(async (id: number) => {
    const response = await fetch(API_ENDPOINTS.DELETE_SUBJECT(id), { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete subject');
    await fetchAllResources();
  }, [fetchAllResources]);

  // ClassGroup operations
  const createClassGroup = useCallback(async (data: any) => {
    const response = await fetch(API_ENDPOINTS.CREATE_CLASS_GROUP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create class group');
    await fetchAllResources();
    return response.json();
  }, [fetchAllResources]);

  const deleteClassGroup = useCallback(async (id: number) => {
    const response = await fetch(API_ENDPOINTS.DELETE_CLASS_GROUP(id), { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete class group');
    await fetchAllResources();
  }, [fetchAllResources]);

  return {
    teachers,
    rooms,
    subjects,
    classGroups,
    loading,
    error,
    fetchAllResources,
    createTeacher,
    deleteTeacher,
    createRoom,
    deleteRoom,
    createSubject,
    deleteSubject,
    createClassGroup,
    deleteClassGroup,
  };
};
