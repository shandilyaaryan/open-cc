import { createEffect } from "solid-js";
import type { KeyEvent, TextareaRenderable } from "@opentui/core";
import { darkOnly as theme } from "../theme";
import { EmptyBorder } from "../ui/border";
import { textareaKeybindings } from "./prompt/textarea-keybindings";

type PromptProps = {
  inputText: string;
  modeLabel: string;
  modelLabel: string;
  providerLabel: string;
  hints: { key: string; label: string; visible?: boolean }[];
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  onCycleMode?: () => void;
};

export const Prompt = (props: PromptProps) => {
  let input: TextareaRenderable | undefined;

  const handleKeyDown = (event: KeyEvent) => {
    if (event.name === "tab") {
      event.preventDefault();
      props.onCycleMode?.();
      return;
    }
  };

  createEffect(() => {
    if (!input || input.isDestroyed) return;
    if (input.plainText !== props.inputText) {
      input.setText(props.inputText);
    }
  });

  return (
    <box marginTop={1} marginLeft={1} marginRight={1} flexDirection="column">
      <box
        border={["left"]}
        borderColor={theme.borderActive}
        customBorderChars={{
          ...EmptyBorder,
          vertical: "┃",
          bottomLeft: "╹",
        }}
      >
        <box
          paddingLeft={2}
          paddingRight={2}
          paddingTop={1}
          flexShrink={0}
          backgroundColor={theme.backgroundElement}
          flexGrow={1}
        >
          <textarea
            placeholder={props.inputText ? "" : "Ask anything..."}
            textColor={theme.text}
            focusedTextColor={theme.text}
            minHeight={1}
            maxHeight={6}
            onContentChange={() => {
              if (!input || input.isDestroyed) return;
              const value = input.plainText ?? "";
              props.onChange?.(value);
            }}
            keyBindings={textareaKeybindings}
            onKeyDown={handleKeyDown}
            onSubmit={() => props.onSubmit?.()}
            ref={(ref: TextareaRenderable) => {
              input = ref;
              if (props.inputText && ref.plainText !== props.inputText) {
                ref.setText(props.inputText);
              }
            }}
            onMouseDown={(event) => event.target?.focus()}
            focusedBackgroundColor={theme.backgroundElement}
            cursorColor={theme.text}
          />
          <box flexDirection="row" gap={1} paddingTop={1}>
            <text fg={theme.accent}>{props.modeLabel}</text>
            <text fg={theme.text}>{props.modelLabel}</text>
            <text fg={theme.textMuted}>{props.providerLabel}</text>
          </box>
        </box>
      </box>
      <box
        height={1}
        border={["left"]}
        borderColor={theme.borderActive}
        customBorderChars={{
          ...EmptyBorder,
          vertical: "╹",
        }}
      >
        <box
          height={1}
          border={["bottom"]}
          borderColor={theme.backgroundElement}
          customBorderChars={{
            ...EmptyBorder,
            horizontal: "▀",
          }}
        />
      </box>
      <box flexDirection="row" justifyContent="flex-end" paddingRight={2} paddingTop={1} gap={2}>
        {props.hints
          .filter((hint) => hint.visible !== false)
          .map((hint) => (
            <text fg={theme.text}>
              {hint.key} <span style={{ fg: theme.textMuted }}>{hint.label}</span>
            </text>
          ))}
      </box>
    </box>
  );
};
