import type { DevToolbarApp } from "astro";

import { defineToolbarApp } from "astro/toolbar";

import type {
  FlagDataPayload,
  FlagDataSuccess,
  FlagUpdateRequest,
} from "./shared";

import { TOOLBAR_FLAG_DATA_EVENT, TOOLBAR_FLAG_UPDATE_EVENT } from "./shared";
import { parseEditedFlagValue } from "./value";

type ToolbarState = {
  data?: FlagDataSuccess;
  error?: string;
  pendingKey?: string;
};

const toolbarApp: DevToolbarApp = defineToolbarApp({
  init(canvas, _app, server) {
    const toolbarWindow = document.createElement("astro-dev-toolbar-window");
    toolbarWindow.style.cssText =
      "padding: 18px; width: min(620px, 92vw); min-width: 340px;";

    const state: ToolbarState = {};

    const render = () => {
      renderToolbar(toolbarWindow, state, {
        onError: (message) => {
          state.error = message;
          state.pendingKey = undefined;
          render();
        },
        onSave: (payload) => {
          state.error = undefined;
          state.pendingKey = payload.key;
          render();
          server.send<FlagUpdateRequest>(TOOLBAR_FLAG_UPDATE_EVENT, payload);
        },
      });
    };

    render();
    canvas.appendChild(toolbarWindow);

    server.on<FlagDataPayload>(TOOLBAR_FLAG_DATA_EVENT, (data) => {
      state.pendingKey = undefined;

      if ("error" in data) {
        state.error = data.error;
      } else {
        state.data = data;
        state.error = undefined;
      }

      render();
    });
  },
});

export default toolbarApp;

function renderToolbar(
  container: HTMLElement,
  state: ToolbarState,
  actions: ToolbarActions,
): void {
  container.replaceChildren();

  if (!state.data) {
    if (hasMessage(state.error)) {
      container.appendChild(renderBanner(state.error, "error"));
      return;
    }

    const loading = document.createElement("p");
    loading.textContent = "Loading feature flags...";
    loading.style.cssText =
      "margin: 0; font-size: 15px;";
    container.appendChild(loading);
    return;
  }

  container.appendChild(renderHeader(state.data));

  if (hasMessage(state.error)) {
    container.appendChild(renderBanner(state.error, "error"));
  }

  const entries = Object.entries(state.data.flags);
  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.style.cssText =
      "margin: 4px 0 0; color: rgba(214, 203, 192, 0.66); font-size: 14px;";
    empty.textContent = "No flags defined for this mode.";
    container.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.style.cssText = "display: grid; gap: 10px;";

  for (const [key, value] of entries) {
    list.appendChild(
      renderFlagRow(key, value, state, state.data, state.data.mode, actions),
    );
  }

  container.appendChild(list);
}

function renderHeader(data: FlagDataSuccess): HTMLElement {
  const header = document.createElement("section");
  header.style.cssText =
    "display: grid; gap: 10px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.12);";

  const eyebrow = document.createElement("div");
  eyebrow.style.cssText =
    "display: flex; justify-content: space-between; align-items: baseline; gap: 12px;";

  const title = document.createElement("h2");
  title.style.cssText =
    "margin: 0; font-size: 18px; line-height: 1; font-weight: 600; letter-spacing: 0.02em;";
  title.textContent = "Flag Console";

  const mode = document.createElement("span");
  mode.style.cssText =
    "padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.12); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;";
  mode.textContent = data.mode;

  eyebrow.append(title, mode);

  const description = document.createElement("p");
  description.style.cssText =
    "margin: 0; font-size: 13px; line-height: 1.5; opacity: 0.8;";
  description.textContent =
    "Edit primitive flags in place. Non-primitive schema entries stay visible but remain read-only.";

  const config = document.createElement("code");
  config.style.cssText =
    "font-size: 12px; opacity: 0.62; word-break: break-all;";
  config.textContent = data.configFile;

  header.append(eyebrow, description, config);
  return header;
}

