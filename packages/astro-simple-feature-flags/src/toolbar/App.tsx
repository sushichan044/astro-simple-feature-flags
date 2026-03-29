import type { DevToolbarApp, ToolbarServerHelpers } from "astro";

import { defineToolbarApp } from "astro/toolbar";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

import type { FlagEditorSchema } from "./schema";
import type {
  FlagDataPayload,
  FlagDataSuccess,
  FlagUpdateRequest,
  FlagUpdateResult,
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
  TOOLBAR_FLAG_UPDATE_RESULT_EVENT,
} from "./shared";
import {
  getBooleanFormValue,
  getInitialInputValue,
  useFlagForm,
} from "./useFlagForm";

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

  useEffect(() => {
    requestFlagData(server, (payload) => {
      if ("error" in payload) {
        setError(payload.error);
        return;
      }

      setData(payload);
      setError(undefined);
    });
  }, [server]);

  if (data == null) {
    if (isNonEmptyString(error)) {
      return <ToolbarBanner message={error} tone="error" />;
    }

    return (
      <p style={{ fontSize: "15px", margin: 0 }}>Loading feature flags...</p>
    );
  }

  return <LoadedToolbarApp data={data} error={error} server={server} />;
}

function LoadedToolbarApp(props: {
  data: FlagDataSuccess;
  error?: string;
  server: ToolbarServerHelpers;
}) {
  const [submitLifecycle, setSubmitLifecycle] = useState<{
    result?: FlagUpdateResult;
    submittedAt?: number;
  }>({});
  const form = useFlagForm(props.data, submitLifecycle);
  const entries = Object.entries(props.data.flags);

  useEffect(() => {
    props.server.on<FlagUpdateResult>(
      TOOLBAR_FLAG_UPDATE_RESULT_EVENT,
      (result) => {
        setSubmitLifecycle((currentLifecycle) => ({
          ...currentLifecycle,
          result,
        }));
      },
    );
  }, [props.server]);

  const onSave = form.handleSubmit((flags) => {
    setSubmitLifecycle({
      result: undefined,
      submittedAt: Date.now(),
    });
    props.server.send<FlagUpdateRequest>(TOOLBAR_FLAG_UPDATE_EVENT, {
      flags,
      mode: props.data.mode,
    });
  });

  return (
    <>
      <ToolbarHeader data={props.data} />
      {isNonEmptyString(props.error) ? (
        <ToolbarBanner message={props.error} tone="error" />
      ) : isNonEmptyString(form.formError) ? (
        <ToolbarBanner message={form.formError} tone="error" />
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
                data={props.data}
                fieldError={form.fieldErrors[key]}
                flagKey={key}
                formValues={form.values}
                isSaving={form.isSubmitting}
                key={key}
                onChange={form.setValue}
                value={value}
              />
            ))}
          </div>
          <ActionBar
            hasUnsavedChanges={form.hasUnsavedChanges}
            isSaving={form.isSubmitting}
            onReset={form.reset}
            onSave={onSave}
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
  fieldError?: string;
  flagKey: string;
  formValues: Record<string, boolean | string | null>;
  isSaving: boolean;
  onChange: (key: string, value: boolean | string | null) => void;
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
            fieldError={props.fieldError}
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
  fieldError?: string;
  flagKey: string;
  formValues: Record<string, boolean | string | null>;
  initialValue: unknown;
  isSaving: boolean;
  onChange: (key: string, value: boolean | string | null) => void;
  schema: Exclude<FlagEditorSchema, { kind: "readonly" }>;
}) {
  if (props.schema.kind === "boolean") {
    return (
      <BooleanField
        errorMessage={props.fieldError}
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
      <div style={{ display: "grid", gap: "8px" }}>
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.45,
            margin: 0,
            opacity: 0.74,
          }}
        >
          This schema only accepts "null".
        </p>
        <FieldErrorMessage message={props.fieldError} />
      </div>
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
      <FieldErrorMessage message={props.fieldError} />
    </div>
  );
}

function BooleanField(props: {
  errorMessage?: string;
  flagKey: string;
  initialValue: unknown;
  isSaving: boolean;
  nullable: boolean;
  onChange: (key: string, value: boolean | string | null) => void;
  value: boolean | null;
}) {
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
      <FieldErrorMessage message={props.errorMessage} />
    </div>
  );
}

function FieldErrorMessage(props: { message?: string }) {
  if (!isNonEmptyString(props.message)) {
    return null;
  }

  return (
    <p
      style={{
        color: "rgba(255, 132, 122, 0.98)",
        fontSize: "12px",
        lineHeight: 1.4,
        margin: 0,
      }}
    >
      {props.message}
    </p>
  );
}

function ReadonlyValue({ value }: { value: unknown }) {
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
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onReset: () => void;
  onSave: () => Promise<void>;
}) {
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
          void props.onSave();
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
