export type Meeting = {
  id: string;
  created_at?: string;
  created_by?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status?: string;
  updated_at?: string;
}

// Form-specific types (for your React component)
export type MeetingFormData = {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
}

// API response types
export type MeetingListResponse = {
  meetings: Meeting[];
  total: number;
}

export type MeetingDetailResponse = Meeting;

// Insert/Update types (without generated fields)
export type MeetingInsert = Omit<Meeting, 'id' | 'created_at' | 'updated_at'>;
export type MeetingUpdate = Partial<MeetingInsert>;

// Utility types for the component
export type MeetingData = {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
}