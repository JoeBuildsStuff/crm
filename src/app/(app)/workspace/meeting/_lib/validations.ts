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

export type MeetingAttendee = {
  id: string;
  meeting_id: string;
  contact_id?: string;
  external_name?: string;
  external_email?: string;
  attendance_status?: string;
  is_organizer?: boolean;
  created_at?: string;
  contact?: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
}

export type MeetingWithRelations = Meeting & {
  attendees: MeetingAttendee[];
}

// Form-specific types (for your React component)
export type MeetingFormData = {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  attendees: string[];
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