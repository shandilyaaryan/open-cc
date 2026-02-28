import { darkOnly as theme } from "../theme";
import { EmptyBorder, SplitBorder } from "../ui/border";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  status?: "streaming" | "complete";
};

type MessagePanelProps = {
  messages: Message[];
};

type Block = {
  type: "text" | "code";
  lines: string[];
};

const parseBlocks = (text: string): Block[] => {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let buffer: string[] = [];
  let inCode = false;

  const push = (type: Block["type"]) => {
    if (buffer.length === 0) return;
    blocks.push({ type, lines: buffer });
    buffer = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      push(inCode ? "code" : "text");
      inCode = !inCode;
      continue;
    }
    buffer.push(line);
  }

  push(inCode ? "code" : "text");
  return blocks;
};

const renderInline = (line: string) => {
  const parts = line.split(/`([^`]+)`/g);
  return (
    <text>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span style={{ fg: theme.textMuted }}>{part}</span>
        ) : (
          <span style={{ fg: theme.text }}>{part}</span>
        ),
      )}
    </text>
  );
};

export const MessagePanel = (props: MessagePanelProps) => (
  <box
    flexDirection="column"
    flexGrow={1}
    gap={0}
    marginTop={1}
    marginLeft={1}
    marginRight={1}
    paddingTop={1}
    paddingBottom={1}
  >
    {props.messages.map((message, index) =>
      message.role === "user" ? (
        <box
          marginTop={index === 0 ? 0 : 1}
          border={["left"]}
          borderColor={theme.accent}
          customBorderChars={SplitBorder.customBorderChars}
        >
          <box
            paddingTop={1}
            paddingBottom={1}
            paddingLeft={2}
            backgroundColor={theme.backgroundPanel}
            flexShrink={0}
          >
            <text fg={theme.text}>{message.text}</text>
          </box>
        </box>
      ) : (
        <box paddingTop={1} paddingBottom={1} paddingLeft={2} paddingRight={2} flexDirection="column" gap={1}>
          {parseBlocks(message.text).map((block) =>
            block.type === "code" ? (
              <box backgroundColor={theme.backgroundPanel} paddingLeft={2} paddingRight={2} paddingTop={1} paddingBottom={1}>
                <text fg={theme.text}>{block.lines.join("\n")}</text>
              </box>
            ) : (
              <box flexDirection="column" gap={0}>
                {block.lines.map((line) => renderInline(line))}
              </box>
            ),
          )}
          {message.status === "streaming" ? <text fg={theme.text}>▌</text> : null}
        </box>
      ),
    )}
  </box>
);
