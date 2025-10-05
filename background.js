// Ensure compatibility with both Chrome and Brave browsers
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Anghami Ad Blocker installed/updated");
});

// Handle browser action click (toolbar icon)
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.startsWith("https://play.anghami.com/")) {
    // Manually trigger the ad blocking when icon is clicked
    executeAdBlocker(tab.id);
  }
});

// Listen for tab updates to inject our script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.startsWith("https://play.anghami.com/")
  ) {
    executeAdBlocker(tabId);
  }
});

// Function to execute the ad blocker
function executeAdBlocker(tabId) {
  // Execute the content script
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./scripts/contentScripts/adRemover.js"]
  }).catch(err => {
    console.error("Script injection failed:", err);
    // Try alternative method for Brave if needed
    tryAlternativeScriptInjection(tabId);
  });
  
  // Set up a periodic check for ads
  chrome.alarms.create(`adblock-check-${tabId}`, {
    delayInMinutes: 0.1,
    periodInMinutes: 0.5
  });
}

// Alternative script injection method (for Brave compatibility)
function tryAlternativeScriptInjection(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function() {
      // Create and inject script element
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('./scripts/contentScripts/adRemover.js');
      script.onload = function() {
        this.remove(); // Remove script element after loading
      };
      (document.head || document.documentElement).appendChild(script);
    }
  }).catch(err => console.error("Alternative script injection also failed:", err));
}

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
        }).catch(err => {
          console.error("Script execution failed:", err);
          // Try alternative method
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => {
              // Directly call the function from the page context
              if (window.optimizePage) {
                window.optimizePage();
              }
            }
          }).catch(e => console.error("Alternative execution also failed:", e));
        });
      } else {
        // Tab is no longer on Anghami, clear the alarm
        chrome.alarms.clear(alarm.name);
      }
    });
  }
});
