// repro.js
const { JSDOM } = require("jsdom");

// Mocking the DOM environment
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
global.document = dom.window.document;
global.window = dom.window;

// ---------------------------------------------------------
// PASTE content.js logic here (simplified for the test)
// ---------------------------------------------------------

let cachedMessages = [];
let idCounter = 0;
const nodeToId = new WeakMap();

function collectUserMessages() {
    // Mock user messages
    const nodes = document.querySelectorAll('.message');

    cachedMessages = Array.from(nodes).map((node) => {
        if (!nodeToId.has(node)) {
            nodeToId.set(node, `chat-nav-${++idCounter}`);
        }
        const id = nodeToId.get(node);
        node.dataset.chatNavId = id;
        return { id, text: node.textContent };
    });
}
// ---------------------------------------------------------

function simulateChatLoad(messageTexts) {
    document.body.innerHTML = ''; // Clear previous chat
    messageTexts.forEach(text => {
        const div = document.createElement('div');
        div.className = 'message';
        div.textContent = text;
        document.body.appendChild(div);
    });
    collectUserMessages();
}

console.log("--- Simulation Start ---");

// 1. Load Chat A
console.log("Loading Chat A...");
simulateChatLoad(["Hello", "How are you?"]);
console.log("Chat A IDs:", cachedMessages.map(m => m.id));
const chatA_first_id = cachedMessages[0].id;

// 2. Switch to Chat B
console.log("\nSwitching to Chat B...");
simulateChatLoad(["Python help", "Code snippet"]);
console.log("Chat B IDs:", cachedMessages.map(m => m.id));

// 3. Switch back to Chat A (User expects same IDs for bookmarks to work)
console.log("\nSwitching back to Chat A...");
simulateChatLoad(["Hello", "How are you?"]);
console.log("Chat A (Reloaded) IDs:", cachedMessages.map(m => m.id));

if (cachedMessages[0].id !== chatA_first_id) {
    console.error("\n❌ FAIL: IDs drifted! Bookmarks will be lost.");
} else {
    console.log("\n✅ PASS: IDs are stable.");
}
