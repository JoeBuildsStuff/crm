"use client";

import { Clock, FileText, CheckCircle, ChevronDownIcon, Timer } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface MeetingFormProps {
    /**
     * Initial meeting title value
     */
    initialTitle?: string;
    /**
     * Initial description value
     */
    initialDescription?: string;
    /**
     * Initial start time value
     */
    initialStartTime?: string;
    /**
     * Initial end time value
     */
    initialEndTime?: string;
    /**
     * Initial status value
     */
    initialStatus?: string;
    /**
     * Callback fired when form data changes
     */
    onChange?: (data: {
        title: string;
        description: string;
        start_time: string;
        end_time: string;
        status: string;
    }) => void;
    /**
     * Custom CSS class name
     */
    className?: string;
}

export default function MeetingForm({
    initialTitle = "",
    initialDescription = "",
    initialStartTime = "",
    initialEndTime = "",
    initialStatus = "scheduled",
    onChange,
    className
}: MeetingFormProps = {}) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [startTime, setStartTime] = useState(initialStartTime);
    const [endTime, setEndTime] = useState(initialEndTime);
    const [status, setStatus] = useState(initialStatus);
    const [duration, setDuration] = useState(() => {
        // Calculate initial duration if both start and end times are provided
        if (initialStartTime && initialEndTime) {
            const start = new Date(initialStartTime);
            const end = new Date(initialEndTime);
            return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // in minutes
        }
        return 60; // default 60 minutes
    });
    
    // Calendar and time states
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialStartTime ? new Date(initialStartTime) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        initialEndTime ? new Date(initialEndTime) : undefined
    );
    const [startTimeValue, setStartTimeValue] = useState(() => {
        if (initialStartTime) {
            const date = new Date(initialStartTime);
            return date.toTimeString().slice(0, 5);
        }
        return "10:00";
    });
    const [endTimeValue, setEndTimeValue] = useState(() => {
        if (initialEndTime) {
            const date = new Date(initialEndTime);
            return date.toTimeString().slice(0, 5);
        }
        return "11:00";
    });

    // Track which field was last updated to determine update direction
    const [lastUpdated, setLastUpdated] = useState<'start' | 'end' | 'duration'>('duration');

    // Update datetime strings when date or time changes
    useEffect(() => {
        if (startDate && startTimeValue) {
            const [hours, minutes] = startTimeValue.split(':');
            const newStartDate = new Date(startDate);
            newStartDate.setHours(parseInt(hours), parseInt(minutes), 0);
            setStartTime(newStartDate.toISOString());
        }
    }, [startDate, startTimeValue]);

    useEffect(() => {
        if (endDate && endTimeValue) {
            const [hours, minutes] = endTimeValue.split(':');
            const newEndDate = new Date(endDate);
            newEndDate.setHours(parseInt(hours), parseInt(minutes), 0);
            setEndTime(newEndDate.toISOString());
        }
    }, [endDate, endTimeValue]);

    // Handle duration and time interactions
    useEffect(() => {
        if (!startTime || !endTime) return;

        const startDateTime = new Date(startTime);
        const endDateTime = new Date(endTime);
        
        if (lastUpdated === 'duration') {
            // Duration changed, update end time
            const newEndTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
            setEndDate(newEndTime);
            setEndTimeValue(newEndTime.toTimeString().slice(0, 5));
        } else if (lastUpdated === 'start') {
            // Start time changed, update end time based on duration
            const newEndTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
            setEndDate(newEndTime);
            setEndTimeValue(newEndTime.toTimeString().slice(0, 5));
        } else if (lastUpdated === 'end') {
            // End time changed, update duration
            const newDuration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));
            if (newDuration >= 0) {
                setDuration(newDuration);
            }
        }
    }, [startTime, endTime, duration, lastUpdated]);

    // Handle duration change from toggle group or input
    const handleDurationChange = (newDuration: number) => {
        setLastUpdated('duration');
        setDuration(newDuration);
    };

    // Handle time changes
    const handleStartTimeChange = (value: string) => {
        setLastUpdated('start');
        setStartTimeValue(value);
    };

    const handleEndTimeChange = (value: string) => {
        setLastUpdated('end');
        setEndTimeValue(value);
    };

    const handleStartDateChange = (date: Date | undefined) => {
        setLastUpdated('start');
        setStartDate(date);
        setStartDateOpen(false);
    };

    const handleEndDateChange = (date: Date | undefined) => {
        setLastUpdated('end');
        setEndDate(date);
        setEndDateOpen(false);
    };

    // Call onChange callback when form data changes
    useEffect(() => {
        if (onChange) {
            onChange({
                title,
                description,
                start_time: startTime,
                end_time: endTime,
                status
            });
        }
    }, [title, description, startTime, endTime, status, onChange]);

    return (
        <div className={cn("@container flex flex-col gap-2 text-foreground w-full", className)}>
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <FileText className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Meeting Title</span>
                </div>
                <input 
                    className="w-full min-w-0 text-left hover:bg-secondary rounded-md py-2 px-2 truncate focus:outline-none focus:ring-1 focus:ring-ring" 
                    placeholder="Enter meeting title..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            
            <div className="flex items-start gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] pt-3 text-muted-foreground">
                    <FileText className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Description</span>
                </div>
                <Textarea 
                    className="w-full min-w-0 text-left hover:bg-secondary rounded-md py-2 px-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring min-h-20"
                    placeholder="Enter meeting description..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="flex items-start gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] pt-3 text-muted-foreground">
                    <Clock className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Start Time</span>
                </div>
                <div className="flex gap-4 w-full">
                    <div className="flex flex-col gap-3 flex-1">
                        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="start-date-picker"
                                    className="w-full justify-between font-normal"
                                >
                                    {startDate ? startDate.toLocaleDateString() : "Select date"}
                                    <ChevronDownIcon className="size-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    captionLayout="dropdown"
                                    onSelect={handleStartDateChange}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                        <Input
                            type="time"
                            id="start-time-picker"
                            value={startTimeValue}
                            onChange={(e) => handleStartTimeChange(e.target.value)}
                            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] pt-3 text-muted-foreground">
                    <Clock className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">End Time</span>
                </div>
                <div className="flex gap-4 w-full">
                    <div className="flex flex-col gap-3 flex-1">
                        <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="end-date-picker"
                                    className="w-full justify-between font-normal"
                                >
                                    {endDate ? endDate.toLocaleDateString() : "Select date"}
                                    <ChevronDownIcon className="size-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    captionLayout="dropdown"
                                    onSelect={handleEndDateChange}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                        <Input
                            type="time"
                            id="end-time-picker"
                            value={endTimeValue}
                            onChange={(e) => handleEndTimeChange(e.target.value)}
                            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <Timer className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Duration</span>
                </div>
                <div className="flex items-center gap-4 w-full">
                    <ToggleGroup 
                        variant="outline" 
                        type="single" 
                        value={duration.toString()} 
                        onValueChange={(value) => value && handleDurationChange(Number(value))}
                        className="flex items-center"
                    >
                        <ToggleGroupItem value="15">15</ToggleGroupItem>
                        <ToggleGroupItem value="30">30</ToggleGroupItem>
                        <ToggleGroupItem value="45">45</ToggleGroupItem>
                        <ToggleGroupItem value="60">60</ToggleGroupItem>
                    </ToggleGroup>
                    <InputNumber 
                        value={duration} 
                        onChange={handleDurationChange} 
                        className="w-full" 
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <CheckCircle className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Status</span>
                </div>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}