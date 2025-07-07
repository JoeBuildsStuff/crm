"use client"

import {
  ChevronsUpDown,
  Laptop2,
  LogIn,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CurrentUserAvatar } from "@/components/current-user-avatar"
import { useCurrentUserName } from "@/hooks/use-current-user-name"
import { useCurrentUserEmail } from "@/hooks/use-current-user-email"

export function AuthButton() {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const userName = useCurrentUserName()
  const userEmail = useCurrentUserEmail()

  // Check if user is authenticated
  const isAuthenticated = userEmail !== 'Anonymous'

  // Get icon for current theme
  const getThemeIcon = (currentTheme: string | undefined) => {
    switch (currentTheme) {
      case 'light':
        return <Sun className="size-4 shrink-0 text-muted-foreground" />
      case 'dark':
        return <Moon className="size-4 shrink-0 text-muted-foreground" />
      case 'system':
        return <Laptop2 className="size-4 shrink-0 text-muted-foreground" />
      default:
        return <Laptop2 className="size-4 shrink-0" />
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <CurrentUserAvatar />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <CurrentUserAvatar />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="truncate text-xs">{userEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 justify-between">
              {getThemeIcon(theme)}
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-[12rem]">
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light" className="flex items-center gap-2 justify-between"><span>Light</span> <Sun className="size-4 shrink-0 text-muted-foreground" /></DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" className="flex items-center gap-2 justify-between"><span>Dark</span> <Moon className="size-4 shrink-0 text-muted-foreground" /></DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system" className="flex items-center gap-2 justify-between"><span>System</span> <Laptop2 className="size-4 shrink-0 text-muted-foreground" /></DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
            <DropdownMenuItem>
              {isAuthenticated ? <LogOut /> : <LogIn />}
              {isAuthenticated ? 'Log out' : 'Login'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
