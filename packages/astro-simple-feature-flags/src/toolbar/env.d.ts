import type { Icon } from "astro/runtime/client/dev-toolbar/ui-library/icons.js";

type ToolbarButtonBorderRadius = "normal" | "rounded";

type ToolbarButtonStyle =
  | "blue"
  | "ghost"
  | "gray"
  | "green"
  | "outline"
  | "purple"
  | "red"
  | "yellow";

type ToolbarColorStyle =
  | "blue"
  | "gray"
  | "green"
  | "purple"
  | "red"
  | "yellow";

type ToolbarButtonSize = "large" | "medium" | "small";
type ToolbarBadgeSize = "large" | "small";

interface ToolbarTooltipSection {
  clickAction?: () => Promise<void> | void;
  clickDescription?: string;
  content?: string;
  icon?: Icon;
  inlineTitle?: string;
  title?: string;
}

declare module "preact" {
  namespace JSX {
    interface IntrinsicElements {
      "astro-dev-toolbar-badge": ToolbarBadgeAttributes;
      "astro-dev-toolbar-button": ToolbarButtonAttributes;
      "astro-dev-toolbar-card": ToolbarCardAttributes;
      "astro-dev-toolbar-highlight": ToolbarHighlightAttributes;
      "astro-dev-toolbar-icon": ToolbarIconAttributes;
      "astro-dev-toolbar-radio-checkbox": ToolbarRadioCheckboxAttributes;
      "astro-dev-toolbar-select": ToolbarSelectAttributes;
      "astro-dev-toolbar-toggle": ToolbarToggleAttributes;
      "astro-dev-toolbar-tooltip": ToolbarTooltipAttributes;
      "astro-dev-toolbar-window": ToolbarWindowAttributes;
    }

    interface ToolbarButtonAttributes
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      extends ButtonHTMLAttributes<
        HTMLElementTagNameMap["astro-dev-toolbar-button"]
      > {
      "button-border-radius"?: ToolbarButtonBorderRadius;
      "button-style"?: ToolbarButtonStyle;
      size?: ToolbarButtonSize;
    }

    interface ToolbarBadgeAttributes
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      extends HTMLAttributes<HTMLElementTagNameMap["astro-dev-toolbar-badge"]> {
      "badge-style"?: ToolbarColorStyle;
      size?: ToolbarBadgeSize;
    }

    interface ToolbarCardAttributes
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      extends HTMLAttributes<HTMLElementTagNameMap["astro-dev-toolbar-card"]> {
      "card-style"?: ToolbarColorStyle;
      clickAction?: () => Promise<void> | void;
      icon?: Icon;
      link?: string;
    }

    interface ToolbarToggleAttributes
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      extends HTMLAttributes<
        HTMLElementTagNameMap["astro-dev-toolbar-toggle"]
      > {
      "toggle-style"?: ToolbarColorStyle;
    }

    interface ToolbarRadioCheckboxAttributes
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      extends HTMLAttributes<
        HTMLElementTagNameMap["astro-dev-toolbar-radio-checkbox"]
      > {
      "radio-style"?: ToolbarColorStyle;
    }

    interface ToolbarHighlightAttributes
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      extends HTMLAttributes<
        HTMLElementTagNameMap["astro-dev-toolbar-highlight"]
      > {
      "highlight-style"?: ToolbarColorStyle;
      icon?: Icon;
    }

    interface ToolbarTooltipAttributes
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      extends HTMLAttributes<
        HTMLElementTagNameMap["astro-dev-toolbar-tooltip"]
      > {
      "data-show"?: "false" | "true";
      sections?: ToolbarTooltipSection[];
    }

    interface ToolbarIconAttributes
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      extends HTMLAttributes<HTMLElementTagNameMap["astro-dev-toolbar-icon"]> {
      icon?: Icon;
    }

    interface ToolbarSelectAttributes
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      extends HTMLAttributes<
        HTMLElementTagNameMap["astro-dev-toolbar-select"]
      > {
      "select-style"?: ToolbarColorStyle;
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    type ToolbarWindowAttributes = HTMLAttributes<
      HTMLElementTagNameMap["astro-dev-toolbar-window"]
    >;
  }
}

export {};
