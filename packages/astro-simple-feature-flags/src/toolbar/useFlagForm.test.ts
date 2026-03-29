import { describe, expect, it } from "vitest";

import type { FlagDataSuccess } from "./shared";

import {
  applySubmitResult,
  buildDraftFlags,
  clearFieldError,
  createInitialFormValues,
  formHasUnsavedChanges,
  getNextSubmitState,
} from "./useFlagForm";

const baseData: FlagDataSuccess = {
  configFile: "/tmp/flags.ts",
  editors: {
    fooReleased: { kind: "boolean", nullable: false },
    ignored: { kind: "readonly", nullable: false },
    rolloutRate: { kind: "number", nullable: false },
    variant: { kind: "string", nullable: true },
  },
  flags: {
    fooReleased: true,
    ignored: { nested: true },
    rolloutRate: 0.5,
    variant: "candidate",
  },
  mode: "development",
};

describe("createInitialFormValues", () => {
  it("returns only editable field values derived from the toolbar data", () => {
    expect(createInitialFormValues(baseData)).toEqual({
      fooReleased: true,
      rolloutRate: "0.5",
      variant: "candidate",
    });
  });
});

describe("formHasUnsavedChanges", () => {
  it("returns false for the initial draft state and true after a change", () => {
    const initialValues = createInitialFormValues(baseData);

    expect(formHasUnsavedChanges(baseData, initialValues)).toBe(false);
    expect(
      formHasUnsavedChanges(baseData, {
        ...initialValues,
        variant: "experiment",
      }),
    ).toBe(true);
  });
});

describe("clearFieldError", () => {
  it("removes only the edited field error", () => {
    expect(
      clearFieldError(
        {
          rolloutRate: "Must be between 0 and 1.",
          variant: "Required.",
        },
        "rolloutRate",
      ),
    ).toEqual({
      variant: "Required.",
    });
  });
});

describe("buildDraftFlags", () => {
  it("converts form values back into editable flag payloads", () => {
    expect(
      buildDraftFlags(baseData, {
        fooReleased: false,
        rolloutRate: "0.75",
        variant: null,
      }),
    ).toEqual({
      fooReleased: false,
      ignored: { nested: true },
      rolloutRate: 0.75,
      variant: null,
    });
  });
});

describe("applySubmitResult", () => {
  it("preserves values and applies field errors from server-side validation", () => {
    expect(
      applySubmitResult(
        {
          fieldErrors: {},
          formError: undefined,
          isSubmitting: true,
        },
        {
          fieldErrors: {
            rolloutRate: "Must be between 0 and 1.",
          },
          ok: false,
        },
      ),
    ).toEqual({
      fieldErrors: {
        rolloutRate: "Must be between 0 and 1.",
      },
      formError: undefined,
      isSubmitting: false,
    });
  });

  it("clears previous field errors after a successful submit result", () => {
    expect(
      applySubmitResult(
        {
          fieldErrors: {
            rolloutRate: "Must be between 0 and 1.",
          },
          formError: "Validation failed.",
          isSubmitting: true,
        },
        { ok: true },
      ),
    ).toEqual({
      fieldErrors: {},
      formError: undefined,
      isSubmitting: false,
    });
  });
});

describe("getNextSubmitState", () => {
  it("starts submitting before a result arrives", () => {
    expect(
      getNextSubmitState(
        {
          fieldErrors: {
            rolloutRate: "Must be between 0 and 1.",
          },
          formError: "Validation failed.",
          isSubmitting: false,
        },
        {
          submittedAt: 1,
        },
      ),
    ).toEqual({
      fieldErrors: {},
      formError: undefined,
      isSubmitting: true,
    });
  });

  it("applies the latest submit result when available", () => {
    expect(
      getNextSubmitState(
        {
          fieldErrors: {},
          formError: undefined,
          isSubmitting: true,
        },
        {
          result: {
            fieldErrors: {
              rolloutRate: "Must be between 0 and 1.",
            },
            ok: false,
          },
          submittedAt: 1,
        },
      ),
    ).toEqual({
      fieldErrors: {
        rolloutRate: "Must be between 0 and 1.",
      },
      formError: undefined,
      isSubmitting: false,
    });
  });
});
