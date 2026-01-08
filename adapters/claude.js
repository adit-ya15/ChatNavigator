export const claudeAdapter = {
    name: "Claude",

    matches() {
        return location.hostname.includes("claude.ai");
    },

    getMessages() {
        const selectors = [
             '[aria-label="User message"]',
             '[data-testid="user-message"]'
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
            node.dataset.chatNavId = id;
            return {
                id: id,
                text: node.innerText.trim()
            };
        });
    },

    getThreadKey() {
        // /chat/UUID
        return location.pathname;
    },

    scrollToMessage(id) {
        const el = document.querySelector(`[data-chat-nav-id="${id}"]`);
        if (el) {
             el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    },

    observeChanges(cb) {
        const observer = new MutationObserver(cb);
        observer.observe(document.body, { childList: true, subtree: true });
    }
};
