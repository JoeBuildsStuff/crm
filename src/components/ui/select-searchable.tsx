"use client";

import { Check, Plus, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export interface SelectSearchableOption {
    id: string;
    label: string;
    searchValue?: string; // Optional custom search value
}

export interface SelectSearchableProps {
    /**
     * Currently selected value (option id)
     */
    value?: string;
    /**
     * Callback when selection changes
     */
    onValueChange?: (value: string) => void;
    /**
     * Available options to select from
     */
    options?: SelectSearchableOption[];
    /**
     * Placeholder text when no option is selected
     */
    placeholder?: string;
    /**
     * Placeholder text for search input
     */
    searchPlaceholder?: string;
    /**
     * Text shown when no options match search
     */
    emptyText?: string;
    /**
     * Custom CSS class name
     */
    className?: string;
    /**
     * Whether to show selected option as a badge
     */
    showBadge?: boolean;
    /**
     * Badge variant when showBadge is true
     */
    badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "blue" | "gray" | "green" | "red" | "yellow" | "orange" | "amber" | "indigo" | "purple" | "pink";
    /**
     * Whether to allow creating new options
     */
    allowCreate?: boolean;
    /**
     * Text for create button
     */
    createText?: string;
    /**
     * Callback when create button is clicked
     */
    onCreateClick?: () => void;
    /**
     * Whether the popover is open (controlled)
     */
    open?: boolean;
    /**
     * Callback when popover open state changes (controlled)
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * Whether to make the badge clickable to navigate to the record
     */
    allowBadgeNavigation?: boolean;
    /**
     * The route prefix for navigation (e.g., "/workspace/person" for person records)
     */
    navigationRoute?: string;
}

export default function SelectSearchable({
    value = "",
    onValueChange,
    options = [],
    placeholder = "Select option...",
    searchPlaceholder = "Search options...",
    emptyText = "No option found.",
    className,
    showBadge = true,
    badgeVariant = "outline",
    allowCreate = false,
    createText = "Add Option",
    onCreateClick,
    open,
    onOpenChange,
    allowBadgeNavigation = false,
    navigationRoute
}: SelectSearchableProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const router = useRouter();
    
    const isOpen = open !== undefined ? open : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    const selectedOption = options.find(option => option.id === value);

    const handlePopoverKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === "BUTTON") {
                // If a button is focused, click it
                (activeElement as HTMLButtonElement).click();
            } else {
                // Otherwise, close the popover
                setIsOpen(false);
            }
        }
    };

    const handleSelect = (optionId: string) => {
        const newValue = value === optionId ? "" : optionId;
        onValueChange?.(newValue);
        setIsOpen(false);
    };

    const handleBadgeClick = (e: React.MouseEvent) => {
        if (allowBadgeNavigation && navigationRoute && selectedOption) {
            e.preventDefault();
            e.stopPropagation();
            router.push(`${navigationRoute}/${selectedOption.id}`);
        }
    };


    // TODO We need to make a badge that is a link and has an arrow that expands when hovered
    const getArrowColorClass = (variant: string) => {
        switch (variant) {
            case "blue":
                return "text-blue-600 dark:text-blue-400";
            case "green":
                return "text-green-600 dark:text-green-400";
            case "red":
                return "text-red-600 dark:text-red-400";
            case "yellow":
                return "text-yellow-600 dark:text-yellow-400";
            case "orange":
                return "text-orange-600 dark:text-orange-400";
            case "amber":
                return "text-amber-600 dark:text-amber-400";
            case "indigo":
                return "text-indigo-600 dark:text-indigo-400";
            case "purple":
                return "text-purple-600 dark:text-purple-400";
            case "pink":
                return "text-pink-600 dark:text-pink-400";
            case "gray":
                return "text-gray-600 dark:text-gray-400";
            case "destructive":
                return "text-destructive";
            case "secondary":
                return "text-secondary-foreground";
            case "default":
                return "text-primary-foreground";
            case "outline":
            default:
                return "text-muted-foreground";
        }
    };

    return (
        <div className={cn("w-full min-w-0", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger className={cn(
                    "w-full text-left hover:bg-secondary rounded-md py-2 px-2 truncate",
                    !value && "text-muted-foreground/80"
                )}>
                    {selectedOption ? (
                        showBadge ? (
                            allowBadgeNavigation && navigationRoute ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 hover:bg-transparent group -ml-2"
                                    onClick={handleBadgeClick}
                                >
                                    <Badge 
                                        variant={badgeVariant} 
                                        className="text-sm cursor-pointer transition-all duration-200 group-hover:pr-6"
                                    >
                                        {selectedOption.label}
                                    </Badge>
                                    <ArrowUpRight className={`size-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-7 ${getArrowColorClass(badgeVariant)}`} />
                                </Button>
                            ) : (
                                <Badge variant={badgeVariant} className="text-sm">
                                    {selectedOption.label}
                                </Badge>
                            )
                        ) : (
                            selectedOption.label
                        )
                    ) : (
                        placeholder
                    )}
                </PopoverTrigger>
                <PopoverContent 
                    className="p-0 rounded-xl" 
                    align="start"
                    onKeyDown={handlePopoverKeyDown}
                >
                    <Command className="w-full rounded-xl">
                        <CommandInput placeholder={searchPlaceholder} />
                        <ScrollArea className="h-60 pr-2">
                            <CommandList className="max-h-none overflow-hidden">
                                <CommandEmpty>{emptyText}</CommandEmpty>
                                <CommandGroup>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.id}
                                            value={option.searchValue || option.label}
                                            onSelect={() => handleSelect(option.id)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === option.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </ScrollArea>
                        {allowCreate && onCreateClick && (
                            <>
                                <CommandSeparator />
                                <div className="p-1 h-9">
                                    <Button 
                                        variant="secondary" 
                                        size="sm"
                                        className="w-full h-full justify-start rounded-t-none text-muted-foreground"
                                        onClick={() => {
                                            setIsOpen(false);
                                            onCreateClick();
                                        }}
                                    >
                                        <Plus className="size-4 shrink-0" strokeWidth={1.5} />
                                        <span className="text-xs">{createText}</span>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}