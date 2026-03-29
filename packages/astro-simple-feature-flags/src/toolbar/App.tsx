import type { DevToolbarApp, ToolbarServerHelpers } from "astro";
import type { JSX } from "preact";

import { defineToolbarApp } from "astro/toolbar";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

import type { FlagEditorSchema } from "./schema";
import type {
  FlagDataPayload,
  FlagDataSuccess,
  FlagUpdateRequest,
} from "./shared";

import {
  ToolbarBadge,
  ToolbarButton,
  ToolbarCard,
  ToolbarToggle,
} from "./Components";
import {
  TOOLBAR_FLAG_DATA_EVENT,
  TOOLBAR_FLAG_REQUEST_EVENT,
  TOOLBAR_FLAG_UPDATE_EVENT,
} from "./shared";
import { parseEditedFlagValue } from "./value";

type FormValue = boolean | string | null;

type EditableEditorSchema = Exclude<FlagEditorSchema, { kind: "readonly" }>;

const toolbarApp: DevToolbarApp = defineToolbarApp({
  init(canvas, _app, server) {
    const toolbarWindow = document.createElement("astro-dev-toolbar-window");
    Object.assign(toolbarWindow.style, {
      minWidth: "340px",
      padding: "18px",
      width: "min(620px, 92vw)",
    });

    render(<ToolbarApp server={server} />, toolbarWindow);
    canvas.appendChild(toolbarWindow);
  },
});

export default toolbarApp;

export function requestFlagData(
  server: ToolbarServerHelpers,
  listener: (payload: FlagDataPayload) => void,
) {
  server.on<FlagDataPayload>(TOOLBAR_FLAG_DATA_EVENT, listener);
  server.send<undefined>(TOOLBAR_FLAG_REQUEST_EVENT, undefined);
}

function ToolbarApp({ server }: { server: ToolbarServerHelpers }) {
  const [data, setData] = useState<FlagDataSuccess>();
  const [error, setError] = useState<string>();
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    requestFlagData(server, (payload) => {
      if ("error" in payload) {
        setError(payload.error);
        setIsSaving(false);
        return;
      }

      setData(payload);
      setError(undefined);
      setFormValues(createInitialFormValues(payload));
      setIsSaving(false);
    });
  }, [server]);

  const updateFormValue = (key: string, value: FormValue) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const handleError = (message: string) => {
    setError(message);
    setIsSaving(false);
  };

  const resetForm = () => {
    if (data == null) {
      return;
    }

    setError(undefined);
    setFormValues(createInitialFormValues(data));
  };

  const saveForm = (payload: FlagUpdateRequest) => {
    setError(undefined);
    setIsSaving(true);
    server.send<FlagUpdateRequest>(TOOLBAR_FLAG_UPDATE_EVENT, payload);
  };

  if (data == null) {
    if (isNonEmptyString(error)) {
      return <ToolbarBanner message={error} tone="error" />;
    }

    return (
      <p style={{ fontSize: "15px", margin: 0 }}>Loading feature flags...</p>
    );
  }

  const hasUnsavedChanges = formHasUnsavedChanges(data, formValues);
  const entries = Object.entries(data.flags);

  return (
    <>
      <ToolbarHeader data={data} />
      {isNonEmptyString(error) ? (
        <ToolbarBanner message={error} tone="error" />
      ) : null}
      {entries.length === 0 ? (
        <p
          style={{
            color: "rgba(214, 203, 192, 0.66)",
            fontSize: "14px",
            margin: "4px 0 0",
          }}
        >
          No flags defined for this mode.
        </p>
      ) : (
        <>
          <div style={{ display: "grid", gap: "10px" }}>
            {entries.map(([key, value]) => (
              <FlagRow
                data={data}
                flagKey={key}
                formValues={formValues}
                isSaving={isSaving}
                key={key}
                onChange={updateFormValue}
                value={value}
              />
            ))}
          </div>
          <ActionBar
            data={data}
            formValues={formValues}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            onError={handleError}
            onReset={resetForm}
            onSave={saveForm}
          />
        </>
      )}
    </>
  );
}

