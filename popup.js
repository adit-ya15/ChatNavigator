let allMessages = [];
let bookmarked = new Set();
let showOnlyBookmarks = false;
let chatKey = null;


const list = document.getElementById("list");
const searchInput = document.getElementById("search");
const bookmarkToggle = document.getElementById("bookmarkToggle");

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


/* ---------- Rendering ---------- */

function render(messages) {
    list.innerHTML = "";

    if (!messages.length) {
        const div = document.createElement("div");
        div.className = "empty";
        div.textContent = "No questions";
        list.appendChild(div);
        return;
    }

    messages.forEach((msg) => {
        const li = document.createElement("li");

        const star = document.createElement("span");
        star.textContent = "★";
        star.className = "star" + (bookmarked.has(msg.id) ? " active" : "");

        star.onclick = (e) => {
            e.stopPropagation();

            if (bookmarked.has(msg.id)) {
                bookmarked.delete(msg.id);
            } else {
                bookmarked.add(msg.id);
            }

            saveBookmarks();
            renderFiltered();
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

        list.appendChild(li);
    });
}

function renderFiltered() {
    const query = searchInput.value.toLowerCase();

    let filtered = allMessages.filter((m) =>
        m.text.toLowerCase().includes(query)
    );

    if (showOnlyBookmarks) {
        filtered = filtered.filter((m) => bookmarked.has(m.id));
    }

    render(filtered);
}

/* ---------- Init ---------- */

let tabId = null;

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    tabId = tab.id;
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

searchInput.addEventListener("input", renderFiltered);

bookmarkToggle.onclick = () => {
    showOnlyBookmarks = !showOnlyBookmarks;
    bookmarkToggle.classList.toggle("active", showOnlyBookmarks);
    renderFiltered();
};
