# Toolbar `useFlagForm` Refactor Design

## Problem

`packages/astro-simple-feature-flags/src/toolbar/App.tsx` currently owns both:

- feature flag data loading and update event wiring
- form state management for editable flags

This mixes unrelated responsibilities in one component. It also makes server-side validation awkward because submit state, form-level error handling, and field-level error handling are not modeled as a single form workflow.

## Goals

- Separate toolbar data/event orchestration from form state management
- Support server-side validation with field-level errors
- Clear a field error as soon as that field is edited again
- Keep the current UX shape: edit multiple values, submit once, refresh from server after a successful update

## Non-Goals

- Adding client-side schema validation
- Changing the toolbar visual design
- Introducing a generic form library dependency

## Proposed Approach

Extract a dedicated `useFlagForm` hook from `App.tsx`.

The hook will:

- derive initial form values from `FlagDataSuccess`
- track editable values
- track `fieldErrors`
- track `formError`
- track `isSubmitting`
- compute `hasUnsavedChanges`
- expose `setValue`, `reset`, and `handleSubmit`

The hook will not know about `ToolbarServerHelpers` or Astro toolbar events. Network and event orchestration will remain in `App.tsx`.

## API

```ts
type SubmitResult =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string> }
  | { ok: false; formError: string };

type UseFlagFormResult = {
  values: Record<string, FormValue>;
  fieldErrors: Record<string, string>;
  formError?: string;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  setValue: (key: string, value: FormValue) => void;
  reset: () => void;
  handleSubmit: (
    onSubmit: (values: Record<string, unknown>) => Promise<SubmitResult>,
  ) => () => Promise<void>;
};
```

## Responsibilities

### `useFlagForm`

- Initialize draft values from the current `FlagDataSuccess`
- Convert `FormValue` state into draft flag values with `buildDraftFlags`
- Clear the edited field's error on `setValue`
- Clear `formError` before a new submit
- Apply `SubmitResult`
  - `ok: true`: keep local submit state clean and let the parent refresh data
  - `fieldErrors`: preserve values and attach messages by key
  - `formError`: preserve values and show a form-level error

### `App.tsx`

- Load current flag data
- Pass `data` into `useFlagForm`
- Provide the concrete async submit function to `handleSubmit`
- Orchestrate Astro toolbar events
- Refresh flag data after successful update

## Data Flow

1. `App.tsx` receives `FlagDataSuccess`
2. `useFlagForm(data)` derives initial editable values
3. User edits values through `setValue`
4. `handleSubmit(onSubmit)` builds the draft payload and calls external `onSubmit`
5. The external submit function performs server communication
6. The returned `SubmitResult` is applied by `useFlagForm`
7. On success, `App.tsx` refreshes toolbar flag data and the hook re-initializes from the new `data`

## Error Handling

### Field Errors

- Server validation errors are returned as `Record<string, string>`
- The hook stores them by field key
- Editing a field clears only that field's error

### Form Error

- Non-field failures such as mode mismatch or file update failure are returned as `formError`
- The hook preserves draft values so the user can retry without losing edits

## Implementation Notes

- Move form helpers from `App.tsx` into the hook module where appropriate:
  - `createInitialFormValues`
  - `formHasUnsavedChanges`
  - `buildDraftFlags`
- Keep pure value conversion helpers small and testable
- `FlagRow` and `EditableField` should receive `fieldError` as props and render it directly
- Replace `isSaving` naming with `isSubmitting` in the form layer for clarity

## Testing

Focus on behavior instead of implementation details.

- initializes editable values from `FlagDataSuccess`
- reports dirty state only when draft values differ from initial values
- clears only the edited field error on `setValue`
- preserves draft values when `SubmitResult` returns `fieldErrors`
- preserves draft values when `SubmitResult` returns `formError`
- resets submit state after `ok: true`
- re-initializes correctly when parent data changes after a successful save

## Migration Plan

1. Add `useFlagForm.ts` with the hook and migrated pure helpers
2. Update `App.tsx` to use the hook and pass an external submit handler
3. Add field error rendering to editable inputs
4. Adjust integration-side update result handling to return the new `SubmitResult` shape at the component boundary
5. Add or update tests around hook behavior and submit flow

## Risks

- Re-initializing from parent data too aggressively could wipe in-progress edits if unrelated toolbar events arrive
- Mixing transport-layer event payloads with form-layer result types would blur boundaries again

## Recommendation

Refactor toward a form-state hook with an external `onSubmit` contract. This keeps `App.tsx` focused on Astro toolbar integration while giving the form a predictable server-validation-first API.
