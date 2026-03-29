import type { DevToolbarButton } from "astro/runtime/client/dev-toolbar/ui-library/index.js";
import type { JSX, MouseEventHandler, TargetedEvent } from "preact";

import { useCallback } from "preact/hooks";

type ToolbarButtonProps = JSX.ToolbarButtonAttributes & {
  onClick?: MouseEventHandler<DevToolbarButton>;
};

export const ToolbarButton = ({
  "button-border-radius": buttonBorderRadius,
  "button-style": buttonStyle,
  onClick,
  size,
  ...props
}: ToolbarButtonProps): JSX.Element => {
  return (
    <astro-dev-toolbar-button
      button-border-radius={buttonBorderRadius}
      button-style={buttonStyle}
      onClick={onClick}
      size={size}
      {...props}
    />
  );
};

type ToolbarBudgeProps = JSX.ToolbarBadgeAttributes;

export const ToolbarBadge = ({
  "badge-style": badgeStyle,
  size,
  ...props
}: ToolbarBudgeProps): JSX.Element => {
  return (
    <astro-dev-toolbar-badge badge-style={badgeStyle} size={size} {...props} />
  );
};

type ToolbarCardProps = JSX.ToolbarCardAttributes;

export const ToolbarCard = ({
  "card-style": cardStyle,
  clickAction,
  icon,
  link,
  ...props
}: ToolbarCardProps): JSX.Element => {
  return (
    <astro-dev-toolbar-card
      card-style={cardStyle}
      clickAction={clickAction}
      icon={icon}
      link={link}
      {...props}
    />
  );
};

type ToolbarToggleProps = Omit<JSX.ToolbarToggleAttributes, "onChange"> & {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (event: TargetedEvent<HTMLInputElement, Event>) => void;
};

export function ToolbarToggle({
  onChange,
  "toggle-style": toggleStyle,
  ...props
}: ToolbarToggleProps): JSX.Element {
  const handler = useCallback(
    (event: TargetedEvent<HTMLInputElement, Event>) => {
      onChange?.(event);
    },
    [onChange],
  );

  return (
    <astro-dev-toolbar-toggle
      ref={(element) => {
        if (element == null) {
          return;
        }

        const toggleElement = element;
        if (props.checked != null) {
          toggleElement.input.checked = props.checked;
        }
        if (props.disabled != null) {
          toggleElement.input.disabled = props.disabled;
        }

        // @ts-expect-error type cannot be narrowed
        toggleElement.input.addEventListener("change", handler);
        return () => {
          // @ts-expect-error type cannot be narrowed
          toggleElement.input.removeEventListener("change", handler);
        };
      }}
      toggle-style={toggleStyle}
      {...props}
    />
  );
}

type ToolbarRadioCheckboxProps = Omit<
  JSX.ToolbarRadioCheckboxAttributes,
  "onChange"
> & {
  onChange?: (event: TargetedEvent<HTMLInputElement, Event>) => void;
};

export const ToolbarRadioCheckbox = ({
  onChange,
  "radio-style": radioStyle,
  ...props
}: ToolbarRadioCheckboxProps): JSX.Element => {
  const handler = useCallback(
    (event: TargetedEvent<HTMLInputElement, Event>) => {
      onChange?.(event);
    },
    [onChange],
  );

  return (
    <astro-dev-toolbar-radio-checkbox
      radio-style={radioStyle}
      ref={(element) => {
        if (element == null) {
          return;
        }

        const radioCheckboxElement = element;

        // @ts-expect-error type cannot be narrowed
        radioCheckboxElement.input.addEventListener("change", handler);
        return () => {
          // @ts-expect-error type cannot be narrowed
          radioCheckboxElement.input.removeEventListener("change", handler);
        };
      }}
      {...props}
    />
  );
};

type ToolbarHighlightProps = JSX.ToolbarHighlightAttributes;

export const ToolbarHighlight = ({
  "highlight-style": highlightStyle,
  icon,
  ...props
}: ToolbarHighlightProps): JSX.Element => {
  return (
    <astro-dev-toolbar-highlight
      highlight-style={highlightStyle}
      icon={icon}
      {...props}
    />
  );
};

type ToolbarTooltipProps = JSX.ToolbarTooltipAttributes;

export const ToolbarTooltip = ({
  "data-show": dataShow,
  sections,
  ...props
}: ToolbarTooltipProps): JSX.Element => {
  return (
    <astro-dev-toolbar-tooltip
      data-show={dataShow}
      sections={sections}
      {...props}
    />
  );
};

type ToolbarIconProps = JSX.ToolbarIconAttributes;

export const ToolbarIcon = ({
  icon,
  ...props
}: ToolbarIconProps): JSX.Element => {
  return <astro-dev-toolbar-icon icon={icon} {...props} />;
};

type ToolbarSelectProps = Omit<JSX.ToolbarSelectAttributes, "onChange"> & {
  onChange?: (event: TargetedEvent<HTMLSelectElement, Event>) => void;
};

export const ToolbarSelect = ({
  onChange,
  "select-style": selectStyle,
  ...props
}: ToolbarSelectProps): JSX.Element => {
  const handler = useCallback(
    (event: TargetedEvent<HTMLSelectElement, Event>) => {
      onChange?.(event);
    },
    [onChange],
  );

  return (
    <astro-dev-toolbar-select
      ref={(element) => {
        if (element == null) {
          return;
        }

        const selectElement = element;

        // @ts-expect-error type cannot be narrowed
        selectElement.element.addEventListener("change", handler);
        return () => {
          // @ts-expect-error type cannot be narrowed
          selectElement.element.removeEventListener("change", handler);
        };
      }}
      select-style={selectStyle}
      {...props}
    />
  );
};
