import { createSignal } from "solid-js";
import { streamClaude } from "./claude";
import { darkOnly as theme } from "./theme";
import { Header } from "./components/Header";
import { MessagePanel } from "./components/MessagePanel";
import { Prompt } from "./components/Prompt";

export const App = () => {
  type Message = {
    id: string;
    role: "user" | "assistant";
    text: string;
    status?: "streaming" | "complete";
  };

  const ui = {
    header: {
      title: "Plan to build a Spaceship to Mars",
      stats: "10,041  3% ($0.00) v1.1.51",
    },
    messages: [
      {
        id: "m1",
        role: "user" as const,
        text:
          "hey claude so what i want you to do is to build a spaceship to Mars. MAKE NO MISTAKES",
      },
      {
        id: "m2",
        role: "assistant" as const,
        text:
          "Got it. I will outline a step-by-step plan and call out risks before we move forward. Here is a quick example with `inline code` and a block:\n\n```ts\nexport function planMission() {\n  return \"Draft plan and validate risks\";\n}\n```",
      },
    ] as Message[],
    prompt: {
      inputText: "",
      modeLabel: "Plan",
      modelLabel: "claude-sonnet-4-5",
      providerLabel: "Anthropic",
      hints: [
        { key: "ctrl+t", label: "variants" },
        { key: "tab", label: "agents" },
        { key: "ctrl+p", label: "commands" },
      ],
    },
  };

  const [sessionId, setSessionId] = createSignal<string | undefined>(undefined);
  const [messages, setMessages] = createSignal<Message[]>(ui.messages);
  const [stats, setStats] = createSignal(ui.header.stats);
  const [promptText, setPromptText] = createSignal(ui.prompt.inputText);
  const [modeLabel, setModeLabel] = createSignal(ui.prompt.modeLabel);
  const [modelLabel, setModelLabel] = createSignal(ui.prompt.modelLabel);
  const [providerLabel, setProviderLabel] = createSignal(ui.prompt.providerLabel);
  let messageCounter = 0;

  const cycleMode = () => {
    setModeLabel((value) => (value === "Plan" ? "Build" : "Plan"));
  };

  const updateMessage = (id: string, updater: (text: string) => string, status?: "streaming" | "complete") => {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? { ...message, text: updater(message.text), status: status ?? message.status }
          : message,
      ),
    );
  };

  const formatStats = (totalTokens?: number, contextPct?: number, costUsd?: number, version?: string) => {
    const tokenPart = totalTokens ? totalTokens.toLocaleString() : "—";
    const pctPart = contextPct !== undefined ? ` ${contextPct}%` : "";
    const costPart = costUsd !== undefined ? ` ($${costUsd.toFixed(2)})` : "";
    const versionPart = version ? ` v${version}` : "";
    return `${tokenPart}${pctPart}${costPart}${versionPart}`.trim();
  };

  const createMessageId = (prefix: string) => {
    messageCounter += 1;
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${messageCounter}`;
  };

  const submitPrompt = async () => {
    if (!promptText().trim()) return;
    const prompt = promptText().trim();
    setPromptText("");

    const userId = createMessageId("u");
    const assistantId = createMessageId("a");

    setMessages((current) => [
      ...current,
      { id: userId, role: "user", text: prompt },
      { id: assistantId, role: "assistant", text: "", status: "streaming" },
    ]);

    await streamClaude(
      {
        prompt,
        sessionId: sessionId(),
        model: modelLabel(),
        permissionMode: modeLabel().toLowerCase() === "plan" ? "plan" : "default",
      },
      (event) => {
        if (event.type === "system") {
          if (event.sessionId) setSessionId(event.sessionId);
          if (event.model) setModelLabel(event.model);
          if (event.version) setStats((prev) => formatStats(undefined, undefined, undefined, event.version));
        }

        if (event.type === "delta") {
          updateMessage(assistantId, (text) => text + event.text, "streaming");
        }

        if (event.type === "assistant") {
          updateMessage(assistantId, () => event.text, "complete");
        }

        if (event.type === "result") {
          if (event.sessionId) setSessionId(event.sessionId);
          const usage = event.usage;
          const totalTokens = usage
            ? (usage.input_tokens ?? 0) +
              (usage.output_tokens ?? 0) +
              (usage.cache_read_input_tokens ?? 0) +
              (usage.cache_creation_input_tokens ?? 0)
            : undefined;

          let contextPct: number | undefined = undefined;
          if (event.modelUsage) {
            const firstModel = Object.values(event.modelUsage)[0];
            if (firstModel?.contextWindow && totalTokens !== undefined) {
              contextPct = Math.round((totalTokens / firstModel.contextWindow) * 100);
            }
          }

          setStats(formatStats(totalTokens, contextPct, event.costUsd));
        }

        if (event.type === "error") {
          updateMessage(assistantId, () => `Error: ${event.message}`, "complete");
        }
      },
    );
  };

  return (
    <box flexDirection="column" height="100%" backgroundColor={theme.background}>
      <Header title={ui.header.title} stats={stats()} />
      <MessagePanel messages={messages()} />
      <Prompt
        inputText={promptText()}
        modeLabel={modeLabel()}
        modelLabel={modelLabel()}
        providerLabel={providerLabel()}
        hints={ui.prompt.hints}
        onChange={setPromptText}
        onSubmit={submitPrompt}
        onCycleMode={cycleMode}
      />
    </box>
  );
};
