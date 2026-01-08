let allMessages = [];
let bookmarked = new Set();
let showOnlyBookmarks = false;

const list = document.getElementById("list");
const searchInput = document.getElementById("search");
const bookmarkToggle = document.getElementById("bookmarkToggle");

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
            e.stopPropagation(); // 👈 don't trigger scroll
            if (bookmarked.has(msg.id)) {
                bookmarked.delete(msg.id);
            } else {
                bookmarked.add(msg.id);
            }
            renderFiltered();
        };

        const text = document.createElement("div");
        text.className = "text";
        text.textContent = msg.text || "(empty)";

        li.appendChild(star);
        li.appendChild(text);

        li.onclick = () => {
            chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                chrome.tabs.sendMessage(tab.id, {
                    type: "SCROLL_TO",
                    id: msg.id
                });
                window.close(); // ✅ auto-hide popup
            });
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

// Fetch messages
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: "GET_MESSAGES" }, (messages) => {
        allMessages = messages || [];
        renderFiltered();
    });
});

// Search
searchInput.addEventListener("input", renderFiltered);

// Bookmark filter toggle
bookmarkToggle.onclick = () => {
    showOnlyBookmarks = !showOnlyBookmarks;
    bookmarkToggle.classList.toggle("active", showOnlyBookmarks);
    renderFiltered();
};
