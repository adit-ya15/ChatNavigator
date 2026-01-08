import { chatgptAdapter } from "./adapters/chatgpt.js";
import { geminiAdapter } from "./adapters/gemini.js";
import { claudeAdapter } from "./adapters/claude.js";

const adapters = [
    chatgptAdapter,
    geminiAdapter,
    claudeAdapter
];

export function getAdapter() {
    return adapters.find(a => a.matches());
}
