import { describe, expect, it } from "vitest";

import type { FlagDataSuccess } from "./shared";

import { __testing__ } from "./app";

const noop = (): void => undefined;

class FakeElement {
  children: FakeElement[] = [];
  dataset: Record<string, string | undefined> = {};
  disabled = false;
  focused = false;
  selectionEnd: number | null = null;
  selectionStart: number | null = null;
  style = {
    cssText: "",
  };
  tagName: string;
  textContent = "";

  constructor(tagName: string) {
    this.tagName = tagName;
  }

  addEventListener(): void {
    noop();
  }

  append(...children: FakeElement[]): void {
    this.children.push(...children);
  }

  appendChild(child: FakeElement): FakeElement {
    this.children.push(child);
    return child;
  }

  focus(): void {
    this.focused = true;
  }

  replaceChildren(...children: FakeElement[]): void {
    this.children = [...children];
  }

  setSelectionRange(start: number, end: number): void {
    this.selectionStart = start;
    this.selectionEnd = end;
  }
}

const createFakeDocument = () => {
  return {
    createElement(tagName: string) {
      return new FakeElement(tagName);
    },
  };
};

const getChild = (element: FakeElement, index: number): FakeElement => {
  const child = element.children[index];

  if (child == null) {
    throw new Error(`Missing child at index ${index}`);
  }

  return child;
};

const sampleData: FlagDataSuccess = {
  configFile: "src/flags.config.ts",
  editors: {
    readOnlyFlag: {
      kind: "readonly",
      nullable: false,
    },
  },
  flags: {
    readOnlyFlag: { nested: true },
  },
  mode: "development",
};

describe("toolbar UI components", () => {
  it("renders the header mode with Astro badge component", () => {
    const previousDocument = globalThis.document;
    globalThis.document = createFakeDocument() as never;

    try {
      const header = __testing__.renderHeader(
        sampleData,
      ) as unknown as FakeElement;
      const eyebrow = getChild(header, 0);

      expect(eyebrow).toBeDefined();
      expect(eyebrow.children[1]?.tagName).toBe("astro-dev-toolbar-badge");
    } finally {
      globalThis.document = previousDocument;
    }
  });

  it("renders read-only flag rows with Astro card and badge components", () => {
    const previousDocument = globalThis.document;
    globalThis.document = createFakeDocument() as never;

    try {
      const row = __testing__.renderFlagRow(
        "readOnlyFlag",
        sampleData.flags["readOnlyFlag"],
        {
          formValues: {},
          isSaving: false,
        },
        sampleData,
        {
          onChange: noop,
          onError: noop,
          onReset: noop,
          onSave: noop,
        },
      ) as unknown as FakeElement;

      expect(row.tagName).toBe("astro-dev-toolbar-card");
      const title = getChild(row, 0);
      expect(title).toBeDefined();
      expect(title.children[1]?.tagName).toBe("astro-dev-toolbar-badge");
    } finally {
      globalThis.document = previousDocument;
    }
  });

  it("renders the action bar with Astro button components", () => {
    const previousDocument = globalThis.document;
    globalThis.document = createFakeDocument() as never;

    try {
      const actionBar = __testing__.renderActionBar(
        {
          formValues: {},
          isSaving: false,
        },
        sampleData,
        true,
        {
          onChange: noop,
          onError: noop,
          onReset: noop,
          onSave: noop,
        },
      ) as unknown as FakeElement;

      expect(actionBar.children[0]?.tagName).toBe("astro-dev-toolbar-button");
      expect(actionBar.children[1]?.tagName).toBe("astro-dev-toolbar-button");
    } finally {
      globalThis.document = previousDocument;
    }
  });

  it("uses input styles with readable text color and roomier padding", () => {
    const styles = __testing__.baseControlStyles();

    expect(styles).toContain("padding: 12px 14px;");
    expect(styles).toContain("color:");
  });

  it("restores focus to the matching input after rerender", () => {
    const activeInput = new FakeElement("INPUT");
    activeInput.dataset["flagInputKey"] = "barReleaseRate";
    activeInput.selectionStart = 1;
    activeInput.selectionEnd = 1;

    const snapshot = __testing__.getInputFocusSnapshot(activeInput);
    const rerenderedContainer = new FakeElement("DIV");
    const rerenderedInput = new FakeElement("INPUT");
    rerenderedInput.dataset["flagInputKey"] = "barReleaseRate";
    rerenderedContainer.appendChild(rerenderedInput);

    __testing__.restoreInputFocus(rerenderedContainer, snapshot);

    expect(rerenderedInput.focused).toBe(true);
    expect(rerenderedInput.selectionStart).toBe(1);
    expect(rerenderedInput.selectionEnd).toBe(1);
  });
});
