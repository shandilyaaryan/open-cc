import { BorderChars } from "@opentui/core";
import { darkOnly as theme } from "../theme";

type PromptProps = {
  inputText: string;
  modeLabel: string;
  modelLabel: string;
  providerLabel: string;
  hints: string[];
};

export const Prompt = (props: PromptProps) => (
  <box marginTop={1} marginLeft={1} marginRight={1} flexDirection="column">
    <box
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      paddingRight={2}
      backgroundColor={theme.backgroundElement}
      border={["left"]}
      borderColor={theme.borderActive}
      customBorderChars={{
        ...BorderChars.single,
        vertical: "┃",
        bottomLeft: "╹",
      }}
    >
      <text fg={theme.text}>{props.inputText}</text>
      <box flexDirection="row" gap={1} paddingTop={1}>
        <text fg={theme.accent}>{props.modeLabel}</text>
        <text fg={theme.text}>{props.modelLabel}</text>
        <text fg={theme.textMuted}>{props.providerLabel}</text>
      </box>
    </box>
    <box
      height={1}
      border={["left"]}
      borderColor={theme.borderActive}
      customBorderChars={{
        ...BorderChars.single,
        vertical: "╹",
        topLeft: " ",
        topRight: " ",
        bottomLeft: " ",
        bottomRight: " ",
        horizontal: " ",
        topT: " ",
        bottomT: " ",
        leftT: " ",
        rightT: " ",
        cross: " ",
      }}
    >
      <box
        height={1}
        border={["bottom"]}
        borderColor={theme.backgroundElement}
        customBorderChars={{
          ...BorderChars.single,
          topLeft: " ",
          topRight: " ",
          bottomLeft: " ",
          bottomRight: " ",
          vertical: " ",
          horizontal: "▀",
          topT: " ",
          bottomT: " ",
          leftT: " ",
          rightT: " ",
          cross: " ",
        }}
      />
    </box>
    <box
      flexDirection="row"
      justifyContent="flex-end"
      paddingRight={2}
      paddingTop={1}
      gap={2}
    >
      {props.hints.map((hint) => (
        <text fg={theme.textMuted}>{hint}</text>
      ))}
    </box>
  </box>
);
