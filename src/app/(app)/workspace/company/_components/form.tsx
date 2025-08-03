"use client";

import { Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Tiptap from "@/components/tiptap/tiptap";

export interface CompanyFormProps {
    /**
     * Initial company name value
     */
    initialName?: string;
    /**
     * Initial description value
     */
    initialDescription?: string;
    /**
     * Callback fired when form data changes
     */
    onChange?: (data: {
        name: string;
        description: string;
    }) => void;
    /**
     * Custom CSS class name
     */
    className?: string;
}

export default function CompanyForm({
    initialName = "",
    initialDescription = "",
    onChange,
    className
}: CompanyFormProps = {}) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);

    // Call onChange callback when form data changes
    useEffect(() => {
        if (onChange) {
            onChange({
                name,
                description
            });
        }
    }, [name, description, onChange]);

    return (
        <div className={cn("@container flex flex-col gap-2 text-foreground w-full", className)}>
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] text-muted-foreground">
                    <Building2 className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Name</span>
                </div>
                <input 
                    className="w-full min-w-0 text-left hover:bg-secondary rounded-md py-2 px-2 truncate focus:outline-none focus:ring-1 focus:ring-ring" 
                    placeholder="Enter company name..." 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            
            <div className="flex items-start gap-2 justify-between">
                {/* <div className="flex items-center gap-2 text-sm @max-sm:w-8 w-[10rem] pt-3 text-muted-foreground">
                    <Pilcrow className="size-4 shrink-0" strokeWidth={1.5} />
                    <span className="whitespace-nowrap @max-sm:hidden">Description</span>
                </div> */}
                <div className="w-full">
                    <Tiptap 
                        content={description}
                        onChange={(content) => setDescription(content)}
                    />
                </div>
            </div>
        </div>
    );
}