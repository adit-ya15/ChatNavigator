let allMessages = [];
let bookmarked = new Set();
let showOnlyBookmarks = false;
let chatKey = null;


const list = document.getElementById("list");
const searchInput = document.getElementById("search");
const bookmarkToggle = document.getElementById("bookmarkToggle");
const themeToggle = document.getElementById("themeToggle");

/* ---------- Theme Logic ---------- */
function initTheme() {
    chrome.storage.local.get("theme", (data) => {
        if (data.theme === "dark") {
            document.body.classList.add("dark");
        } else if (data.theme === "light") {
            document.body.classList.remove("dark");
        } else {
            // Auto detect
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add("dark");
            }
        }
    });
}

initTheme();

themeToggle.onclick = () => {
    const isDark = document.body.classList.toggle("dark");
    chrome.storage.local.set({ theme: isDark ? "dark" : "light" });
};

/* ---------- Helpers ---------- */

const BATCH_SIZE = 50;
let currentFilteredMessages = [];
let visibleLimit = BATCH_SIZE;

/* ---------- Helpers ---------- */

function getChatKey(tab) {
    const url = new URL(tab.url);
    return url.pathname; // per-chat key
}

function saveBookmarks() {
    chrome.storage.local.set({
        [chatKey]: Array.from(bookmarked)
    });
}


function loadBookmarks(chatKey, callback) {
    chrome.storage.local.get(chatKey, (data) => {
        bookmarked = new Set(data[chatKey] || []);
        callback();
    });
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}


/* ---------- Rendering ---------- */

function render(messages, append = false) {
    if (!append) {
        list.innerHTML = "";
    }

    if (!messages.length && !append) {
        const div = document.createElement("div");
        div.className = "empty";
        // Customize empty message
        if (showOnlyBookmarks) {
            div.textContent = "No bookmarks yet";
        } else if (searchInput.value.trim()) {
            div.textContent = "No questions found";
        } else {
            div.textContent = "No questions found";
        }
        list.appendChild(div);
        return;
    }

    const fragment = document.createDocumentFragment();

    messages.forEach((msg) => {
        const li = document.createElement("li");

        const star = document.createElement("span");
        star.textContent = "★";
        star.className = "star" + (bookmarked.has(msg.id) ? " active" : "");
        star.setAttribute("aria-label", "Bookmark this question");

        star.onclick = (e) => {
            e.stopPropagation();

            if (bookmarked.has(msg.id)) {
                bookmarked.delete(msg.id);
            } else {
                bookmarked.add(msg.id);
            }

            saveBookmarks();
            // Don't re-render entire list to avoid losing scroll position, just toggle class
            star.className = "star" + (bookmarked.has(msg.id) ? " active" : "");
            // But if we are in bookmarked only mode, we might need to remove it
            if(showOnlyBookmarks) {
                 renderFiltered();
            }
        };

        const text = document.createElement("div");
        text.className = "text";
        text.textContent = msg.text || "(empty)";

        li.appendChild(star);
        li.appendChild(text);

        li.onclick = () => {
            chrome.tabs.sendMessage(tabId, {
                type: "SCROLL_TO",
                id: msg.id
            });
            window.close();
        };

        fragment.appendChild(li);
    });
    
    list.appendChild(fragment);
}

function renderFiltered() {
    const query = searchInput.value.toLowerCase();

    currentFilteredMessages = allMessages.filter((m) =>
        m.text.toLowerCase().includes(query)
    );

    if (showOnlyBookmarks) {
        currentFilteredMessages = currentFilteredMessages.filter((m) => bookmarked.has(m.id));
    }
    
    visibleLimit = BATCH_SIZE;
    render(currentFilteredMessages.slice(0, visibleLimit));
}

function loadMore() {
    if (visibleLimit >= currentFilteredMessages.length) return;
    
    const nextBatch = currentFilteredMessages.slice(visibleLimit, visibleLimit + BATCH_SIZE);
    visibleLimit += BATCH_SIZE;
    render(nextBatch, true);
}

// Infinite scroll listener
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        loadMore();
    }
});

/* ---------- Init ---------- */

let tabId = null;
const headerTitle = document.getElementById("headerTitle");

function updateHeader(url) {
    let platform = "Chat Navigator";
    if (url.includes("chatgpt.com")) platform = "ChatGPT";
    else if (url.includes("claude.ai")) platform = "Claude";
    else if (url.includes("gemini.google.com")) platform = "Gemini";
    else if (url.includes("meta.ai")) platform = "Meta AI";
    else if (url.includes("x.com") || url.includes("grok")) platform = "Grok";

    headerTitle.textContent = platform;
}

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) return;
    tabId = tab.id;
    updateHeader(tab.url);
    chatKey = getChatKey(tab);

    // ALWAYS load bookmarks for current chat
    loadBookmarks(chatKey, () => {
        chrome.tabs.sendMessage(tab.id, { type: "GET_MESSAGES" }, (messages) => {
            allMessages = messages || [];
            renderFiltered();
        });
    });
});

/* ---------- Events ---------- */

searchInput.addEventListener("input", debounce(renderFiltered, 300));

bookmarkToggle.onclick = () => {
    showOnlyBookmarks = !showOnlyBookmarks;
    bookmarkToggle.classList.toggle("active", showOnlyBookmarks);
    renderFiltered();
};
