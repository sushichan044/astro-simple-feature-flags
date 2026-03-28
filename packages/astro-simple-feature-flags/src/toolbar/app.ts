import type { DevToolbarApp } from "astro";

import { defineToolbarApp } from "astro/toolbar";

import type {
  FlagDataPayload,
  FlagDataSuccess,
  FlagUpdateRequest,
} from "./shared";

import { TOOLBAR_FLAG_DATA_EVENT, TOOLBAR_FLAG_UPDATE_EVENT } from "./shared";
import { parseEditedFlagValue } from "./value";

type FormValue = boolean | string | null;

type ToolbarState = {
  data?: FlagDataSuccess;
  error?: string;
  formValues: Record<string, FormValue>;
  isSaving: boolean;
};

type InputFocusSnapshot = {
  key: string;
  selectionEnd: number | null;
  selectionStart: number | null;
};

type FocusableNode = {
  children?: ArrayLike<FocusableNode>;
  dataset?: {
    flagInputKey?: string;
  };
  focus?: () => void;
  selectionEnd?: number | null;
  selectionStart?: number | null;
  setSelectionRange?: (start: number, end: number) => void;
  tagName?: string;
};

const toolbarApp: DevToolbarApp = defineToolbarApp({
  init(canvas, _app, server) {
    const toolbarWindow = document.createElement("astro-dev-toolbar-window");
    toolbarWindow.style.cssText =
      "padding: 18px; width: min(620px, 92vw); min-width: 340px;";

    const state: ToolbarState = {
      formValues: {},
      isSaving: false,
    };

    const render = () => {
      const focusSnapshot = getInputFocusSnapshot(document.activeElement);
      renderToolbar(toolbarWindow, state, {
        onChange: (key, value) => {
          state.formValues[key] = value;
          render();
        },
        onError: (message) => {
          state.error = message;
          state.isSaving = false;
          render();
        },
        onReset: () => {
          if (!state.data) {
            return;
          }

          state.error = undefined;
          state.formValues = createInitialFormValues(state.data);
          render();
        },
        onSave: (payload) => {
          state.error = undefined;
          state.isSaving = true;
          render();
          server.send<FlagUpdateRequest>(TOOLBAR_FLAG_UPDATE_EVENT, payload);
        },
      });
      restoreInputFocus(
        toolbarWindow as unknown as FocusableNode,
        focusSnapshot,
      );
    };

    render();
    canvas.appendChild(toolbarWindow);

    server.on<FlagDataPayload>(TOOLBAR_FLAG_DATA_EVENT, (data) => {
      state.isSaving = false;

      if ("error" in data) {
        state.error = data.error;
      } else {
        state.data = data;
        state.error = undefined;
        state.formValues = createInitialFormValues(data);
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
    loading.style.cssText = "margin: 0; font-size: 15px;";
    container.appendChild(loading);
    return;
  }

  const hasUnsavedChanges = formHasUnsavedChanges(state.data, state.formValues);

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
    list.appendChild(renderFlagRow(key, value, state, state.data, actions));
  }

  container.append(
    list,
    renderActionBar(state, state.data, hasUnsavedChanges, actions),
  );
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

  const mode = createToolbarBadge(data.mode, "purple");

  eyebrow.append(title, mode);

  const config = document.createElement("code");
  config.style.cssText =
    "font-size: 12px; opacity: 0.62; word-break: break-all;";
  config.textContent = data.configFile;

  header.append(eyebrow, config);
  return header;
}

function renderBanner(message: string, tone: "error" | "info"): HTMLElement {
  const banner = createToolbarCard(tone === "error" ? "red" : "gray");
  banner.style.cssText = "display: block; margin: 0 0 12px;";

  const text = document.createElement("p");
  text.style.cssText =
    "margin: 0; font-size: 13px; line-height: 1.45; white-space: pre-wrap;";
  text.textContent = message;
  banner.appendChild(text);

  return banner;
}

function renderFlagRow(
  key: string,
  value: unknown,
  state: ToolbarState,
  data: FlagDataSuccess,
  actions: ToolbarActions,
): HTMLElement {
  const row = createToolbarCard("gray");
  row.style.cssText = "display: grid; gap: 10px;";

  const title = document.createElement("div");
  title.style.cssText =
    "display: flex; justify-content: space-between; align-items: start; gap: 12px;";

  const keyGroup = document.createElement("div");
  keyGroup.style.cssText = "display: grid; gap: 5px;";

  const keyEl = document.createElement("code");
  keyEl.style.cssText = "font-size: 15px; line-height: 1.2;";
  keyEl.textContent = key;

  const editorSchema = data.editors[key] ?? {
    kind: "readonly",
    nullable: false,
  };

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
    title.appendChild(renderEditableBadge(state.isSaving));
    row.append(
      title,
      renderPrimitiveEditor(
        key,
        value,
        editorSchema as EditableEditorSchema,
        state,
        actions,
      ),
    );
    return row;
  }

  title.appendChild(renderReadonlyBadge());
  row.append(title, renderReadonlyValue(value));
  return row;
}

function renderEditableBadge(isSaving: boolean): HTMLElement {
  return createToolbarBadge(
    isSaving ? "saving" : "editable",
    isSaving ? "blue" : "green",
  );
}

function renderReadonlyBadge(): HTMLElement {
  return createToolbarBadge("read-only", "gray");
}

function renderPrimitiveEditor(
  key: string,
  initialValue: unknown,
  editorSchema: EditableEditorSchema,
  state: ToolbarState,
  actions: ToolbarActions,
): HTMLElement {
  if (editorSchema.kind === "boolean") {
    return renderBooleanEditor(key, initialValue, editorSchema, state, actions);
  }

  const editor = document.createElement("div");
  editor.style.cssText = "display: grid; gap: 8px;";

  const next = createInputForSchema(
    key,
    editorSchema,
    initialValue,
    state,
    actions,
  );
  editor.append(next.element);

  if (editorSchema.nullable && editorSchema.kind !== "null") {
    const actionRow = document.createElement("div");
    actionRow.style.cssText =
      "display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px;";

    const nullButton = createToolbarButton("Set null", "outline");
    nullButton.disabled = state.isSaving;
    nullButton.addEventListener("click", () => {
      actions.onChange(key, null);
    });
    actionRow.append(nullButton);
    editor.append(actionRow);
  }

  return editor;
}

function renderBooleanEditor(
  key: string,
  initialValue: unknown,
  editorSchema: Extract<EditableEditorSchema, { kind: "boolean" }>,
  state: ToolbarState,
  actions: ToolbarActions,
): HTMLElement {
  const editor = document.createElement("div");
  editor.style.cssText = "display: grid; gap: 10px;";

  const hint = document.createElement("p");
  hint.style.cssText =
    "margin: 0; font-size: 13px; line-height: 1.45; opacity: 0.74;";
  hint.textContent = editorSchema.nullable
    ? 'Adjust the draft, or use "Set null" before updating.'
    : "Adjust the draft and save everything with Update.";

  const controlGroup = document.createElement("div");
  controlGroup.style.cssText =
    "display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;";

  const toggle = document.createElement("astro-dev-toolbar-toggle");
  const currentValue = getBooleanFormValue(state, key, initialValue);
  toggle.toggleStyle = currentValue === true ? "green" : "red";
  toggle.input.checked = currentValue === true;
  toggle.input.disabled = state.isSaving;
  toggle.input.addEventListener("change", () => {
    actions.onChange(key, toggle.input.checked);
  });
  controlGroup.appendChild(toggle);

  if (editorSchema.nullable) {
    const nullButton = createToolbarButton("Set null", "outline");
    nullButton.disabled = state.isSaving;
    nullButton.addEventListener("click", () => {
      actions.onChange(key, null);
    });
    controlGroup.appendChild(nullButton);
  }

  editor.append(hint, controlGroup);
  return editor;
}

function createInputForSchema(
  key: string,
  editorSchema: Exclude<EditableEditorSchema, { kind: "boolean" }>,
  initialValue: unknown,
  state: ToolbarState,
  actions: ToolbarActions,
): {
  element: HTMLElement;
} {
  if (editorSchema.kind === "null") {
    const note = document.createElement("p");
    note.style.cssText =
      "margin: 0; font-size: 13px; line-height: 1.45; opacity: 0.74;";
    note.textContent = 'This schema only accepts "null".';
    return { element: note };
  }

  const input = document.createElement("input");
  input.dataset["flagInputKey"] = key;
  input.type = "text";
  input.style.cssText = baseControlStyles();
  input.placeholder = editorSchema.kind === "number" ? "0.0" : "Enter value";
  input.disabled = state.isSaving;

  const currentValue = state.formValues[key];
  if (currentValue === null) {
    input.value = "";
    input.placeholder = "null";
  } else if (typeof currentValue === "string") {
    input.value = currentValue;
  } else {
    input.value = getInitialInputValue(editorSchema.kind, initialValue);
  }

  input.addEventListener("input", () => {
    actions.onChange(key, input.value);
  });

  return { element: input };
}

function renderReadonlyValue(value: unknown): HTMLElement {
  const pre = document.createElement("pre");
  pre.style.cssText =
    "margin: 0; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; opacity: 0.78;";
  pre.textContent = JSON.stringify(value, null, 2);
  return pre;
}

function renderActionBar(
  state: ToolbarState,
  data: FlagDataSuccess,
  hasUnsavedChanges: boolean,
  actions: ToolbarActions,
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.12);";

  const resetButton = createToolbarButton("Reset", "outline");
  resetButton.disabled = state.isSaving || !hasUnsavedChanges;
  resetButton.addEventListener("click", () => {
    actions.onReset();
  });

  const updateButton = createToolbarButton(
    state.isSaving ? "Updating..." : "Update",
    "green",
  );
  updateButton.disabled = state.isSaving || !hasUnsavedChanges;
  updateButton.addEventListener("click", () => {
    try {
      actions.onSave({
        flags: buildDraftFlags(data, state.formValues),
        mode: data.mode,
      });
    } catch (error) {
      actions.onError(
        error instanceof Error ? error.message : "Failed to parse flag value.",
      );
    }
  });

  wrapper.append(resetButton, updateButton);
  return wrapper;
}

function createToolbarButton(
  label: string,
  buttonStyle: "green" | "outline",
): ToolbarButtonElement {
  const button = document.createElement(
    "astro-dev-toolbar-button",
  ) as unknown as ToolbarButtonElement;
  button.buttonStyle = buttonStyle;
  button.size = "small";
  button.textContent = label;
  return button;
}

function createToolbarBadge(
  label: string,
  badgeStyle: "blue" | "gray" | "green" | "purple",
): HTMLElement {
  const badge = document.createElement(
    "astro-dev-toolbar-badge",
  ) as HTMLElement & {
    badgeStyle: string;
    size: string;
  };
  badge.badgeStyle = badgeStyle;
  badge.size = "small";
  badge.textContent = label;
  return badge;
}

function createToolbarCard(cardStyle: "gray" | "red"): HTMLElement {
  const card = document.createElement(
    "astro-dev-toolbar-card",
  ) as HTMLElement & {
    cardStyle: string;
  };
  card.cardStyle = cardStyle;
  return card;
}

function baseControlStyles(): string {
  return "display: block; width: 100%; min-width: 0; box-sizing: border-box; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; background: rgba(255, 255, 255, 0.02); color: rgba(255, 255, 255, 0.92); caret-color: rgba(255, 255, 255, 0.92); padding: 12px 14px; font-size: 13px;";
}

function getInputFocusSnapshot(
  activeElement: FocusableNode | null | undefined,
): InputFocusSnapshot | undefined {
  if (activeElement?.tagName !== "INPUT") {
    return undefined;
  }

  const key = activeElement.dataset?.flagInputKey;
  if (!hasMessage(key)) {
    return undefined;
  }

  return {
    key,
    selectionEnd: activeElement.selectionEnd ?? null,
    selectionStart: activeElement.selectionStart ?? null,
  };
}

function findInputByKey(
  node: FocusableNode | null | undefined,
  key: string,
): FocusableNode | undefined {
  if (node == null) {
    return undefined;
  }

  if (node.tagName === "INPUT" && node.dataset?.flagInputKey === key) {
    return node;
  }

  const children = Array.from(node.children ?? []);
  for (const child of children) {
    const match = findInputByKey(child, key);
    if (match != null) {
      return match;
    }
  }

  return undefined;
}

function restoreInputFocus(
  container: FocusableNode,
  snapshot: InputFocusSnapshot | undefined,
): void {
  if (snapshot == null) {
    return;
  }

  const input = findInputByKey(container, snapshot.key);
  if (input?.focus == null) {
    return;
  }

  input.focus();

  if (snapshot.selectionStart == null || input.setSelectionRange == null) {
    return;
  }

  input.setSelectionRange(
    snapshot.selectionStart,
    snapshot.selectionEnd ?? snapshot.selectionStart,
  );
}

function hasMessage(value: string | undefined): value is string {
  return value != null && value !== "";
}

function createInitialFormValues(
  data: FlagDataSuccess,
): Record<string, FormValue> {
  return Object.fromEntries(
    Object.entries(data.editors)
      .filter(([, editorSchema]) => editorSchema.kind !== "readonly")
      .map(([key, editorSchema]) => [
        key,
        toInitialFormValue(
          editorSchema as EditableEditorSchema,
          data.flags[key],
        ),
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
  state: ToolbarState,
  key: string,
  initialValue: unknown,
): boolean | null {
  const currentValue = state.formValues[key];
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

type ToolbarActions = {
  onChange: (key: string, value: FormValue) => void;
  onError: (message: string) => void;
  onReset: () => void;
  onSave: (payload: FlagUpdateRequest) => void;
};

type ToolbarButtonElement = HTMLElement & {
  buttonStyle: string;
  disabled: boolean;
  size: string;
};

type EditableEditorSchema =
  | {
      kind: "boolean";
      nullable: boolean;
    }
  | {
      kind: "null";
      nullable: boolean;
    }
  | {
      kind: "number";
      nullable: boolean;
    }
  | {
      kind: "string";
      nullable: boolean;
    };

export const __testing__ = {
  baseControlStyles,
  getInputFocusSnapshot,
  renderActionBar,
  renderFlagRow,
  renderHeader,
  restoreInputFocus,
};
