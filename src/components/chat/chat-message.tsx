'use client'

import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { ChatMessage as ChatMessageType, ChatAction } from '@/types/chat'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
  onActionClick?: (action: ChatAction) => void
}

// Loading placeholder component
export function ChatMessageLoading() {
  return (
    <div className="flex gap-1 px-0 py-2">
      <div className="flex flex-col gap-1 max-w-[85%]">
        {/* Loading message bubble */}
        <div className={cn(
          "rounded-lg px-3 py-2 text-sm",
          "bg-muted text-foreground",
          "rounded-bl-sm",
          "flex items-center gap-2"
        )}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </div>
  )
}

export function ChatMessage({ message, onActionClick }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  return (
    <div className={cn(
      "flex gap-1 px-0 py-2",
      isUser && "flex-row-reverse",
      isSystem && "justify-center"
    )}>

      <div className={cn(
        "flex flex-col gap-1 max-w-[85%]",
        isUser && "items-end",
        isSystem && "items-center max-w-full"
      )}>
        {/* Message bubble */}
        <div className={cn(
          "rounded-lg px-3 py-2 text-sm",
          "break-words whitespace-pre-wrap",
          isUser && [
            "bg-primary text-primary-foreground",
            "rounded-br-sm"
          ],
          !isUser && !isSystem && [
            "bg-muted text-foreground",
            "rounded-bl-sm"
          ],
          isSystem && [
            "bg-muted/50 text-muted-foreground text-xs",
            "italic px-4 py-1 rounded-full"
          ]
        )}>
          {message.content}
        </div>

        {/* Timestamp */}
        {!isSystem && (
          <div className={cn(
            "text-xs text-muted-foreground px-1",
            isUser && "text-right"
          )}>
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </div>
        )}

        {/* Function result indicator */}
        {message.functionResult && (
          <div className={cn(
            "text-xs px-2 py-1 rounded-md mt-1",
            message.functionResult.success 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          )}>
            {message.functionResult.success ? '✓ Action completed' : '✗ Action failed'}
          </div>
        )}

        {/* Suggested actions */}
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.suggestedActions.map((action, index) => (
              <button
                key={index}
                className={cn(
                  "text-xs px-2 py-1 rounded-md",
                  "bg-secondary text-secondary-foreground",
                  "hover:bg-secondary/80 transition-colors",
                  "border border-border"
                )}
                onClick={() => onActionClick?.(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 