function renderBanner(
  message: string,
  tone: "error" | "info",
): HTMLElement {
  const banner = document.createElement("p");
  banner.style.cssText =
    tone === "error"
      ? "margin: 0 0 12px; padding: 10px 12px; border-radius: 10px; background: rgba(126, 41, 54, 0.24); border: 1px solid rgba(230, 117, 130, 0.25); color: rgb(249, 195, 201); font-size: 13px; line-height: 1.45;"
      : "margin: 0 0 12px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.12); font-size: 13px; line-height: 1.45;";
  banner.textContent = message;
  return banner;
}

function renderFlagRow(
  key: string,
  value: unknown,
  state: ToolbarState,
  data: FlagDataSuccess,
  mode: string,
  actions: ToolbarActions,
): HTMLElement {
  const row = document.createElement("section");
  row.style.cssText =
    "display: grid; gap: 10px; padding: 12px 14px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.1);";

  const title = document.createElement("div");
  title.style.cssText =
    "display: flex; justify-content: space-between; align-items: start; gap: 12px;";

  const keyGroup = document.createElement("div");
  keyGroup.style.cssText = "display: grid; gap: 5px;";

  const keyEl = document.createElement("code");
  keyEl.style.cssText =
    "font-size: 15px; line-height: 1.2;";
  keyEl.textContent = key;

  const editorSchema = data.editors[key] ?? { kind: "readonly", nullable: false };

  const meta = document.createElement("span");
  meta.style.cssText =
    "font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.56;";
  meta.textContent =
    editorSchema.kind === "readonly"
      ? "read-only"
      : editorSchema.nullable
        ? `${editorSchema.kind} | nullable`
        : editorSchema.kind;

  keyGroup.append(keyEl, meta);
  title.appendChild(keyGroup);

  if (editorSchema.kind !== "readonly") {
    const editableSchema = editorSchema as EditableEditorSchema;
    title.appendChild(renderEditableBadge(state.pendingKey === key));
    row.append(
      title,
      renderPrimitiveEditor(key, value, editableSchema, state, mode, actions),
    );
    return row;
  }

  title.appendChild(renderReadonlyBadge());
  row.append(title, renderReadonlyValue(value));
  return row;
}

function renderEditableBadge(isPending: boolean): HTMLElement {
  const badge = document.createElement("span");
  badge.style.cssText = isPending
    ? "padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.16); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;"
    : "padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.12); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;";
  badge.textContent = isPending ? "saving" : "editable";
  return badge;
}

function renderReadonlyBadge(): HTMLElement {
  const badge = document.createElement("span");
  badge.style.cssText =
    "padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.7;";
  badge.textContent = "read-only";
  return badge;
}

function renderPrimitiveEditor(
  key: string,
  initialValue: unknown,
  editorSchema: EditableEditorSchema,
  state: ToolbarState,
  mode: string,
  actions: ToolbarActions,
): HTMLElement {
  if (editorSchema.kind === "boolean") {
    return renderBooleanEditor(
      key,
      initialValue,
      editorSchema,
      state,
      mode,
      actions,
    );
  }

  const editor = document.createElement("div");
  editor.style.cssText = "display: grid; gap: 8px;";

  const next = createInputForSchema(editorSchema, initialValue);
  editor.append(next.element);

  const actionRow = document.createElement("div");
  actionRow.style.cssText =
    "display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px;";

  if (editorSchema.nullable && editorSchema.kind !== "null") {
    const nullButton = createSecondaryButton("Set null");
    nullButton.disabled = state.pendingKey === key;
    nullButton.addEventListener("click", () => {
      actions.onSave({ key, mode, value: null });
    });
    actionRow.append(nullButton);
  }

  const saveButton = createPrimaryButton(state.pendingKey === key ? "Saving..." : "Save");
  saveButton.disabled = state.pendingKey === key;
  saveButton.addEventListener("click", () => {
    if (hasMessage(state.pendingKey)) {
      return;
    }

    try {
      actions.onSave({
        key,
        mode,
        value: parseEditedFlagValue(editorSchema.kind, next.getRawValue()),
      });
    } catch (error) {
      actions.onError(
        error instanceof Error ? error.message : "Failed to parse flag value.",
      );
    }
  });

  actionRow.append(saveButton);
  editor.append(actionRow);
  return editor;
}

