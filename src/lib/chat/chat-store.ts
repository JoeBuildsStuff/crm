import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: {
    success: boolean
    data?: unknown
    error?: string
  }
}

export interface ChatMessage {
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
  toolCalls?: ToolCall[]
}

export interface ChatAction {
  type: 'filter' | 'sort' | 'navigate' | 'create' | 'function_call'
  label: string
  payload: Record<string, unknown>
}

export interface PageContext {
  currentFilters: Record<string, unknown>
  currentSort: Record<string, unknown>
  visibleData: Record<string, unknown>[]
  totalCount: number
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  context?: PageContext
}

export interface ChatSessionSummary {
  id: string
  title: string
  lastMessage: string
  messageCount: number
  createdAt: Date
  updatedAt: Date
}

interface ChatStore {
  // Session management
  sessions: ChatSession[]
  currentSessionId: string | null

  // UI State
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  isLoading: boolean
  showHistory: boolean
  currentContext: PageContext | null
  layoutMode: 'floating' | 'inset'

  // Computed properties (will be updated whenever state changes)
  currentSession: ChatSession | null
  messages: ChatMessage[]

  // Session CRUD operations
  createSession: (title?: string) => string
  switchToSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
  updateSessionTitle: (sessionId: string, title: string) => void
  getSessions: () => ChatSessionSummary[]

  // Message CRUD operations (operate on current session)
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  deleteMessage: (id: string) => void
  clearMessages: () => void
  
  // Message actions
  copyMessage: (messageId: string) => void
  editMessage: (messageId: string, newContent: string) => void
  retryMessage: (messageId: string, onRetry?: (content: string) => void) => void
  addToolCalls: (messageId: string, toolCalls: ToolCall[]) => void
  updateToolCallResult: (messageId: string, toolCallId: string, result: ToolCall['result']) => void

  // UI State
  setOpen: (open: boolean) => void
  setMinimized: (minimized: boolean) => void
  setMaximized: (maximized: boolean) => void
  setLoading: (loading: boolean) => void
  toggleChat: () => void
  setShowHistory: (show: boolean) => void
  setLayoutMode: (mode: 'floating' | 'inset') => void

  // Context management
  updatePageContext: (context: PageContext) => void

  // Utility
  getUnreadCount: () => number
}

// Helper function to compute current session and messages
const computeCurrentSessionAndMessages = (sessions: ChatSession[], currentSessionId: string | null) => {
  const currentSession = sessions.find(s => s.id === currentSessionId) || null
  const messages = currentSession?.messages || []
  return { currentSession, messages }
}

