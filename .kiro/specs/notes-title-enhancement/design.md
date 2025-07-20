# Design Document

## Overview

The notes title enhancement adds a title field to the existing notes functionality. This involves database schema changes, TypeScript type updates, form modifications, and table display updates. The implementation follows the existing patterns in the CRM application for consistency and maintainability.

## Architecture

### Database Layer
- Add `title` column to the `notes` table in Supabase
- Column will be optional (nullable) to maintain backward compatibility
- Use `text` type with reasonable length constraints

### Application Layer
- Update TypeScript types from Supabase schema generation
- Modify Zod validation schemas to include title field
- Update server actions for create/update operations
- Enhance UI components to display and edit titles

### UI Layer
- Add title input field to note creation/editing forms
- Update notes table to display title as primary column
- Implement fallback display logic for notes without titles
- Maintain existing responsive design patterns

## Components and Interfaces

### Database Schema Changes
```sql
ALTER TABLE notes ADD COLUMN title text;
```

### TypeScript Type Updates
The existing `Database` type in `src/types/supabase.ts` will be updated via type generation to include:
```typescript
notes: {
  // existing fields...
  title: string | null
}
```

### Validation Schema Updates
Update `src/app/(app)/workspace/note/_lib/validations.ts`:
```typescript
export const noteSchema = z.object({
  title: z.string().max(255, "Title must be 255 characters or less").optional(),
  content: z.string().min(1, "Content is required"),
  // existing fields...
})
```

### Form Component Updates
Modify `src/app/(app)/workspace/note/_components/form.tsx`:
- Add title input field as first form element
- Implement proper form validation and error display
- Maintain existing form patterns and styling

### Table Component Updates
Update `src/app/(app)/workspace/note/_components/columns.tsx`:
- Add title column as first data column
- Implement display logic: show title if present, otherwise show content preview
- Add sorting capability for title column
- Update existing content column to be secondary

### Server Actions Updates
Modify `src/app/(app)/workspace/note/_lib/actions.ts`:
- Update create and update functions to handle title field
- Ensure proper validation and error handling
- Maintain existing success/error response patterns

## Data Models

### Note Model Structure
```typescript
interface Note {
  id: string
  title: string | null          // New field
  content: string
  meeting_id: string | null
  contact_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}
```

### Form Data Structure
```typescript
interface NoteFormData {
  title?: string                 // New optional field
  content: string
  meeting_id?: string
  contact_id?: string
}
```

## Error Handling

### Validation Errors
- Title length validation (max 255 characters)
- Display validation errors inline with form fields
- Prevent form submission with invalid data

### Database Errors
- Handle constraint violations gracefully
- Provide user-friendly error messages
- Maintain existing error handling patterns

### Fallback Behavior
- Display content preview when title is null/empty
- Graceful degradation for existing notes without titles
- Consistent sorting behavior regardless of title presence

## Testing Strategy

### Unit Tests
- Test validation schema with various title inputs
- Test server actions with title field included
- Test form component with title field interactions
- Test table column display logic with and without titles

### Integration Tests
- Test complete create/update flow with titles
- Test table sorting and filtering with title column
- Test backward compatibility with existing notes

### Database Tests
- Verify schema migration applies correctly
- Test that existing notes remain unaffected
- Verify title field constraints work as expected

### UI Tests
- Test form validation displays correctly
- Test table displays titles and fallbacks properly
- Test responsive behavior with longer titles
- Test accessibility of new form elements

## Implementation Considerations

### Backward Compatibility
- Existing notes without titles will continue to work
- Content preview fallback ensures consistent table display
- No breaking changes to existing API contracts

### Performance
- Title column is indexed for efficient sorting
- Content preview is generated client-side to avoid database overhead
- Minimal impact on existing query performance

### Accessibility
- Title input field has proper labels and ARIA attributes
- Table headers are properly labeled for screen readers
- Form validation errors are announced to assistive technologies

### Responsive Design
- Title field follows existing form responsive patterns
- Table column adjusts appropriately on mobile devices
- Long titles are truncated with ellipsis when necessary