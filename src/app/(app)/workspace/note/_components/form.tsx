"use client";

import { ClipboardList, User, GitBranch } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Person } from "../../person/_lib/validations";
import { Meeting } from "../../meeting/_lib/validations";

type ContactForNote = Pick<Person, "id" | "first_name" | "last_name">
type MeetingForNote = Pick<Meeting, "id" | "title">

export interface NoteFormProps {
    initialData?: {
        content?: string;
        contact_id?: string;
        meeting_id?: string;
    };
    onChange?: (data: {
        content: string;
        contact_id: string;
        meeting_id: string;
    }) => void;
    className?: string;
    availableContacts?: ContactForNote[];
    availableMeetings?: MeetingForNote[];
}

export default function NoteForm({
    initialData = {},
    onChange,
    className,
    availableContacts = [],
    availableMeetings = []
}: NoteFormProps = {}) {
    const [content, setContent] = useState(initialData.content || "");
    const [contact, setContact] = useState(initialData.contact_id || "");
    const [meeting, setMeeting] = useState(initialData.meeting_id || "");

    useEffect(() => {
        if (onChange) {
            onChange({
                content,
                contact_id: contact,
                meeting_id: meeting,
            });
        }
    }, [content, contact, meeting, onChange]);

    return (
        <div className={cn("@container flex flex-col gap-4 text-foreground w-full", className)}>
            <div className="flex items-start gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] pt-3 text-muted-foreground">
                    <ClipboardList className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Content</span>
                </div>
                <Textarea 
                    className="w-full min-w-0 text-left hover:bg-secondary rounded-md py-2 px-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring min-h-20"
                    placeholder="Enter note content..."
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <User className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Contact</span>
                </div>
                <Select value={contact} onValueChange={setContact}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableContacts?.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.first_name} {c.last_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <GitBranch className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Meeting</span>
                </div>
                <Select value={meeting} onValueChange={setMeeting}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select meeting" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableMeetings?.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                                {m.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}