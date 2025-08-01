import TaskForm from "../_components/form"
import { getTask, getAssignableContacts, getLinkableMeetings } from "../_lib/queries"

export default async function Page({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params

  // Fetch data on the server
  const [taskResult, contactsRes, meetingsRes] = await Promise.all([
    getTask(taskId),
    getAssignableContacts(),
    getLinkableMeetings()
  ])

  if (taskResult.error) {
    console.error("Error fetching task:", taskResult.error)
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="text-center text-muted-foreground">
          Error loading task
        </div>
      </div>
    )
  }

  if (!taskResult.data) {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="text-center text-muted-foreground">
          Task not found
        </div>
      </div>
    )
  }

  const task = taskResult.data
  const contacts = contactsRes.data || []
  const meetings = meetingsRes.data || []

  return (
    <div className="flex flex-col gap-4 p-1">
      <TaskForm 
        initialDescription={task.description || ""}
        initialStatus={task.status || "TO_DO"}
        initialDueDate={task.due_date || ""}
        initialMeetingId={task.meeting_id || ""}
        initialAssignedToContactId={task.assigned_to_contact_id || ""}
        availableContacts={contacts}
        availableMeetings={meetings}
      />
    </div>
  )
} 