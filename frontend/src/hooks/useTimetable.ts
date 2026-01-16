/**
 * Custom Hook for Timetable API Operations
 */

import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../utils/api';
import { TimetableEntry, GenerateResponse } from '../utils/types';

export const useTimetable = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<TimetableEntry[]>([]);

  const fetchSchedule = useCallback(async (classGroupId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = classGroupId 
        ? `${API_ENDPOINTS.GET_SCHEDULE}?class_group_id=${classGroupId}`
        : API_ENDPOINTS.GET_SCHEDULE;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const data = await response.json();
      setSchedule(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateTimetable = useCallback(async (classGroupIds?: number[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.GENERATE_TIMETABLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_group_ids: classGroupIds }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate timetable');
      }
      const data: GenerateResponse = await response.json();
      setSchedule(data.schedule);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.CLEAR_SCHEDULE, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to clear schedule');
      setSchedule([]);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schedule,
    loading,
    error,
    fetchSchedule,
    generateTimetable,
    clearSchedule,
  };
};
