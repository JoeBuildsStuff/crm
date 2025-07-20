import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { ChatProvider } from '@/components/chat/chat-provider'


export function Providers({ children }: { children: ReactNode }) {

  return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ChatProvider>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </ChatProvider>
      </ThemeProvider>
  )
}