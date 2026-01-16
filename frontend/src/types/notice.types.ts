/**
 * Notice Types
 */

export interface Notice {
  id: string;
  title: string;
  content: string;
  type?: 'announcement' | 'event' | 'alert' | 'general';
  target_audience?: 'all' | 'students' | 'faculty';
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
  type?: string;
  target_audience?: string;
}
