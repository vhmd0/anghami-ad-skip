chrome.runtime.onInstalled.addListener((details) => {
  console.log("Anghami Ad Blocker installed/updated");
});

// Listen for tab updates to inject our script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.startsWith("https://play.anghami.com/")
  ) {
    // Execute the content script
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["./scripts/contentScripts/adRemover.js"]
    }).catch(err => console.error("Script injection failed:", err));
    
    // Set up a periodic check for ads
    chrome.alarms.create(`adblock-check-${tabId}`, {
      delayInMinutes: 0.1,
      periodInMinutes: 0.5
    });
  }
});

// Listen for alarm to periodically check for ads
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('adblock-check-')) {
    const tabId = parseInt(alarm.name.split('-')[2]);
    
    // Check if tab still exists
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        // Tab doesn't exist anymore, clear the alarm
        chrome.alarms.clear(alarm.name);
        return;
      }
      
      // Tab exists, check if it's still on Anghami
      if (tab.url && tab.url.startsWith("https://play.anghami.com/")) {
        // Re-execute the content script
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: () => {
            // This will be executed in the page context
            if (typeof optimizePage === 'function') {
              optimizePage();
            }
          }
        }).catch(err => console.error("Script execution failed:", err));
      } else {
        // Tab is no longer on Anghami, clear the alarm
        chrome.alarms.clear(alarm.name);
      }
    });
  }
});
