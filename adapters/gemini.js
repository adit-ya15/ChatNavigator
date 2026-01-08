export const geminiAdapter = {
    name: "Gemini",

    matches() {
        return location.hostname.includes("gemini.google.com");
    },

    getMessages() {
        // Architecture Note: Gemini uses specific classes or attributes.
        // This selector is a best-guess based on current knowledge.
        // It might need to be updated.
        // Potential selectors: .user-query-container, .query-text, etc.
        
        // This specific attribute has been seen in some versions:
        const selectors = [
            '.user-query',
            'div[data-test-id="user-query"]',
            '.query-text' // Fallback
        ];

        let nodes = [];
        for (const sel of selectors) {
            const found = document.querySelectorAll(sel);
            if (found.length > 0) {
                nodes = [...found];
                break;
            }
        }

        return nodes.map((node, index) => {
            const id = `chat-nav-idx-${index}`;
            // IMPORTANT: Some sites might re-render nodes effectively wiping dataset.
            // But since we re-run getMessages periodically, we re-apply it.
            node.dataset.chatNavId = id;
            return {
                id: id,
                text: node.innerText.trim()
            };
        });
    },

    getThreadKey() {
        const url = new URL(window.location.href);
        // Gemini often uses /app/ID or /u/1/app/ID
        return url.pathname;
    },

    scrollToMessage(id) {
        const el = document.querySelector(`[data-chat-nav-id="${id}"]`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            // Highlight effect
            const originalBorder = el.style.border;
            el.style.border = "2px solid #6366f1";
            setTimeout(() => {
                el.style.border = originalBorder;
            }, 1000);
        }
    },

    observeChanges(cb) {
        const observer = new MutationObserver(cb);
        observer.observe(document.body, { childList: true, subtree: true });
    }
};
