type ClaudeUsage = {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
};

type ClaudeModelUsage = Record<
  string,
  {
    inputTokens?: number;
    outputTokens?: number;
    cacheReadInputTokens?: number;
    cacheCreationInputTokens?: number;
    costUSD?: number;
    contextWindow?: number;
    maxOutputTokens?: number;
  }
>;

export type ClaudeStreamEvent =
  | {
      type: "system";
      sessionId?: string;
      model?: string;
      version?: string;
    }
  | {
      type: "delta";
      text: string;
    }
  | {
      type: "assistant";
      text: string;
    }
  | {
      type: "result";
      sessionId?: string;
      costUsd?: number;
      usage?: ClaudeUsage;
      modelUsage?: ClaudeModelUsage;
    }
  | {
      type: "error";
      message: string;
    };

type ClaudeRunOptions = {
  prompt: string;
  sessionId?: string;
  model?: string;
  permissionMode?: "plan" | "default";
};

const decodeText = (decoder: TextDecoder, chunk: Uint8Array) =>
  decoder.decode(chunk, { stream: true });

export const streamClaude = async (
  options: ClaudeRunOptions,
  onEvent: (event: ClaudeStreamEvent) => void,
): Promise<void> => {
  const args = [
    "-p",
    options.prompt,
    "--output-format",
    "stream-json",
    "--verbose",
    "--include-partial-messages",
  ];

  if (options.sessionId) {
    args.push("--session-id", options.sessionId);
  }

  if (options.model) {
    args.push("--model", options.model);
  }

  if (options.permissionMode === "plan") {
    args.push("--permission-mode", "plan");
  }

  const proc = Bun.spawn(["claude", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const decoder = new TextDecoder();
  let buffer = "";

  const handleLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const payload = JSON.parse(trimmed);

      if (payload.type === "system" && payload.subtype === "init") {
        onEvent({
          type: "system",
          sessionId: payload.session_id,
          model: payload.model,
          version: payload.claude_code_version,
        });
        return;
      }

      if (payload.type === "stream_event") {
        if (
          payload.event?.type === "content_block_delta" &&
          payload.event?.delta?.type === "text_delta"
        ) {
          onEvent({ type: "delta", text: payload.event.delta.text ?? "" });
          return;
        }
        return;
      }

      if (payload.type === "assistant") {
        const text = (payload.message?.content ?? [])
          .filter((part: { type: string }) => part.type === "text")
          .map((part: { text?: string }) => part.text ?? "")
          .join("");
        onEvent({ type: "assistant", text });
        return;
      }

      if (payload.type === "result") {
        onEvent({
          type: "result",
          sessionId: payload.session_id,
          costUsd: payload.total_cost_usd,
          usage: payload.usage,
          modelUsage: payload.modelUsage,
        });
      }
    } catch (error) {
      onEvent({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to parse stream event",
      });
    }
  };

  if (proc.stdout) {
    for await (const chunk of proc.stdout) {
      buffer += decodeText(decoder, chunk);
      let newlineIndex = buffer.indexOf("\n");
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        handleLine(line);
        newlineIndex = buffer.indexOf("\n");
      }
    }
  }

  if (buffer.trim()) {
    handleLine(buffer);
  }

  if (proc.stderr) {
    const stderr = await new Response(proc.stderr).text();
    if (stderr.trim()) {
      onEvent({ type: "error", message: stderr.trim() });
    }
  }

  await proc.exited;
};
