let allMessages = [];

const list = document.getElementById("list");
const searchInput = document.getElementById("search");

function render(messages) {
    list.innerHTML = "";

    if (!messages.length) {
        const div = document.createElement("div");
        div.className = "empty";
        div.textContent = "No matching questions";
        list.appendChild(div);
        return;
    }

    messages.forEach((msg) => {
        const li = document.createElement("li");
        li.textContent = msg.text || "(empty)";

        li.onclick = () => {
            chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                chrome.tabs.sendMessage(tab.id, {
                    type: "SCROLL_TO",
                    id: msg.id
                });
                window.close(); // ✅ hide popup
            });
        };

        list.appendChild(li);
    });
}

// Fetch messages
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: "GET_MESSAGES" }, (messages) => {
        allMessages = messages || [];
        render(allMessages);
    });
});

// Live search
searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = allMessages.filter((m) =>
        m.text.toLowerCase().includes(value)
    );

    render(filtered);
});
