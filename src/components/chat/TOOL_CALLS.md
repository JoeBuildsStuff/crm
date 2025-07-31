# Tool Calls in Chat System

This document explains how to use tool calls in the chat system to display tool execution information between messages.

## Overview

Tool calls allow you to show what tools were called, their arguments, and their results. This provides transparency into the AI's decision-making process and helps users understand what actions were taken.

## Types

### ToolCall Interface

```typescript
interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: {
    success: boolean
    data?: unknown
    error?: string
  }
}
```

### Updated ChatMessage Interface

```typescript
interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  context?: {
    filters?: Record<string, unknown>
    data?: Record<string, unknown>
  }
  suggestedActions?: ChatAction[]
  functionResult?: {
    success: boolean
    data?: unknown
    error?: string
  }
  toolCalls?: ToolCall[] // New field
}
```

## Usage

### 1. Creating Tool Calls

Use the utility function to create tool calls:

```typescript
import { createToolCall } from '@/lib/chat/utils'

const toolCall = createToolCall('web_search', {
  query: 'React hooks',
  max_results: 5
})
```

### 2. Adding Tool Calls to Messages

```typescript
import { useChatStore } from '@/lib/chat/chat-store'

const { addToolCalls } = useChatStore()

// Add tool calls to a specific message
addToolCalls(messageId, [toolCall1, toolCall2])
```

### 3. Updating Tool Call Results

```typescript
import { updateToolCallResult } from '@/lib/chat/utils'

const { updateToolCallResult } = useChatStore()

// Update a tool call with its result
updateToolCallResult(messageId, toolCallId, {
  success: true,
  data: { results: [...] }
})
```

### 4. API Integration

In your API route, include tool calls in the response:

```typescript
// In your chat API route
return NextResponse.json({
  message: 'Response content',
  toolCalls: [
    {
      id: 'tool-1',
      name: 'web_search',
      arguments: { query: 'React hooks' },
      result: {
        success: true,
        data: { results: [...] }
      }
    }
  ]
})
```

## Display

Tool calls are automatically displayed in the chat message component with:

- **Collapsible sections** for each tool call
- **Tool name** and **status badge** (Success/Failed)
- **Arguments** displayed as formatted JSON
- **Results** displayed as formatted JSON
- **Copy buttons** for both arguments and results
- **Error handling** for failed tool calls

## Example Flow

1. User sends a message asking for information
2. AI decides to use tools (web search, database query, etc.)
3. Tool calls are created and added to the assistant's message
4. Tools are executed and results are updated
5. Users can expand tool call sections to see what was done

## Best Practices

1. **Always include tool calls** when your AI uses external tools
2. **Provide meaningful tool names** that users can understand
3. **Format arguments and results** clearly for readability
4. **Handle errors gracefully** and show meaningful error messages
5. **Use consistent tool naming** across your application

## Integration with Existing Chat

The tool call system integrates seamlessly with your existing chat components:

- Tool calls appear between messages
- They don't interfere with message actions (copy, edit, retry)
- They preserve the chat flow and conversation history
- They work with all existing chat features 