"use client";

import { ClipboardList, Calendar, User, Milestone, CalendarIcon, Type } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Person } from "../../person/_lib/validations";
import { Meeting } from "../../meeting/_lib/validations";

import SelectSearchable from "@/components/ui/select-searchable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PersonForm from "../../person/_components/form";
import MeetingForm from "../../meeting/_components/form";
import { createPerson } from "../../person/_lib/actions";
import { createMeeting } from "../../meeting/_lib/actions";
import { toast } from "sonner";
import {
  Button as RacButton,
  DatePicker,
  Group,
  Popover,
} from "react-aria-components";
import { Calendar as CalendarRac } from "@/components/ui/calendar-rac";
import { DateInput } from "@/components/ui/datefield-rac";
import { parseDate } from "@internationalized/date";
import Tiptap from "@/components/tiptap/tiptap";

type ContactForTask = Pick<Person, "id" | "first_name" | "last_name">
type MeetingForTask = Pick<Meeting, "id" | "title">

export interface TaskFormProps {
    initialData?: {
        title?: string;
        description?: string;
        status?: string;
        due_date?: string;
        assigned_to_contact_id?: string;
        meeting_id?: string;
    };
    onChange?: (data: {
        title: string;
        description: string;
        status: string;
        due_date: string;
        assigned_to_contact_id: string;
        meeting_id: string;
    }) => void;
    className?: string;
    availableContacts?: ContactForTask[];
    availableMeetings?: MeetingForTask[];
}

