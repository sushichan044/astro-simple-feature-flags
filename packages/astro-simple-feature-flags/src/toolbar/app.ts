import type { DevToolbarApp } from "astro";

import { defineToolbarApp } from "astro/toolbar";

import type { FlagDataPayload, FlagDataSuccess } from "./shared";

import { TOOLBAR_FLAG_DATA_EVENT } from "./shared";

const toolbarApp: DevToolbarApp = defineToolbarApp({
  init(canvas, _app, server) {
    const toolbarWindow = document.createElement("astro-dev-toolbar-window");
    toolbarWindow.style.cssText =
      "padding: 16px; width: fit-content; max-width: 400px; min-width: 280px;";

    const loading = document.createElement("p");
    loading.textContent = "Loading feature flags...";
    loading.style.cssText = "color: #ccc; margin: 0; font-size: 16px;";
    toolbarWindow.appendChild(loading);

    canvas.appendChild(toolbarWindow);

    server.on<FlagDataPayload>(TOOLBAR_FLAG_DATA_EVENT, (data) => {
      toolbarWindow.replaceChildren();
      if ("error" in data) {
        renderError(toolbarWindow, data.error);
      } else {
        renderContent(toolbarWindow, data);
      }
    });
  },
});

export default toolbarApp;

function renderError(container: HTMLElement, message: string): void {
  const el = document.createElement("p");
  el.style.cssText = "color: #f87171; margin: 0; font-size: 16px;";
  el.textContent = message;
  container.appendChild(el);
}

function renderContent(container: HTMLElement, data: FlagDataSuccess): void {
  const header = document.createElement("div");
  header.style.cssText =
    "margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #333;";

  const modeEl = document.createElement("p");
  modeEl.style.cssText = "margin: 0 0 4px; font-size: 16px; color: #aaa;";
  modeEl.textContent = `Vite Mode: ${data.mode}`;
  const configEl = document.createElement("p");
  configEl.style.cssText =
    "margin: 0; font-size: 14px; color: #666; word-break: break-all;";
  configEl.textContent = `Config: ${data.configFile}`;

  header.appendChild(modeEl);
  header.appendChild(configEl);
  container.appendChild(header);

  const entries = Object.entries(data.flags);
  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.style.cssText = "color: #666; margin: 0; font-size: 16px;";
    empty.textContent = "No flags defined.";
    container.appendChild(empty);
    return;
  }

  const list = document.createElement("dl");
  list.style.cssText =
    "display: grid; grid-template-columns: 1fr auto; row-gap: 8px; column-gap: 24px; margin: 0; padding: 0; align-items: center;";

  for (const [key, value] of entries) {
    const keyEl = document.createElement("dt");
    keyEl.style.cssText = "font-size: 17px; font-family: monospace;";
    keyEl.textContent = key;

    const valueEl = document.createElement("dd");
    valueEl.style.cssText = "margin: 0; justify-self: end;";
    valueEl.appendChild(renderValue(value));

    list.appendChild(keyEl);
    list.appendChild(valueEl);
  }

  container.appendChild(list);
}

function renderValue(value: unknown): HTMLElement {
  if (typeof value === "boolean") {
    const badge = document.createElement("astro-dev-toolbar-badge");
    badge.textContent = String(value);
    badge.badgeStyle = value ? "green" : "red";
    return badge;
  }

  const span = document.createElement("span");
  span.style.cssText = "font-size: 16px; font-family: monospace; color: #aaa;";
  span.textContent = JSON.stringify(value);
  return span;
}
