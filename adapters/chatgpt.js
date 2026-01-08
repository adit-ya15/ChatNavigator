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
        document
            .querySelector(`[data-chat-nav-id="${id}"]`)
            ?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
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
