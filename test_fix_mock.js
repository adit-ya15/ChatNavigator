// test_fix_mock.js

// Minimal DOM Mock
class MockNode {
    constructor(text) {
        this.innerText = text;
        this.dataset = {};
    }
}

global.document = {
    nodes: [],
    querySelectorAll: function(selector) {
        return this.nodes;
    },
    // Test helper to set state
    setNodes: function(texts) {
        this.nodes = texts.map(t => new MockNode(t));
    }
};

// ---------------------------------------------------------
// PASTE UPDATED LOGIC (Simplified adaption of content.js)
// ---------------------------------------------------------

let cachedMessages = [];

function collectUserMessages() {
    const nodes = document.querySelectorAll(
        '[data-message-author-role="user"]'
    );

    // Convert to array to use index
    cachedMessages = Array.from(nodes).map((node, index) => {
        // ✅ Stable ID based on index
        const id = `chat-nav-idx-${index}`;

        node.dataset.chatNavId = id;

        return {
            id,
            text: node.innerText.trim().slice(0, 80)
        };
    });
}

// ---------------------------------------------------------
// TEST LOGIC
// ---------------------------------------------------------

console.log("--- Verification Start ---");

// 1. Load Chat A
console.log("Loading Chat A...");
document.setNodes(["Hello", "How are you?"]);
collectUserMessages();
const ids_run1 = cachedMessages.map(m => m.id);
console.log("Chat A IDs (Run 1):", ids_run1);

// 2. Switch to Chat B
console.log("\nSwitching to Chat B...");
document.setNodes(["Python help", "Code snippet"]);
collectUserMessages();
console.log("Chat B IDs:", cachedMessages.map(m => m.id));

// 3. Switch back to Chat A
console.log("\nSwitching back to Chat A...");
document.setNodes(["Hello", "How are you?"]);
collectUserMessages();
const ids_run2 = cachedMessages.map(m => m.id);
console.log("Chat A IDs (Run 2):", ids_run2);

// Verification
let pass = true;
if (ids_run1.length !== ids_run2.length) pass = false;
for (let i = 0; i < ids_run1.length; i++) {
    if (ids_run1[i] !== ids_run2[i]) pass = false;
}

if (pass) {
    console.log("\n✅ PASS: IDs are stable across reloads of the same chat.");
} else {
    console.error("\n❌ FAIL: IDs changed!");
    process.exit(1);
}
