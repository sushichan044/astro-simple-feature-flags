import { useEffect, useRef, useState } from "preact/hooks";

import type { FlagEditorSchema } from "./schema";
import type {
  FlagDataSuccess,
  FlagFieldErrors,
  FlagUpdateResult,
} from "./shared";

import { parseEditedFlagValue } from "./value";

type FormValue = boolean | string | null;

type EditableEditorSchema = Exclude<FlagEditorSchema, { kind: "readonly" }>;

type SubmitState = {
  fieldErrors: FlagFieldErrors;
  formError?: string;
  isSubmitting: boolean;
};

type SubmitLifecycle = {
  requestId?: string;
  result?: FlagUpdateResult;
  submittedAt?: number;
};

export type UseFlagFormResult = {
  fieldErrors: FlagFieldErrors;
  formError?: string;
  handleSubmit: (
    onSubmit: (values: Record<string, unknown>) => Promise<void> | void,
  ) => () => Promise<void>;
  hasUnsavedChanges: boolean;
  isSubmitting: boolean;
  reset: () => void;
  setValue: (key: string, value: FormValue) => void;
  values: Record<string, FormValue>;
};

export const useFlagForm = (
  data: FlagDataSuccess,
  submitLifecycle?: SubmitLifecycle,
): UseFlagFormResult => {
  const previousDataRef = useRef(data);
  const [values, setValues] = useState<Record<string, FormValue>>(() =>
    createInitialFormValues(data),
  );
  const [submitState, setSubmitState] = useState<SubmitState>({
    fieldErrors: {},
    formError: undefined,
    isSubmitting: false,
  });

  useEffect(() => {
    if (
      shouldResetFormState({
        currentValues: values,
        nextData: data,
        previousData: previousDataRef.current,
      })
    ) {
      setValues(createInitialFormValues(data));
      setSubmitState({
        fieldErrors: {},
        formError: undefined,
        isSubmitting: false,
      });
    }

    previousDataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (submitLifecycle == null) {
      return;
    }

    setSubmitState((currentState) =>
      getNextSubmitState(currentState, submitLifecycle),
    );
  }, [submitLifecycle]);

  const setValue = (key: string, value: FormValue) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
    setSubmitState((currentState) => ({
      ...currentState,
      fieldErrors: clearFieldError(currentState.fieldErrors, key),
    }));
  };

  const reset = () => {
    setValues(createInitialFormValues(data));
    setSubmitState({
      fieldErrors: {},
      formError: undefined,
      isSubmitting: false,
    });
  };

  const handleSubmit =
    (onSubmit: (nextValues: Record<string, unknown>) => Promise<void> | void) =>
    async () => {
      setSubmitState({
        fieldErrors: {},
        formError: undefined,
        isSubmitting: true,
      });

      try {
        await onSubmit(buildDraftFlags(data, values));

        if (shouldUseLocalSubmitHandling(submitLifecycle)) {
          setSubmitState({
            fieldErrors: {},
            formError: undefined,
            isSubmitting: false,
          });
        }
      } catch (error) {
        setSubmitState({
          fieldErrors: {},
          formError:
            error instanceof Error
              ? error.message
              : "Failed to parse flag value.",
          isSubmitting: false,
        });
      }
    };

  return {
    fieldErrors: submitState.fieldErrors,
    formError: submitState.formError,
    handleSubmit,
    hasUnsavedChanges: formHasUnsavedChanges(data, values),
    isSubmitting: submitState.isSubmitting,
    reset,
    setValue,
    values,
  };
};

export function shouldUseLocalSubmitHandling(
  submitLifecycle: SubmitLifecycle | undefined,
): boolean {
  return submitLifecycle == null;
}

export function clearFieldError(
  fieldErrors: FlagFieldErrors,
  key: string,
): FlagFieldErrors {
  if (!(key in fieldErrors)) {
    return fieldErrors;
  }

  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([fieldKey]) => fieldKey !== key),
  );
}

export function applySubmitResult(
  _currentState: SubmitState,
  result: FlagUpdateResult,
): SubmitState {
  if (result.ok) {
    return {
      fieldErrors: {},
      formError: undefined,
      isSubmitting: false,
    };
  }

  if ("fieldErrors" in result) {
    return {
      fieldErrors: result.fieldErrors,
      formError: undefined,
      isSubmitting: false,
    };
  }

  return {
    fieldErrors: {},
    formError: result.formError,
    isSubmitting: false,
  };
}

export function getNextSubmitState(
  currentState: SubmitState,
  submitLifecycle: SubmitLifecycle,
): SubmitState {
  if (submitLifecycle.result == null) {
    return {
      fieldErrors: {},
      formError: undefined,
      isSubmitting: submitLifecycle.submittedAt != null,
    };
  }

  return applySubmitResult(currentState, submitLifecycle.result);
}

export function createInitialFormValues(
  data: FlagDataSuccess,
): Record<string, FormValue> {
  return Object.fromEntries(
    Object.entries(data.editors)
      .filter((entry): entry is [string, EditableEditorSchema] => {
        return entry[1].kind !== "readonly";
      })
      .map(([key, editorSchema]) => [
        key,
        toInitialFormValue(editorSchema, data.flags[key]),
      ]),
  );
}

function toInitialFormValue(
  editorSchema: EditableEditorSchema,
  initialValue: unknown,
): FormValue {
  if (editorSchema.kind === "null") {
    return null;
  }

  if (initialValue === null) {
    return null;
  }

  if (editorSchema.kind === "boolean") {
    return initialValue === true;
  }

  return getInitialInputValue(editorSchema.kind, initialValue);
}

export function getInitialInputValue(
  kind: Exclude<EditableEditorSchema["kind"], "boolean" | "null">,
  initialValue: unknown,
): string {
  if (kind === "number" && typeof initialValue === "number") {
    return String(initialValue);
  }

  if (kind === "string" && typeof initialValue === "string") {
    return initialValue;
  }

  return "";
}

export function getBooleanFormValue(
  formValues: Record<string, FormValue>,
  key: string,
  initialValue: unknown,
): boolean | null {
  const currentValue = formValues[key];
  if (typeof currentValue === "boolean" || currentValue === null) {
    return currentValue;
  }

  return initialValue === true;
}

export function formHasUnsavedChanges(
  data: FlagDataSuccess,
  formValues: Record<string, FormValue>,
): boolean {
  const initialFormValues = createInitialFormValues(data);

  return Object.keys(initialFormValues).some((key) => {
    return formValues[key] !== initialFormValues[key];
  });
}

export function shouldResetFormState(params: {
  currentValues: Record<string, FormValue>;
  nextData: FlagDataSuccess;
  previousData: FlagDataSuccess;
}): boolean {
  const { currentValues, nextData, previousData } = params;

  if (!formHasUnsavedChanges(previousData, currentValues)) {
    return true;
  }

  return !formHasUnsavedChanges(nextData, currentValues);
}

export function buildDraftFlags(
  data: FlagDataSuccess,
  formValues: Record<string, FormValue>,
): Record<string, unknown> {
  const nextFlags = { ...data.flags };

  for (const [key, editorSchema] of Object.entries(data.editors)) {
    if (editorSchema.kind === "readonly") {
      continue;
    }

    const formValue = formValues[key];
    if (formValue === null) {
      nextFlags[key] = null;
      continue;
    }

    if (editorSchema.kind === "boolean") {
      nextFlags[key] = formValue === true;
      continue;
    }

    nextFlags[key] = parseEditedFlagValue(
      editorSchema.kind,
      typeof formValue === "string" ? formValue : "",
    );
  }

  return nextFlags;
}
