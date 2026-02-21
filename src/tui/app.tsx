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
        text: "Got it. I will outline a step-by-step plan and call out risks before we move forward.",
      },
    ],
    prompt: {
      inputText: "Why are you so dumb?",
      modeLabel: "Build",
      modelLabel: "GPT-5.2 Codex",
      providerLabel: "OpenAI",
      hints: ["ctrl+t variants", "tab agents", "ctrl+p commands"],
    },
  };

  return (
    <box flexDirection="column" height="100%">
      <Header title={ui.header.title} stats={ui.header.stats} />
      <MessagePanel messages={ui.messages} />
      <Prompt
        inputText={ui.prompt.inputText}
        modeLabel={ui.prompt.modeLabel}
        modelLabel={ui.prompt.modelLabel}
        providerLabel={ui.prompt.providerLabel}
        hints={ui.prompt.hints}
      />
    </box>
  );
};
