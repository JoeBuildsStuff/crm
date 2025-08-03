"use client";

import { Type, Calendar, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Person } from "../../person/_lib/validations";
import { Meeting } from "../../meeting/_lib/validations";
import { Company } from "../../company/_lib/validations";
import { Label } from "@/components/ui/label";
import SelectSearchable from "@/components/ui/select-searchable";
import Tiptap from "@/components/tiptap/tiptap";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PersonForm from "../../person/_components/form";
import MeetingForm from "../../meeting/_components/form";
import { createPerson } from "../../person/_lib/actions";
import { createMeeting } from "../../meeting/_lib/actions";
import { toast } from "sonner";

type ContactForNote = Pick<Person, "id" | "first_name" | "last_name">
type MeetingForNote = Pick<Meeting, "id" | "title">

export interface NoteFormProps {
    initialData?: {
        content?: string;
        contact_id?: string;
        meeting_id?: string;
        title?: string;
    };
    onChange?: (data: {
        title: string;
        content: string;
        contact_id: string;
        meeting_id: string;
    }) => void;
    className?: string;
    availableContacts?: ContactForNote[];
    availableMeetings?: MeetingForNote[];
    availableCompanies?: Company[];
}

export default function NoteForm({
    initialData = {},
    onChange,
    className,
    availableContacts = [],
    availableMeetings = [],
    availableCompanies = []
}: NoteFormProps = {}) {
    console.log("NoteForm received props:", { availableContacts, availableMeetings, availableCompanies })
    
    const [content, setContent] = useState(initialData.content || "");
    const [contact, setContact] = useState(initialData.contact_id || "");
    const [meeting, setMeeting] = useState(initialData.meeting_id || "");
    const [title, setTitle] = useState(initialData.title || "");
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
        console.log("Setting contacts in NoteForm:", availableContacts)
        setContacts(availableContacts);
    }, [availableContacts]);

    useEffect(() => {
        console.log("Setting meetings in NoteForm:", availableMeetings)
        setMeetings(availableMeetings);
    }, [availableMeetings]);

    useEffect(() => {
        if (onChange) {
            onChange({
                title,
                content,
                contact_id: contact,
                meeting_id: meeting,
            });
        }
    }, [title, content, contact, meeting, onChange]);

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
                setContact(result.data.id);
                
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
        <div className={cn("@container flex flex-col gap-1 text-foreground w-full", className)}>
            <div className="flex items-center gap-2">
                <div className="flex items-start gap-2 text-muted-foreground min-w-[5rem] pt-1">
                    <Type className="size-4 shrink-0" />
                    <Label htmlFor="title">Title</Label>
                </div>
                <input
                    className="w-full min-w-0 text-left hover:bg-secondary rounded-md py-2 px-2 truncate" 
                    placeholder="Enter note title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-start gap-2 text-muted-foreground min-w-[5rem] pt-1">
                    <Users className="size-4 shrink-0" />
                    <Label htmlFor="people">People</Label>
                </div>
                <SelectSearchable
                    value={contact}
                    onValueChange={setContact}
                    options={contactOptions}
                    placeholder="Select contact..."
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
            <div className="flex items-center gap-2">
                <div className="flex items-start gap-2 text-muted-foreground min-w-[5rem] pt-1">
                    <Calendar className="size-4 shrink-0" />
                    <Label htmlFor="meeting">Meeting</Label>
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
            <div className="flex items-start gap-2 mt-2">
                {/* <div className="flex items-start gap-2 text-muted-foreground min-w-[5rem] pt-1">
                    <File className="size-4 shrink-0 mt-0.5" />
                    <Label htmlFor="content" className="mt-0.5">Content</Label>
                </div> */}
                <div className="w-full min-w-0">
                    <Tiptap
                        content={content}
                        onChange={setContent}
                        showFixedMenu={true}
                        showBubbleMenu={true}
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
                            availableCompanies={availableCompanies}
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