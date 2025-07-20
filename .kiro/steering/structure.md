# Project Structure

## Architecture Patterns

### App Router Structure
- Uses Next.js App Router with route groups for organization
- `(auth)` - Authentication-related pages (signin, signup, password reset)
- `(app)` - Main application pages requiring authentication

### Feature-Based Organization
Each workspace entity (company, person, task, meeting, note) follows consistent structure:
```
workspace/[entity]/
├── _components/          # Entity-specific UI components
│   ├── columns.tsx      # Table column definitions
│   ├── form.tsx         # Create/edit forms
│   ├── form-wrapper.tsx # Form modal wrapper
│   └── table.tsx        # Data table implementation
├── _lib/                # Entity business logic
│   ├── actions.ts       # Server actions (CRUD operations)
│   ├── queries.ts       # Data fetching functions
│   └── validations.ts   # Type definitions and schemas
└── page.tsx             # Main page component
```

## Directory Structure

### `/src/app/`
- **Route groups** for logical separation
- **Server components** by default
- **Page components** handle routing and layout

### `/src/components/`
- **`ui/`** - Reusable UI primitives (buttons, inputs, etc.)
- **`data-table/`** - Advanced table components with CRUD operations
- **Root level** - Application-specific components (sidebar, auth, etc.)

### `/src/lib/`
- **`supabase/`** - Database client configurations
- **`utils.ts`** - Utility functions (cn for className merging)
- **`data-table.ts`** - Table state management utilities

### `/src/hooks/`
- Custom React hooks for user data and responsive behavior

### `/src/types/`
- **`supabase.ts`** - Auto-generated database types

## Naming Conventions

### Files
- **kebab-case** for file names (`data-table-toolbar.tsx`)
- **PascalCase** for component files when exported as default
- **camelCase** for utility files

### Components
- **PascalCase** for component names
- **Descriptive prefixes** (`DataTable`, `AppSidebar`)

### Server Actions
- **Async functions** with descriptive names (`createCompany`, `updateCompany`)
- **Consistent return format** `{ success: boolean, error?: string, data?: T }`

## Code Organization Principles

### Separation of Concerns
- **Actions** handle server-side mutations
- **Queries** handle data fetching
- **Components** handle UI rendering
- **Validations** define types and schemas

### Reusability
- **UI components** are generic and reusable
- **Data table** system works across all entities
- **Form patterns** are consistent across features

### Type Safety
- **TypeScript** throughout the application
- **Generated types** from Supabase schema
- **Zod schemas** for runtime validation