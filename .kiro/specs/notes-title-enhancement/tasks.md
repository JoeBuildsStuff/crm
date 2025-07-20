# Implementation Plan

- [x] 1. Add title column to notes table in Supabase database
  - Execute SQL migration to add nullable title column to notes table
  - Verify column is added successfully and existing data remains intact
  - _Requirements: 1.2, 2.2_

- [x] 2. Generate updated TypeScript types from Supabase schema
  - Run type generation command to update database types
  - Verify title field is included in notes table type definition
  - _Requirements: 1.2, 2.2_

- [ ] 3. Update note validation schema to include title field
  - Modify validation schema in `src/app/(app)/workspace/note/_lib/validations.ts`
  - Add title field with optional string validation and 255 character limit
  - Write unit tests for title validation scenarios
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4. Update note form component to include title input field
  - Add title input field to `src/app/(app)/workspace/note/_components/form.tsx`
  - Position title field as first form element above content
  - Implement proper form validation and error display for title
  - Ensure form follows existing styling and accessibility patterns
  - _Requirements: 1.1, 2.1, 4.4_

- [ ] 5. Update server actions to handle title field in CRUD operations
  - Modify create and update functions in `src/app/(app)/workspace/note/_lib/actions.ts`
  - Include title field in database insert and update operations
  - Maintain existing error handling and response patterns
  - _Requirements: 1.2, 2.2_

- [ ] 6. Update notes table columns to display title as primary column
  - Modify column definitions in `src/app/(app)/workspace/note/_components/columns.tsx`
  - Add title column as first data column with sorting capability
  - Implement display logic: show title if present, otherwise show content preview (first 50 characters)
  - Update existing content column to be secondary display
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7. Write comprehensive tests for title functionality
  - Create unit tests for validation schema with title field
  - Test server actions with title field included in operations
  - Test form component interactions with title input
  - Test table column display logic with various title scenarios
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Test end-to-end note creation and editing with titles
  - Verify complete create flow with title field works correctly
  - Test update flow maintains existing title or allows title changes
  - Verify table display shows titles and fallbacks appropriately
  - Test sorting functionality works with title column
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_