export default function TaskForm({
    initialData = {},
    onChange,
    className,
    availableContacts = [],
    availableMeetings = []
}: TaskFormProps = {}) {
    const [title, setTitle] = useState(initialData.title || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [status, setStatus] = useState(initialData.status || "");
    const [dueDate, setDueDate] = useState(initialData.due_date || "");
    const [assignee, setAssignee] = useState(initialData.assigned_to_contact_id || "");
    const [meeting, setMeeting] = useState(initialData.meeting_id || "");
    const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
    const [addMeetingDialogOpen, setAddMeetingDialogOpen] = useState(false);
    const [contacts, setContacts] = useState(availableContacts);
    const [meetings, setMeetings] = useState(availableMeetings);
    const [personFormData, setPersonFormData] = useState({
        firstName: "",
        lastName: "",
        emails: [] as string[],
        phones: [] as string[],
        city: "",
        state: "",
        company: "",
        description: "",
        linkedin: "",
        jobTitle: ""
    });
    const [meetingFormData, setMeetingFormData] = useState({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        status: "scheduled",
        attendees: [] as string[]
    });

    // Set default meeting times when dialog opens
    const handleOpenMeetingDialog = () => {
        const now = new Date();
        const startTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
        
        setMeetingFormData({
            title: "",
            description: "",
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: "scheduled",
            attendees: []
        });
        setAddMeetingDialogOpen(true);
    };

    useEffect(() => {
        setContacts(availableContacts);
    }, [availableContacts]);

    useEffect(() => {
        setMeetings(availableMeetings);
    }, [availableMeetings]);

    useEffect(() => {
        if (onChange) {
            onChange({
                title,
                description,
                status,
                due_date: dueDate,
                assigned_to_contact_id: assignee,
                meeting_id: meeting,
            });
        }
    }, [title, description, status, dueDate, assignee, meeting, onChange]);

    // Convert date string to DateValue for React Aria
    const dueDateValue = dueDate ? parseDate(dueDate) : null;

    // Transform data for SelectSearchable
    const contactOptions = contacts?.map(c => ({
        id: c.id,
        label: `${c.first_name} ${c.last_name}`,
        searchValue: `${c.first_name} ${c.last_name}`
    })) || [];

    const meetingOptions = meetings?.map(m => ({
        id: m.id,
        label: m.title,
        searchValue: m.title
    })) || [];

    const handleCreatePerson = async () => {
        if (!personFormData.firstName.trim() && !personFormData.lastName.trim()) {
            return;
        }

        try {
            const result = await createPerson({
                first_name: personFormData.firstName,
                last_name: personFormData.lastName,
                city: personFormData.city,
                state: personFormData.state,
                description: personFormData.description,
                linkedin: personFormData.linkedin,
                job_title: personFormData.jobTitle,
                company_name: personFormData.company,
                _emails: personFormData.emails.filter(email => email.trim() !== ""),
                _phones: personFormData.phones.filter(phone => phone.trim() !== "")
            });

            if (result.success && result.data) {
                // Add the new person to the contacts list
                const newContact = {
                    id: result.data.id,
                    first_name: result.data.first_name,
                    last_name: result.data.last_name
                };
                setContacts(prev => [...prev, newContact]);
                
                // Select the newly created person
                setAssignee(result.data.id);
                
                // Reset form and close dialog
                setPersonFormData({
                    firstName: "",
                    lastName: "",
                    emails: [],
                    phones: [],
                    city: "",
                    state: "",
                    company: "",
                    description: "",
                    linkedin: "",
                    jobTitle: ""
                });
                setAddPersonDialogOpen(false);
                toast.success("Person created successfully");
            } else {
                toast.error("Failed to create person", { description: result.error });
            }
        } catch (error) {
            console.error("Error creating person:", error);
            toast.error("An unexpected error occurred while creating the person.");
        }
    };

    const handleCreateMeeting = async () => {
        if (!meetingFormData.title.trim()) {
            toast.error("Meeting title is required.");
            return;
        }

        try {
            // Prepare meeting data, filtering out empty timestamp values
            const meetingData: Record<string, unknown> = {
                title: meetingFormData.title,
                description: meetingFormData.description,
                status: meetingFormData.status,
                _attendees: meetingFormData.attendees.filter(id => id.trim() !== '')
            };

            // Only add start_time and end_time if they have valid values
            if (meetingFormData.start_time && meetingFormData.start_time.trim() !== '') {
                meetingData.start_time = meetingFormData.start_time;
            }
            if (meetingFormData.end_time && meetingFormData.end_time.trim() !== '') {
                meetingData.end_time = meetingFormData.end_time;
            }

            const result = await createMeeting(meetingData);

            if (result.success && result.data) {
                // Add the new meeting to the meetings list
                const newMeeting = {
                    id: result.data.id,
                    title: result.data.title
                };
                setMeetings(prev => [...prev, newMeeting]);
                
                // Select the newly created meeting
                setMeeting(result.data.id);
                
                // Reset form and close dialog
                setMeetingFormData({
                    title: "",
                    description: "",
                    start_time: "",
                    end_time: "",
                    status: "scheduled",
                    attendees: []
                });
                setAddMeetingDialogOpen(false);
                toast.success("Meeting created successfully");
            } else {
                toast.error("Failed to create meeting", { description: result.error });
            }
        } catch (error) {
            console.error("Error creating meeting:", error);
            toast.error("An unexpected error occurred while creating the meeting.");
        }
    };

    const handleAddPersonDialogKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setAddPersonDialogOpen(false);
            setPersonFormData({
                firstName: "",
                lastName: "",
                emails: [],
                phones: [],
                city: "",
                state: "",
                company: "",
                description: "",
                linkedin: "",
                jobTitle: ""
            });
        } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleCreatePerson();
        }
    };

    const handleAddMeetingDialogKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setAddMeetingDialogOpen(false);
            const now = new Date();
            const startTime = new Date(now.getTime() + 30 * 60 * 1000);
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
            setMeetingFormData({
                title: "",
                description: "",
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                status: "scheduled",
                attendees: []
            });
        } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleCreateMeeting();
        }
    };

    return (
        <div className={cn("@container flex flex-col gap-4 text-foreground w-full", className)}>

            {/* Title */}
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <Type className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Title</span>
                </div>
                <Input 
                    className="w-full"
                    placeholder="Enter task title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <Milestone className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Status</span>
                </div>
                <ToggleGroup 
                    variant="outline" 
                    type="single" 
                    value={status} 
                    onValueChange={(value) => value && setStatus(value)}
                    className="flex items-center w-full text-xs"
                >
                    <ToggleGroupItem value="TO_DO" className="text-xs">To Do</ToggleGroupItem>
                    <ToggleGroupItem value="IN_PROGRESS" className="text-xs">In Progress</ToggleGroupItem>
                    <ToggleGroupItem value="DONE" className="text-xs">Done</ToggleGroupItem>
                    <ToggleGroupItem value="CANCELLED" className="text-xs">Cancelled</ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <Calendar className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Due Date</span>
                </div>
                <DatePicker 
                    className="w-full"
                    value={dueDateValue}
                    onChange={(date) => setDueDate(date ? date.toString() : "")}
                >
                    <div className="flex">
                        <Group className="w-full">
                            <DateInput className="pe-9" />
                        </Group>
                        <RacButton className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
                            <CalendarIcon size={16} />
                        </RacButton>
                    </div>
                    <Popover
                        className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-lg border shadow-lg outline-hidden"
                        offset={4}
                    >
                        <Dialog>
                            <CalendarRac />
                        </Dialog>
                    </Popover>
                </DatePicker>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <User className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Assignee</span>
                </div>
                <SelectSearchable
                    value={assignee}
                    onValueChange={setAssignee}
                    options={contactOptions}
                    placeholder="Select assignee..."
                    searchPlaceholder="Search contacts..."
                    emptyText="No contact found."
                    showBadge={true}
                    badgeVariant="outline"
                    allowCreate={true}
                    createText="Add Person"
                    onCreateClick={() => setAddPersonDialogOpen(true)}
                    allowBadgeNavigation={true}
                    navigationRoute="/workspace/person"
                />
            </div>

            {/* Meeting */}
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <Calendar className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Meeting</span>
                </div>
                <SelectSearchable
                    value={meeting}
                    onValueChange={setMeeting}
                    options={meetingOptions}
                    placeholder="Select meeting..."
                    searchPlaceholder="Search meetings..."
                    emptyText="No meeting found."
                    showBadge={true}
                    badgeVariant="outline"
                    allowCreate={true}
                    createText="Add Meeting"
                    onCreateClick={handleOpenMeetingDialog}
                    allowBadgeNavigation={true}
                    navigationRoute="/workspace/meeting"
                />
            </div>

            {/* Description */}
            <div className="flex items-start gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] pt-3 text-muted-foreground">
                    <ClipboardList className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Description</span>
                </div>
                <div className="w-full">
                    <Tiptap 
                        content={description}
                        onChange={(content) => setDescription(content)}
                    />
                </div>
            </div>

            <Dialog open={addPersonDialogOpen} onOpenChange={setAddPersonDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" onKeyDown={handleAddPersonDialogKeyDown}>
                    <DialogHeader>
                        <DialogTitle>Add New Person</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <PersonForm
                            initialFirstName={personFormData.firstName}
                            initialLastName={personFormData.lastName}
                            initialEmails={personFormData.emails}
                            initialPhones={personFormData.phones}
                            initialCity={personFormData.city}
                            initialState={personFormData.state}
                            initialCompany={personFormData.company}
                            initialDescription={personFormData.description}
                            initialLinkedin={personFormData.linkedin}
                            initialJobTitle={personFormData.jobTitle}
                            onChange={setPersonFormData}
                        />
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setAddPersonDialogOpen(false);
                                setPersonFormData({
                                    firstName: "",
                                    lastName: "",
                                    emails: [],
                                    phones: [],
                                    city: "",
                                    state: "",
                                    company: "",
                                    description: "",
                                    linkedin: "",
                                    jobTitle: ""
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreatePerson} 
                            disabled={!personFormData.firstName.trim() && !personFormData.lastName.trim()}
                        >
                            Create Person
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={addMeetingDialogOpen} onOpenChange={setAddMeetingDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" onKeyDown={handleAddMeetingDialogKeyDown}>
                    <DialogHeader>
                        <DialogTitle>Add New Meeting</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <MeetingForm
                            initialTitle={meetingFormData.title}
                            initialDescription={meetingFormData.description}
                            initialStartTime={meetingFormData.start_time}
                            initialEndTime={meetingFormData.end_time}
                            initialStatus={meetingFormData.status}
                            initialAttendees={meetingFormData.attendees}
                            availableContacts={contacts}
                            onChange={setMeetingFormData}
                        />
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setAddMeetingDialogOpen(false);
                                const now = new Date();
                                const startTime = new Date(now.getTime() + 30 * 60 * 1000);
                                const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
                                setMeetingFormData({
                                    title: "",
                                    description: "",
                                    start_time: startTime.toISOString(),
                                    end_time: endTime.toISOString(),
                                    status: "scheduled",
                                    attendees: []
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateMeeting} 
                            disabled={!meetingFormData.title.trim()}
                        >
                            Create Meeting
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}