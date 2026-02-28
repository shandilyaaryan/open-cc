import { createSignal } from "solid-js";
import { darkOnly as theme } from "./theme";
import { Header } from "./components/Header";
import { MessagePanel } from "./components/MessagePanel";
import { Prompt } from "./components/Prompt";

export const App = () => {
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
    ],
    prompt: {
      inputText: "",
      modeLabel: "Plan",
      modelLabel: "GPT-5.2 Codex",
      providerLabel: "OpenAI",
      hints: [
        { key: "ctrl+t", label: "variants" },
        { key: "tab", label: "agents" },
        { key: "ctrl+p", label: "commands" },
      ],
    },
  };

  const [promptText, setPromptText] = createSignal(ui.prompt.inputText);
  const [modeLabel, setModeLabel] = createSignal(ui.prompt.modeLabel);

  const cycleMode = () => {
    setModeLabel((value) => (value === "Plan" ? "Build" : "Plan"));
  };

  const submitPrompt = () => {
    if (!promptText().trim()) return;
    setPromptText("");
  };

  return (
    <box flexDirection="column" height="100%" backgroundColor={theme.background}>
      <Header title={ui.header.title} stats={ui.header.stats} />
      <MessagePanel messages={ui.messages} />
      <Prompt
        inputText={promptText()}
        modeLabel={modeLabel()}
        modelLabel={ui.prompt.modelLabel}
        providerLabel={ui.prompt.providerLabel}
        hints={ui.prompt.hints}
        onChange={setPromptText}
        onSubmit={submitPrompt}
        onCycleMode={cycleMode}
      />
    </box>
  );
};
