(async () => {
    // 🚀 Dynamic Import Strategy
    // Chrome Content Scripts don't support ES modules natively in the "js" array of manifest.json
    // But they DO support dynamic imports if the files are in "web_accessible_resources".
    
    // 1. Get the URL for the main module
    const src = chrome.runtime.getURL('content.js');
    
    // 2. Import it
    try {
        const contentMain = await import(src);
        
        // 3. Start the engine
        contentMain.main();
        
        console.log("✅ Chat Navigator Adapter Engine Loaded via " + src);
    } catch (e) {
        console.error("❌ Chat Navigator Loader Failed:", e);
    }
})();