function ToolbarHeader({ data }: { data: FlagDataSuccess }) {
  return (
    <section
      style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        display: "grid",
        gap: "10px",
        marginBottom: "14px",
        paddingBottom: "14px",
      }}
    >
      <div
        style={{
          alignItems: "baseline",
          display: "flex",
          gap: "12px",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            lineHeight: 1,
            margin: 0,
          }}
        >
          Flag Console
        </h2>
        <ToolbarBadge badge-style="purple" size="small">
          {data.mode}
        </ToolbarBadge>
      </div>
      <code style={{ fontSize: "12px", opacity: 0.62, wordBreak: "break-all" }}>
        {data.configFile}
      </code>
    </section>
  );
}

function ToolbarBanner(props: { message: string; tone: "error" | "info" }) {
  return (
    <ToolbarCard card-style={props.tone === "error" ? "red" : "gray"}>
      <div style={{ display: "block", margin: "0 0 12px" }}>
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.45,
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {props.message}
        </p>
      </div>
    </ToolbarCard>
  );
}

function FlagRow(props: {
  data: FlagDataSuccess;
  flagKey: string;
  formValues: Record<string, FormValue>;
  isSaving: boolean;
  onChange: (key: string, value: FormValue) => void;
  value: unknown;
}) {
  const editorSchema = props.data.editors[props.flagKey] ?? {
    kind: "readonly",
    nullable: false,
  };

  return (
    <ToolbarCard card-style="gray">
      <div style={{ display: "grid", gap: "10px" }}>
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            gap: "12px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "grid", gap: "5px" }}>
            <code style={{ fontSize: "15px", lineHeight: 1.2 }}>
              {props.flagKey}
            </code>
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                opacity: 0.56,
                textTransform: "uppercase",
              }}
            >
              {getEditorLabel(editorSchema)}
            </span>
          </div>
          {editorSchema.kind === "readonly" ? (
            <ToolbarBadge badge-style="gray" size="small">
              read-only
            </ToolbarBadge>
          ) : (
            <ToolbarBadge
              badge-style={props.isSaving ? "blue" : "green"}
              size="small"
            >
              {props.isSaving ? "saving" : "editable"}
            </ToolbarBadge>
          )}
        </div>
        {editorSchema.kind === "readonly" ? (
          <ReadonlyValue value={props.value} />
        ) : (
          <EditableField
            flagKey={props.flagKey}
            formValues={props.formValues}
            initialValue={props.value}
            isSaving={props.isSaving}
            onChange={props.onChange}
            schema={editorSchema}
          />
        )}
      </div>
    </ToolbarCard>
  );
}

function EditableField(props: {
  flagKey: string;
  formValues: Record<string, FormValue>;
  initialValue: unknown;
  isSaving: boolean;
  onChange: (key: string, value: FormValue) => void;
  schema: EditableEditorSchema;
}): JSX.Element {
  if (props.schema.kind === "boolean") {
    return (
      <BooleanField
        flagKey={props.flagKey}
        initialValue={props.initialValue}
        isSaving={props.isSaving}
        nullable={props.schema.nullable}
        onChange={props.onChange}
        value={getBooleanFormValue(
          props.formValues,
          props.flagKey,
          props.initialValue,
        )}
      />
    );
  }

  if (props.schema.kind === "null") {
    return (
      <p
        style={{ fontSize: "13px", lineHeight: 1.45, margin: 0, opacity: 0.74 }}
      >
        This schema only accepts "null".
      </p>
    );
  }

  const currentValue = props.formValues[props.flagKey];
  const inputValue =
    currentValue === null
      ? ""
      : typeof currentValue === "string"
        ? currentValue
        : getInitialInputValue(props.schema.kind, props.initialValue);

  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <input
        data-flag-input-key={props.flagKey}
        disabled={props.isSaving}
        onInput={(event) => {
          props.onChange(props.flagKey, event.currentTarget.value);
        }}
        placeholder={
          currentValue === null
            ? "null"
            : props.schema.kind === "number"
              ? "0.0"
              : "Enter value"
        }
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "10px",
          boxSizing: "border-box",
          caretColor: "rgba(255, 255, 255, 0.92)",
          color: "rgba(255, 255, 255, 0.92)",
          display: "block",
          fontSize: "13px",
          minWidth: 0,
          padding: "12px 14px",
          width: "100%",
        }}
        type="text"
        value={inputValue}
      />
      {props.schema.nullable ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            justifyContent: "flex-end",
          }}
        >
          <ToolbarButton
            button-style="outline"
            disabled={props.isSaving}
            onClick={() => {
              props.onChange(props.flagKey, null);
            }}
            size="small"
          >
            Set null
          </ToolbarButton>
        </div>
      ) : null}
    </div>
  );
}