function renderBooleanEditor(
  key: string,
  initialValue: unknown,
  editorSchema: Extract<EditableEditorSchema, { kind: "boolean" }>,
  state: ToolbarState,
  mode: string,
  actions: ToolbarActions,
): HTMLElement {
  const editor = document.createElement("div");
  editor.style.cssText = "display: grid; gap: 10px;";

  const hint = document.createElement("p");
  hint.style.cssText =
    "margin: 0; font-size: 13px; line-height: 1.45; opacity: 0.74;";
  hint.textContent = editorSchema.nullable === true
    ? 'Toggle instantly, or use "Set null" to clear the value.'
    : "Toggle instantly and the config file is rewritten right away.";

  const controlGroup = document.createElement("div");
  controlGroup.style.cssText =
    "display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;";

  const toggle = document.createElement("astro-dev-toolbar-toggle");
  toggle.toggleStyle = state.pendingKey === key
    ? "yellow"
    : initialValue === true
      ? "green"
      : "red";
  toggle.input.checked = initialValue === true;
  toggle.input.disabled = state.pendingKey === key;
  toggle.input.addEventListener("change", () => {
    actions.onSave({
      key,
      mode,
      value: toggle.input.checked,
    });
  });

  controlGroup.appendChild(toggle);

  if (editorSchema.nullable === true) {
    const nullButton = createSecondaryButton("Set null");
    nullButton.disabled = state.pendingKey === key;
    nullButton.addEventListener("click", () => {
      actions.onSave({ key, mode, value: null });
    });
    controlGroup.appendChild(nullButton);
  }

  editor.append(hint, controlGroup);
  return editor;
}

function createInputForSchema(
  editorSchema: Exclude<EditableEditorSchema, { kind: "boolean" }>,
  initialValue: unknown,
): {
  element: HTMLElement;
  getRawValue: () => string;
} {
  if (editorSchema.kind === "null") {
    const note = document.createElement("p");
    note.style.cssText =
      "margin: 0; font-size: 13px; line-height: 1.45; opacity: 0.74;";
    note.textContent = 'This schema only accepts "null".';
    return {
      element: note,
      getRawValue: () => "null",
    };
  }

  const input = document.createElement("input");
  input.type = "text";
  input.style.cssText = baseControlStyles();
  input.placeholder = editorSchema.kind === "number" ? "0.0" : "Enter value";
  input.value =
    editorSchema.kind === "number" && typeof initialValue === "number"
      ? String(initialValue)
      : editorSchema.kind === "string" && typeof initialValue === "string"
        ? initialValue
        : "";

  return {
    element: input,
    getRawValue: () => input.value,
  };
}

function renderReadonlyValue(value: unknown): HTMLElement {
  const pre = document.createElement("pre");
  pre.style.cssText =
    "margin: 0; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; opacity: 0.78;";
  pre.textContent = JSON.stringify(value, null, 2);
  return pre;
}

function createPrimaryButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.style.cssText =
    "border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; background: transparent; padding: 8px 12px; font-size: 13px; letter-spacing: 0.01em; cursor: pointer;";
  button.textContent = label;
  return button;
}

function createSecondaryButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.style.cssText =
    "border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: transparent; padding: 8px 12px; font-size: 13px; letter-spacing: 0.01em; cursor: pointer;";
  button.textContent = label;
  return button;
}

function baseControlStyles(): string {
  return "display: block; width: 100%; min-width: 0; box-sizing: border-box; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; background: transparent; padding: 9px 11px; font-size: 13px;";
}

function hasMessage(value: string | undefined): value is string {
  return value != null && value !== "";
}

type ToolbarActions = {
  onError: (message: string) => void;
  onSave: (payload: FlagUpdateRequest) => void;
};

type EditableEditorSchema = {
  kind: "boolean";
  nullable: boolean;
} | {
  kind: "null";
  nullable: boolean;
} | {
  kind: "number";
  nullable: boolean;
} | {
  kind: "string";
  nullable: boolean;
};
