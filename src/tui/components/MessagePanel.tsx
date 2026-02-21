import { BorderChars } from "@opentui/core";
import { darkOnly as theme } from "../theme";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type MessagePanelProps = {
  messages: Message[];
};

export const MessagePanel = (props: MessagePanelProps) => (
  <box
    flexDirection="column"
    flexGrow={1}
    gap={1}
    marginTop={1}
    marginLeft={1}
    marginRight={1}
    paddingTop={1}
    paddingBottom={1}
  >
    {props.messages.map((message) =>
      message.role === "user" ? (
        <box
          paddingTop={1}
          paddingBottom={1}
          paddingLeft={2}
          paddingRight={2}
          backgroundColor={theme.backgroundPanel}
          border={["left"]}
          borderColor={theme.borderActive}
          customBorderChars={{
            ...BorderChars.single,
            vertical: "┃",
            bottomLeft: "╹",
          }}
        >
          <text fg={theme.text}>{message.text}</text>
        </box>
      ) : (
        <box
          paddingTop={1}
          paddingBottom={1}
          paddingLeft={2}
          paddingRight={2}
        >
          <text fg={theme.text}>{message.text}</text>
        </box>
      ),
    )}
  </box>
);
