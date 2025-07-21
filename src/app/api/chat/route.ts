// TODO: Get rid of all the logs and figure out pasing progress and thinking to the client.

import { NextRequest, NextResponse } from 'next/server'
import type { ChatMessage, PageContext } from '@/types/chat'
import Anthropic from '@anthropic-ai/sdk'
import { updateNote, createNote } from '@/app/(app)/workspace/note/_lib/actions'
import { getNote, getNotes } from '@/app/(app)/workspace/note/_lib/queries'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

interface ChatAPIRequest {
  message: string
  context?: PageContext | null
  messages?: ChatMessage[]
}

interface ChatAPIResponse {
  message: string
  actions?: Array<{
    type: 'filter' | 'sort' | 'navigate' | 'create' | 'function_call'
    label: string
    payload: Record<string, unknown>
  }>
  functionResult?: {
    success: boolean
    data?: unknown
    error?: string
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatAPIResponse>> {
  try {
    console.log('🚀 Chat API: Processing new request')
    const body: ChatAPIRequest = await request.json()
    const { message, context, messages = [] } = body

    console.log('📝 User message:', message)
    console.log('📊 Context available:', !!context)
    console.log('💬 Message history length:', messages.length)

    // Validate input
    if (!message || typeof message !== 'string') {
      console.log('❌ Invalid message content received')
      return NextResponse.json(
        { message: 'Invalid message content' },
        { status: 400 }
      )
    }

    // Build context-aware prompt
    const prompt = buildContextualPrompt(message, context || null, messages)

    console.log('🎯 Built prompt for AI')

    const response = await getLLMResponse(prompt, messages)

    console.log('✅ AI response generated successfully')
    return NextResponse.json(response)
  } catch (error) {
    console.error('💥 Chat API error:', error)

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        console.log('🔑 API key configuration error')
        return NextResponse.json(
          { message: 'AI service is not configured. Please check the API key.' },
          { status: 500 }
        )
      }

      console.log('❌ Error details:', error.message)
      return NextResponse.json(
        { message: `Error: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('❌ Unknown error occurred')
    return NextResponse.json(
      { message: 'I apologize, but I encountered an error processing your request. Please try again.' },
      { status: 500 }
    )
  }
}

function buildContextualPrompt(
  message: string,
  context: PageContext | null,
  messages: ChatMessage[]
): string {
  let prompt = `You are a helpful assistant for a contact management application with note-taking capabilities.
The user is asking: "${message}"

You can edit note contents using the text editor tool. When working with notes:
- Use note IDs as file paths (e.g., "note-123" or just "123")
- Use "notes" to list all available notes
- The content is stored as HTML from a rich text editor (Tiptap)
- You can view, edit, create, and modify note content directly
- You can perform multiple operations in sequence (e.g., view a note, edit it, then view it again)

`

  if (context) {
    prompt += `Current context:
- Total items: ${context.totalCount}
- Current filters: ${JSON.stringify(context.currentFilters, null, 2)}
- Current sorting: ${JSON.stringify(context.currentSort, null, 2)}
- Visible data sample: ${JSON.stringify(context.visibleData.slice(0, 3), null, 2)}

`
  } else {
    prompt += `No current page context available.

`
  }

  if (messages.length > 0) {
    prompt += `Recent conversation:
${messages.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

`
  }

  prompt += `Please provide a helpful response. You can directly edit note contents using the text editor tool when users ask to modify, update, or create notes.`

  return prompt
}

// Handle text editor tool operations for notes
async function handleNoteEditorOperation(
  command: string,
  path: string,
  options: Record<string, unknown> = {}
): Promise<string> {
  console.log('🔧 Note Editor Operation:', { command, path, options })
  
  try {
    switch (command) {
      case 'view':
        if (path === 'notes' || path === '.') {
          console.log('📋 Listing all notes')
          const { data: notes, error } = await getNotes({})
          if (error) throw new Error(error.message || 'Unknown database error')
          
          console.log(`📝 Found ${notes.length} notes`)
          return notes.map((note, index) => 
            `${index + 1}: ${note.id} - ${note.title || 'Untitled'} (${note.content?.substring(0, 50) || 'No content'}...)`
          ).join('\n') || 'No notes found.'
        } else {
          const noteId = path.replace(/^note-/, '')
          console.log(`👁️ Viewing note: ${noteId}`)
          const { data: note, error } = await getNote(noteId)
          if (error) throw new Error(error.message || 'Unknown database error')
          if (!note) throw new Error('File not found')
          
          console.log(`📄 Note content length: ${(note.content || '').length} characters`)
          const lines = (note.content || '').split('\n')
          return lines.map((line, index) => `${index + 1}: ${line}`).join('\n')
        }

      case 'str_replace':
        const noteId = path.replace(/^note-/, '')
        const { old_str, new_str } = options as { old_str: string; new_str: string }
        
        console.log(`🔄 Text replacement in note ${noteId}: "${old_str}" → "${new_str}"`)
        
        if (!old_str || new_str === undefined) {
          throw new Error('old_str and new_str are required for str_replace')
        }

        const { data: note, error: fetchError } = await getNote(noteId)
        if (fetchError) throw new Error(fetchError.message || 'Unknown database error')
        if (!note) throw new Error('File not found')

        const content = note.content || ''
        const matches = content.split(old_str).length - 1
        
        console.log(`🔍 Found ${matches} matches for replacement text`)
        
        if (matches === 0) {
          throw new Error('No match found for replacement. Please check your text and try again.')
        }
        if (matches > 1) {
          throw new Error(`Found ${matches} matches for replacement text. Please provide more context to make a unique match.`)
        }

        const newContent = content.replace(old_str, new_str)
        console.log(`💾 Updating note ${noteId} with new content`)
        const { error: updateError } = await updateNote(noteId, { content: newContent })
        if (updateError) throw new Error(updateError)

        console.log('✅ Text replacement completed successfully')
        return 'Successfully replaced text at exactly one location.'

      case 'create':
        const { file_text } = options as { file_text: string }
        const title = path.replace(/^note-/, '').replace(/\.(txt|md|html)$/, '') || undefined
        
        console.log(`📝 Creating new note: "${title || 'Untitled'}"`)
        console.log(`📄 Content length: ${(file_text || '').length} characters`)
        
        const { error: createError, data: newNote } = await createNote({
          title: title,
          content: file_text || '',
        })
        if (createError) throw new Error(createError)

        console.log('✅ Note created successfully')
        return `Successfully created new note${title ? ` "${title}"` : ''} with ID: ${newNote?.id || 'unknown'}.`

      case 'insert':
        const insertNoteId = path.replace(/^note-/, '')
        const { insert_line, new_str: insertText } = options as { insert_line: number; new_str: string }
        
        console.log(`📎 Inserting text at line ${insert_line} in note ${insertNoteId}`)
        
        if (insertText === undefined) {
          throw new Error('new_str is required for insert')
        }

        const { data: insertNote, error: insertFetchError } = await getNote(insertNoteId)
        if (insertFetchError) throw new Error(insertFetchError.message || 'Unknown database error')
        if (!insertNote) throw new Error('File not found')

        const currentContent = insertNote.content || ''
        const lines = currentContent.split('\n')
        
        console.log(`📊 Current note has ${lines.length} lines`)
        
        const insertIndex = Math.max(0, Math.min(insert_line, lines.length))
        lines.splice(insertIndex, 0, insertText)
        
        const updatedContent = lines.join('\n')
        console.log(`💾 Updating note ${insertNoteId} with inserted text`)
        const { error: insertUpdateError } = await updateNote(insertNoteId, { content: updatedContent })
        if (insertUpdateError) throw new Error(insertUpdateError)

        console.log('✅ Text insertion completed successfully')
        return `Successfully inserted text at line ${insert_line}.`

      default:
        console.log(`❌ Unsupported command: ${command}`)
        throw new Error(`Unsupported command: ${command}`)
    }
  } catch (error) {
    console.error('💥 Note editor operation error:', error)
    throw error
  }
}

async function getLLMResponse(prompt: string, messages: ChatMessage[]): Promise<ChatAPIResponse> {
  try {
    console.log('🤖 Starting conversation with Claude...')
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }

    // Convert ChatMessage[] to Anthropic message format
    const conversationMessages: Anthropic.MessageParam[] = [
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: prompt
      }
    ]

    console.log(`💬 Starting with ${conversationMessages.length} messages`)

    const MAX_ITERATIONS = 10 // Prevent infinite loops
    let iteration = 0
    const allToolResults: Array<{ operation: string; path: string; result: string }> = []
    
    while (iteration < MAX_ITERATIONS) {
      iteration++
      console.log(`🔄 Conversation iteration ${iteration}`)

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        tools: [
          {
            type: "text_editor_20250429",
            name: "str_replace_based_edit_tool"
          },
          // {
          //   type: "web_search_20250305",
          //   name: "web_search",
          //   max_uses: 5
          // }
        ],
        messages: conversationMessages,
      })

      console.log(`📨 Received response from Claude (iteration ${iteration})`)

      // Log chain of thought if present
      const textBlocks = response.content.filter(content => content.type === 'text')
      if (textBlocks.length > 0) {
        const thinkingContent = textBlocks.map(block => block.text).join('\n')
        if (thinkingContent.includes('<thinking>') || thinkingContent.includes('thinking')) {
          console.log('🧠 Chain of thought detected:')
          console.log(thinkingContent)
        } else {
          console.log('💭 No chain of thought detected in this response')
        }
      } else {
        console.log('💭 No text content (and therefore no chain of thought) in this response')
      }

      // Check if Claude used any tools
      const toolUses = response.content.filter(content => content.type === 'tool_use')
      
      if (toolUses.length === 0) {
        // No more tools to execute, return the final response
        console.log('✅ Claude provided final response (no more tools)')
        const content = response.content.find(c => c.type === 'text')?.text || ''
        
        return {
          message: content || 'Operation completed successfully!',
          functionResult: allToolResults.length > 0 ? {
            success: true,
            data: { 
              totalOperations: allToolResults.length,
              operations: allToolResults 
            }
          } : undefined,
          actions: []
        }
      }

      // Execute all tool calls in this response
      console.log(`🔧 Claude wants to execute ${toolUses.length} tool(s)`)
      
      // Add Claude's response to conversation
      conversationMessages.push({
        role: 'assistant',
        content: response.content
      })

      // Execute each tool and collect results
      const toolResults: Anthropic.MessageParam['content'] = []
      
      for (const toolUse of toolUses) {
        if (toolUse.type === 'tool_use') {
          console.log(`⚡ Executing tool: ${toolUse.name}`)
          console.log('📋 Tool input:', toolUse.input)
          console.log('Full toolUse:', JSON.stringify(toolUse, null, 2))
          
          try {
            const input = toolUse.input as Record<string, unknown>
            const command = input.command as string
            const path = input.path as string
            
            const toolResult = await handleNoteEditorOperation(command, path, input)
            console.log(`✅ Tool executed successfully: ${command} on ${path}`)
            
            // Track this operation
            allToolResults.push({ operation: command, path, result: toolResult })
            
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: toolResult
            })
          } catch (error) {
            console.error(`💥 Tool execution failed:`, error)
            
            // Improved error handling with more specific messages
            let errorMessage = 'Unknown error occurred'
            if (error instanceof Error) {
              if (error.message.includes('File not found')) {
                errorMessage = 'File not found'
              } else if (error.message.includes('No match found')) {
                errorMessage = 'No match found for replacement. Please check your text and try again.'
              } else if (error.message.includes('Found') && error.message.includes('matches')) {
                errorMessage = error.message
              } else if (error.message.includes('Permission denied') || error.message.includes('Cannot write')) {
                errorMessage = 'Permission denied. Cannot write to file.'
              } else {
                errorMessage = error.message
              }
            }
            
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: `Error: ${errorMessage}`,
              is_error: true
            })
          }
        }
      }

      // Add tool results to conversation
      conversationMessages.push({
        role: 'user',
        content: toolResults
      })

      console.log(`📝 Added ${toolResults.length} tool result(s) to conversation`)
      
      // Continue the loop to see if Claude wants to do more
    }

    // If we hit the max iterations, return what we have
    console.log(`⚠️ Reached maximum iterations (${MAX_ITERATIONS})`)
    return {
      message: 'Operations completed (maximum iterations reached). Please check the results.',
      functionResult: {
        success: true,
        data: { 
          totalOperations: allToolResults.length,
          operations: allToolResults,
          note: 'Reached maximum conversation iterations'
        }
      },
      actions: []
    }

  } catch (error) {
    console.error('💥 Anthropic API error:', error)
    throw new Error('Failed to get response from Anthropic API')
  }
}