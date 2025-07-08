"use client";

import { ClipboardList, Calendar, User, GitBranch, Milestone, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Person } from "../../person/_lib/validations";
import { Meeting } from "../../meeting/_lib/validations";
import {
  Button,
  DatePicker,
  Dialog,
  Group,
  Popover,
} from "react-aria-components";
import { Calendar as CalendarRac } from "@/components/ui/calendar-rac";
import { DateInput } from "@/components/ui/datefield-rac";
import { parseDate } from "@internationalized/date";

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

    // Convert date string to DateValue for React Aria
    const dueDateValue = dueDate ? parseDate(dueDate) : null;

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
                <DatePicker 
                    className="w-full"
                    value={dueDateValue}
                    onChange={(date) => setDueDate(date ? date.toString() : "")}
                >
                    <div className="flex">
                        <Group className="w-full">
                            <DateInput className="pe-9" />
                        </Group>
                        <Button className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
                            <CalendarIcon size={16} />
                        </Button>
                    </div>
                    <Popover
                        className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-lg border shadow-lg outline-hidden"
                        offset={4}
                    >
                        <Dialog className="max-h-[inherit] overflow-auto p-2">
                            <CalendarRac />
                        </Dialog>
                    </Popover>
                </DatePicker>
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