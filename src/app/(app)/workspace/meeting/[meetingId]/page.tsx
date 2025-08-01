import MeetingForm from "../_components/form"
import { getMeeting, getAvailableContacts } from "../_lib/queries"

export default async function Page({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await params

  // Fetch data on the server
  const [meetingResult, contactsRes] = await Promise.all([
    getMeeting(meetingId),
    getAvailableContacts()
  ])

  if (meetingResult.error) {
    console.error("Error fetching meeting:", meetingResult.error)
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="text-center text-muted-foreground">
          Error loading meeting
        </div>
      </div>
    )
  }

  if (!meetingResult.data) {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="text-center text-muted-foreground">
          Meeting not found
        </div>
      </div>
    )
  }

  const meeting = meetingResult.data
  const contacts = contactsRes.data || []

  return (
    <div className="flex flex-col gap-4 p-1">
      <MeetingForm 
        initialTitle={meeting.title || ""}
        initialDescription={meeting.description || ""}
        initialStartTime={meeting.start_time || ""}
        initialEndTime={meeting.end_time || ""}
        initialStatus={meeting.status || "scheduled"}
        initialAttendees={meeting.attendees?.map(attendee => attendee.contact?.id || attendee.external_email || "") || []}
        availableContacts={contacts}
      />
    </div>
  )
} 