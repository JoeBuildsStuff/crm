"use client";

import { FileText, Type, Calendar, Users } from "lucide-react";
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
import { createPerson } from "../../person/_lib/actions";

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
    const [contacts, setContacts] = useState(availableContacts);
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

    useEffect(() => {
        console.log("Setting contacts in NoteForm:", availableContacts)
        setContacts(availableContacts);
    }, [availableContacts]);

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

    const meetingOptions = availableMeetings?.map(m => ({
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
            }
        } catch (error) {
            console.error("Error creating person:", error);
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
                />
            </div>
            <div className="flex items-start gap-2 mt-4">
                <div className="flex items-start gap-2 text-muted-foreground min-w-[5rem] pt-1">
                    <FileText className="size-4 shrink-0 mt-0.5" />
                    <Label htmlFor="content" className="mt-0.5">Content</Label>
                </div>
                <div className="w-full min-w-0">
                    <Tiptap
                        content={content}
                        onChange={setContent}
                        showFixedMenu={false}
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
        </div>
    );
}