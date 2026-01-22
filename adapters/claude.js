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
        let el = document.querySelector(`[data-chat-nav-id="${id}"]`);

        if (!el) {
            const indexMatch = id.match(/chat-nav-idx-(\d+)/);
            if (indexMatch) {
                const index = parseInt(indexMatch[1], 10);
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

                if (nodes[index]) {
                    el = nodes[index];
                    el.dataset.chatNavId = id;
                }
            }
        }

        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });

            const originalIsTransition = el.style.transition;
            const originalBoxShadow = el.style.boxShadow;

            el.style.transition = "box-shadow 0.3s ease-in-out";
            el.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.5)"; // Indigo ring

            setTimeout(() => {
                el.style.boxShadow = originalBoxShadow;
                setTimeout(() => {
                    el.style.transition = originalIsTransition;
                }, 300);
            }, 2000);
        }
    },

    observeChanges(cb) {
        const observer = new MutationObserver(cb);
        observer.observe(document.body, { childList: true, subtree: true });
    }
};
