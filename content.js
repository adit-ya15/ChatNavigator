console.log("✅ Chat Navigator content.js loaded");

let cachedMessages = [];
let idCounter = 0;
const nodeToId = new WeakMap(); // 🔒 stable mapping

function collectUserMessages() {
    const nodes = document.querySelectorAll(
        '[data-message-author-role="user"]'
    );

    cachedMessages = Array.from(nodes).map((node) => {
        // ✅ assign ONCE per node
        if (!nodeToId.has(node)) {
            nodeToId.set(node, `chat-nav-${++idCounter}`);
        }

        const id = nodeToId.get(node);

        node.dataset.chatNavId = id;

        return {
            id,
            text: node.innerText.trim().slice(0, 80)
        };
    });
}

// 🛡️ Debounced observer (SPA-safe)
let debounceTimer;
const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(collectUserMessages, 100);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial run
collectUserMessages();

// ✅ Proper message handling
chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    if (msg.type === "GET_MESSAGES") {
        sendResponse(cachedMessages);
        return true;
    }

    if (msg.type === "SCROLL_TO") {
        const el = document.querySelector(
            `[data-chat-nav-id="${msg.id}"]`
        );

        if (!el) return;

        el.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        el.style.outline = "3px solid #6366f1";
        el.style.borderRadius = "8px";

        setTimeout(() => {
            el.style.outline = "";
        }, 1500);
    }
});
