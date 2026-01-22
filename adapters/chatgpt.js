export const chatgptAdapter = {
    name: "ChatGPT",

    matches() {
        return location.hostname.includes("chatgpt.com");
    },

    getMessages() {
        // Use stable index-based IDs
        return [...document.querySelectorAll('[data-message-author-role="user"]')].map((node, index) => {
            const id = `chat-nav-idx-${index}`;
            node.dataset.chatNavId = id;
            return {
                id: id,
                text: node.innerText.trim()
            };
        });
    },

    getThreadKey() {
        return location.pathname;
    },

    scrollToMessage(id) {
        let el = document.querySelector(`[data-chat-nav-id="${id}"]`);

        if (!el) {
            const indexMatch = id.match(/chat-nav-idx-(\d+)/);
            if (indexMatch) {
                const index = parseInt(indexMatch[1], 10);
                const nodes = [...document.querySelectorAll('[data-message-author-role="user"]')];
                if (nodes[index]) {
                    el = nodes[index];
                    el.dataset.chatNavId = id;
                }
            }
        }

        el?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        if (el) {
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
        // Debounce implementation inside the adapter or rely on core?
        // The core likely handles debouncing if observing directly, 
        // but here we provide the raw observer. 
        // Let's implement a simple observer that calls cb on likely relevant changes.
        const observer = new MutationObserver((mutations) => {
            cb();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
};
