import type { KeyBinding } from "@opentui/core";

export const textareaKeybindings: KeyBinding[] = [
  { name: "return", action: "submit" },
  { name: "return", shift: true, action: "newline" },
  { name: "return", meta: true, action: "newline" },
  { name: "return", ctrl: true, action: "newline" },
  { name: "j", ctrl: true, action: "newline" },
];