function BooleanField(props: {
  flagKey: string;
  initialValue: unknown;
  isSaving: boolean;
  nullable: boolean;
  onChange: (key: string, value: FormValue) => void;
  value: boolean | null;
}): JSX.Element {
  return (
    <div style={{ display: "grid", gap: "10px" }}>
      <p
        style={{ fontSize: "13px", lineHeight: 1.45, margin: 0, opacity: 0.74 }}
      >
        {props.nullable
          ? 'Adjust the draft, or use "Set null" before updating.'
          : "Adjust the draft and save everything with Update."}
      </p>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "space-between",
        }}
      >
        <ToolbarToggle
          checked={props.value === true}
          disabled={props.isSaving}
          onChange={(e) => {
            props.onChange(props.flagKey, e.currentTarget.checked);
          }}
          toggle-style={props.value === true ? "green" : "red"}
        />
        {props.nullable ? (
          <ToolbarButton
            button-style="outline"
            disabled={props.isSaving}
            onClick={() => {
              props.onChange(props.flagKey, null);
            }}
            size="small"
          >
            Set null
          </ToolbarButton>
        ) : null}
      </div>
    </div>
  );
}

function ReadonlyValue({ value }: { value: unknown }): JSX.Element {
  return (
    <pre
      style={{
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "10px",
        fontSize: "12px",
        lineHeight: 1.5,
        margin: 0,
        opacity: 0.78,
        padding: "10px 12px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function ActionBar(props: {
  data: FlagDataSuccess;
  formValues: Record<string, FormValue>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onError: (message: string) => void;
  onReset: () => void;
  onSave: (payload: FlagUpdateRequest) => void;
}): JSX.Element {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        justifyContent: "flex-end",
        marginTop: "14px",
        paddingTop: "14px",
      }}
    >
      <ToolbarButton
        button-style="outline"
        disabled={props.isSaving || !props.hasUnsavedChanges}
        onClick={props.onReset}
        size="small"
      >
        Reset
      </ToolbarButton>
      <ToolbarButton
        button-style="green"
        disabled={props.isSaving || !props.hasUnsavedChanges}
        onClick={() => {
          try {
            props.onSave({
              flags: buildDraftFlags(props.data, props.formValues),
              mode: props.data.mode,
            });
          } catch (error) {
            props.onError(
              error instanceof Error
                ? error.message
                : "Failed to parse flag value.",
            );
          }
        }}
        size="small"
      >
        {props.isSaving ? "Updating..." : "Update"}
      </ToolbarButton>
    </div>
  );
}

function getEditorLabel(editorSchema: FlagEditorSchema): string {
  if (editorSchema.kind === "readonly") {
    return "read-only";
  }

  return editorSchema.nullable
    ? `${editorSchema.kind} | nullable`
    : editorSchema.kind;
}

function isNonEmptyString(value?: unknown): value is string {
  return typeof value === "string" && value !== "";
}

function createInitialFormValues(
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

function getInitialInputValue(
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

function getBooleanFormValue(
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

function formHasUnsavedChanges(
  data: FlagDataSuccess,
  formValues: Record<string, FormValue>,
): boolean {
  const initialFormValues = createInitialFormValues(data);

  return Object.keys(initialFormValues).some((key) => {
    return formValues[key] !== initialFormValues[key];
  });
}

function buildDraftFlags(
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