// Helper function to generate session title
const generateSessionTitle = (messages: ChatMessage[]): string => {
  if (messages.length === 0) return 'New Chat'

  const firstUserMessage = messages.find(m => m.role === 'user')
  if (firstUserMessage) {
    // Truncate to 30 characters
    const title = firstUserMessage.content.slice(0, 30)
    return title.length < firstUserMessage.content.length ? `${title}...` : title
  }

  return 'New Chat'
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: [],
      currentSessionId: null,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      isLoading: false,
      showHistory: false,
      currentContext: null,
      currentSession: null,
      messages: [],
      layoutMode: 'floating',

      // Session CRUD operations
      createSession: (title?: string) => {
        const sessionId = crypto.randomUUID()
        const now = new Date()

        const newSession: ChatSession = {
          id: sessionId,
          title: title || 'New Chat',
          messages: [],
          createdAt: now,
          updatedAt: now,
        }

        set((state) => {
          const newSessions = [newSession, ...state.sessions]
          const { currentSession, messages } = computeCurrentSessionAndMessages(newSessions, sessionId)

          return {
            sessions: newSessions,
            currentSessionId: sessionId,
            currentSession,
            messages,
            showHistory: false,
          }
        })

        return sessionId
      },

      switchToSession: (sessionId) => {
        set((state) => {
          const { currentSession, messages } = computeCurrentSessionAndMessages(state.sessions, sessionId)

          return {
            currentSessionId: sessionId,
            currentSession,
            messages,
            showHistory: false,
          }
        })
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const newSessions = state.sessions.filter(s => s.id !== sessionId)
          const newCurrentId = state.currentSessionId === sessionId
            ? (newSessions[0]?.id || null)
            : state.currentSessionId

          const { currentSession, messages } = computeCurrentSessionAndMessages(newSessions, newCurrentId)

          return {
            sessions: newSessions,
            currentSessionId: newCurrentId,
            currentSession,
            messages,
          }
        })
      },

      updateSessionTitle: (sessionId, title) => {
        set((state) => {
          const updatedSessions = state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, title, updatedAt: new Date() }
              : s
          )

          const { currentSession, messages } = computeCurrentSessionAndMessages(updatedSessions, state.currentSessionId)

          return {
            sessions: updatedSessions,
            currentSession,
            messages,
          }
        })
      },

      getSessions: () => {
        const { sessions } = get()
        return sessions.map(session => ({
          id: session.id,
          title: session.title,
          lastMessage: session.messages[session.messages.length - 1]?.content || '',
          messageCount: session.messages.length,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        }))
      },

      // Message CRUD operations
      addMessage: (messageData) => {
        const message: ChatMessage = {
          ...messageData,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }

        set((state) => {
          // Create a session if none exists
          let currentSessionId = state.currentSessionId
          let sessions = state.sessions

          if (!currentSessionId || !sessions.find(s => s.id === currentSessionId)) {
            const sessionId = crypto.randomUUID()
            const now = new Date()

            const newSession: ChatSession = {
              id: sessionId,
              title: 'New Chat',
              messages: [],
              createdAt: now,
              updatedAt: now,
            }

            sessions = [newSession, ...sessions]
            currentSessionId = sessionId
          }

          // Update the current session with the new message
          const updatedSessions = sessions.map(session => {
            if (session.id === currentSessionId) {
              const updatedMessages = [...session.messages, message]
              return {
                ...session,
                messages: updatedMessages,
                title: session.title === 'New Chat' ? generateSessionTitle(updatedMessages) : session.title,
                updatedAt: new Date(),
              }
            }
            return session
          })

          const { currentSession, messages } = computeCurrentSessionAndMessages(updatedSessions, currentSessionId)

          return {
            sessions: updatedSessions,
            currentSessionId,
            currentSession,
            messages,
          }
        })

        return message.id
      },

      updateMessage: (id, updates) => {
        set((state) => {
          const updatedSessions = state.sessions.map(session =>
            session.id === state.currentSessionId
              ? {
                ...session,
                messages: session.messages.map(msg =>
                  msg.id === id ? { ...msg, ...updates } : msg
                ),
                updatedAt: new Date(),
              }
              : session
          )

          const { currentSession, messages } = computeCurrentSessionAndMessages(updatedSessions, state.currentSessionId)

          return {
            sessions: updatedSessions,
            currentSession,
            messages,
          }
        })
      },

      deleteMessage: (id) => {
        set((state) => {
          const updatedSessions = state.sessions.map(session =>
            session.id === state.currentSessionId
              ? {
                ...session,
                messages: session.messages.filter(msg => msg.id !== id),
                updatedAt: new Date(),
              }
              : session
          )

          const { currentSession, messages } = computeCurrentSessionAndMessages(updatedSessions, state.currentSessionId)

          return {
            sessions: updatedSessions,
            currentSession,
            messages,
          }
        })
      },

      clearMessages: () => {
        set((state) => {
          const updatedSessions = state.sessions.map(session =>
            session.id === state.currentSessionId
              ? {
                ...session,
                messages: [],
                updatedAt: new Date(),
              }
              : session
          )

          const { currentSession, messages } = computeCurrentSessionAndMessages(updatedSessions, state.currentSessionId)

          return {
            sessions: updatedSessions,
            currentSession,
            messages,
          }
        })
      },

      copyMessage: (messageId) => {
        const state = get()
        const message = state.messages.find(msg => msg.id === messageId)
        if (message) {
          navigator.clipboard.writeText(message.content).catch(console.error)
        }
      },

      editMessage: (messageId, newContent) => {
        set((state) => {
          const updatedSessions = state.sessions.map(session =>
            session.id === state.currentSessionId
              ? {
                ...session,
                messages: session.messages.map(msg =>
                  msg.id === messageId ? { ...msg, content: newContent } : msg
                ),
                updatedAt: new Date(),
              }
              : session
          )

          const { currentSession, messages } = computeCurrentSessionAndMessages(updatedSessions, state.currentSessionId)

          return {
            sessions: updatedSessions,
            currentSession,
            messages,
          }
        })
      },

      retryMessage: (messageId, onRetry) => {
        const state = get()
        const message = state.messages.find(msg => msg.id === messageId)
        if (message && message.role === 'user') {
          // Remove the user message and its assistant response
          const messageIndex = state.messages.findIndex(msg => msg.id === messageId)
          if (messageIndex !== -1) {
            set((state) => {
              const updatedSessions = state.sessions.map(session =>
                session.id === state.currentSessionId
                  ? {
                    ...session,
                    messages: session.messages.filter((_, index) => index < messageIndex),
                    updatedAt: new Date(),
                  }
                  : session
              )

              const { currentSession, messages } = computeCurrentSessionAndMessages(updatedSessions, state.currentSessionId)

              return {
                sessions: updatedSessions,
                currentSession,
                messages,
              }
            })

            // Call the retry callback if provided, otherwise just add the message back
            if (onRetry) {
              onRetry(message.content)
            } else {
              // Fallback: add the message back to trigger a new API call
              setTimeout(() => {
                const { addMessage } = useChatStore.getState()
                addMessage({
                  role: 'user',
                  content: message.content,
                  context: message.context
                })
              }, 100)
            }
          }
        }
      },

      addToolCalls: (messageId, toolCalls) => {
        set((state) => {
          const updatedSessions = state.sessions.map(session =>
            session.id === state.currentSessionId
              ? {
                ...session,
                messages: session.messages.map(msg =>
                  msg.id === messageId
                    ? {
                      ...msg,
                      toolCalls: [...(msg.toolCalls || []), ...toolCalls],
                      updatedAt: new Date(),
                    }
                    : msg
                ),
              }
              : session
          )

          const { currentSession, messages } = computeCurrentSessionAndMessages(updatedSessions, state.currentSessionId)

          return {
            sessions: updatedSessions,
            currentSession,
            messages,
          }
        })
      },

      updateToolCallResult: (messageId, toolCallId, result) => {
        set((state) => {
          const updatedSessions = state.sessions.map(session =>
            session.id === state.currentSessionId
              ? {
                ...session,
                messages: session.messages.map(msg =>
                  msg.id === messageId
                    ? {
                      ...msg,
                      toolCalls: msg.toolCalls?.map(tc =>
                        tc.id === toolCallId ? { ...tc, result } : tc
                      ),
                      updatedAt: new Date(),
                    }
                    : msg
                ),
              }
              : session
          )

          const { currentSession, messages } = computeCurrentSessionAndMessages(updatedSessions, state.currentSessionId)

          return {
            sessions: updatedSessions,
            currentSession,
            messages,
          }
        })
      },

      // UI State
      setOpen: (open) => {
        set({ isOpen: open, isMinimized: open ? false : get().isMinimized, isMaximized: open ? get().isMaximized : false })
      },

      setMinimized: (minimized) => {
        set({ isMinimized: minimized, isOpen: minimized ? false : get().isOpen, isMaximized: minimized ? false : get().isMaximized })
      },

      setMaximized: (maximized) => {
        set({ isMaximized: maximized, isOpen: maximized ? true : get().isOpen, isMinimized: maximized ? false : get().isMinimized })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      toggleChat: () => {
        const { isOpen, isMaximized } = get()
        if (!isOpen) {
          // Open in normal mode
          set({ isOpen: true, isMinimized: false, isMaximized: false })
        } else if (!isMaximized) {
          // Maximize
          set({ isMaximized: true, isMinimized: false })
        } else {
          // Close
          set({ isOpen: false, isMinimized: false, isMaximized: false })
        }
      },

      setShowHistory: (show) => {
        set({ showHistory: show })
      },

      setLayoutMode: (mode) => {
        set({
          layoutMode: mode,
          isMaximized: mode === 'inset',
          isMinimized: false,
          isOpen: true
        })
      },

      // Context management
      updatePageContext: (context) => {
        set({ currentContext: context })
      },

      // Utility
      getUnreadCount: () => {
        // For now, return 0. This can be enhanced with read/unread tracking
        return 0
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist sessions with serialized dates
      partialize: (state) => ({
        sessions: state.sessions.slice(0, 10).map(session => ({
          ...session,
          messages: session.messages.slice(-50).map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })),
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        })), // Keep last 10 sessions
        currentSessionId: state.currentSessionId,
        layoutMode: state.layoutMode,
      }),
      // Transform dates back when loading from storage
      onRehydrateStorage: () => (state) => {
        if (state?.sessions) {
          state.sessions = state.sessions.map(session => ({
            ...session,
            messages: session.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp as unknown as string)
            })),
            createdAt: new Date(session.createdAt as unknown as string),
            updatedAt: new Date(session.updatedAt as unknown as string),
          }))

          // Recompute current session and messages after rehydration
          if (state.currentSessionId) {
            const { currentSession, messages } = computeCurrentSessionAndMessages(state.sessions, state.currentSessionId)
            state.currentSession = currentSession
            state.messages = messages
          }
        }
      },
    }
  )
) 