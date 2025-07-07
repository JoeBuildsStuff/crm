"use client";

import { ClipboardList, Calendar, User, GitBranch, Milestone } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Person } from "../../person/_lib/validations";
import { Meeting } from "../../meeting/_lib/validations";

type ContactForTask = Pick<Person, "id" | "first_name" | "last_name">
type MeetingForTask = Pick<Meeting, "id" | "title">

export interface TaskFormProps {
    initialData?: {
        description?: string;
        status?: string;
        due_date?: string;
        assigned_to_contact_id?: string;
        meeting_id?: string;
    };
    onChange?: (data: {
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
    const [description, setDescription] = useState(initialData.description || "");
    const [status, setStatus] = useState(initialData.status || "");
    const [dueDate, setDueDate] = useState(initialData.due_date || "");
    const [assignee, setAssignee] = useState(initialData.assigned_to_contact_id || "");
    const [meeting, setMeeting] = useState(initialData.meeting_id || "");

    useEffect(() => {
        if (onChange) {
            onChange({
                description,
                status,
                due_date: dueDate,
                assigned_to_contact_id: assignee,
                meeting_id: meeting,
            });
        }
    }, [description, status, dueDate, assignee, meeting, onChange]);

    return (
        <div className={cn("@container flex flex-col gap-4 text-foreground w-full", className)}>
            <div className="flex items-start gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] pt-3 text-muted-foreground">
                    <ClipboardList className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Description</span>
                </div>
                <Textarea 
                    className="w-full min-w-0 text-left hover:bg-secondary rounded-md py-2 px-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring min-h-20"
                    placeholder="Enter task description..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <Milestone className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Status</span>
                </div>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TO_DO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <Calendar className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Due Date</span>
                </div>
                <Input 
                    type="date"
                    className="w-full min-w-0 text-left hover:bg-secondary rounded-md py-2 px-2 truncate focus:outline-none focus:ring-1 focus:ring-ring" 
                    placeholder="Select due date..." 
                    value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <User className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Assignee</span>
                </div>
                <Select value={assignee} onValueChange={setAssignee}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableContacts?.map(contact => (
                            <SelectItem key={contact.id} value={contact.id}>
                                {contact.first_name} {contact.last_name}
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