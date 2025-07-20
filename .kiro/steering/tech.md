# Technology Stack

## Framework & Runtime
- **Next.js 15.3.5** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript 5** - Type-safe JavaScript
- **Node.js** - Runtime environment

## Database & Backend
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - Authentication and user management
- **Server Actions** - Next.js server-side functions for data mutations

## UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Headless UI components for accessibility
- **Shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **next-themes** - Dark/light mode support
- **Geist Font** - Typography

## Data Management
- **TanStack Table** - Advanced table functionality
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **date-fns** - Date manipulation

## Development Tools
- **ESLint** - Code linting
- **pnpm** - Package manager (preferred)
- **TypeScript** - Static type checking

## Common Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm types:generate   # Generate TypeScript types from Supabase schema
```

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_PROJECT_ID` - For type generation