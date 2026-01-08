import { getAdapter } from "./adapterRegistry.js";

// Exporting main() to be called by loader.js
export function main() {
    console.log("🚀 Chat Navigator Engine Starting...");

    const adapter = getAdapter();

    if (!adapter) {
        console.log("ℹ️ No Chat Navigator adapter matches this page.");
        return;
    }

    console.log(`✅ Activated Adapter: ${adapter.name}`);

    /* =========================================================
       CORE LOGIC (Decoupled from DOM)
    ========================================================= */

    let cachedMessages = [];
    
    // 1. Message Collection
    function refreshMessages() {
        try {
            cachedMessages = adapter.getMessages();
        } catch (err) {
            console.error("Adapter error in getMessages:", err);
            cachedMessages = [];
        }
    }

    // 2. Observer
    let debounceTimer;
    adapter.observeChanges(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(refreshMessages, 200);
    });

    // Initial load
    refreshMessages();

    // 3. Setup Communication
    chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
        if (msg.type === "GET_MESSAGES") {
            // Re-fetch just in case (e.g. if mutation observer missed something)
            // But usually cached is fine. Let's do a quick fresh read to be safe.
            refreshMessages();
            sendResponse(cachedMessages);
            return true;
        }

        if (msg.type === "SCROLL_TO") {
            adapter.scrollToMessage(msg.id);
        }
    });
}
