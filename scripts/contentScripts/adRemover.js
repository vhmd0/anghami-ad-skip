const targetToObserve = document.body;
const config = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'style']
};

// Run optimization immediately and then on mutations
const callback = (mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList" || mutation.type === "attributes") {
      optimizePage();
    }
  }
};

const observer = new MutationObserver(callback);

// Initialize as soon as possible
document.addEventListener("DOMContentLoaded", () => {
  optimizePage();
});

// Also initialize when page is fully loaded
document.addEventListener("readystatechange", (event) => {
  if (event.target.readyState === "complete") {
    optimizePage();
    observer.observe(targetToObserve, config);
    
    // Set interval to periodically check for ads (some ads load dynamically)
    setInterval(optimizePage, 2000);
  }
});

function optimizePage() {
  googleIframesRemover();
  removeAdContainers();
  removeAllAdElements();
  skipAds();
  pressPlay();
  muteVideoAds();
  removeLeaderboard();
  removePopups();
  removeOverlays();
}

function googleIframesRemover() {
  const googleIframes = Array.from(
    document.querySelectorAll("iframe[name*='google'], iframe[src*='googlead'], iframe[src*='doubleclick'], iframe[id*='ad']")
  );
  removeItems(googleIframes);
}

function muteVideoAds() {
  document.querySelectorAll("#native-ad-video, video[src*='ad'], video[class*='ad'], video[id*='ad']").forEach((videoAd) => {
    videoAd.muted = true;
    videoAd.volume = 0;
    
    // Skip the video ad if possible
    if (videoAd.duration) {
      videoAd.currentTime = videoAd.duration;
    }
    
    videoAd.addEventListener("play", (e) => {
      e.target.muted = true;
      e.target.volume = 0;
      hideAdModals();
      skipAds();
      pressPlay();
    });
  });
}

function hideAdModals() {
  const adModals = document.querySelectorAll(
    "ngb-modal-window, ngb-modal-backdrop, div[class*='modal'], div[class*='popup'], div[class*='ad-container']"
  );
  document.body.classList.remove("modal-open");
  hideItems(adModals);
}

function removeLeaderboard() {
  const leaderboards = document.querySelectorAll(".player-leaderboard, div[class*='leaderboard'], div[class*='banner']");
  removeItems(leaderboards);
}

function pressPlay() {
  const playButton = document.querySelector(".play-pause-cont .play, button[class*='play'], div[class*='play-button']");
  if (playButton) {
    try {
      playButton.click();
    } catch (e) {
      // Try dispatching a custom event if direct click fails
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      playButton.dispatchEvent(clickEvent);
    }
  }
}

function skipAds() {
  // Try to find and click any skip ad buttons
  const skipButtons = document.querySelectorAll(
    "button[class*='skip'], div[class*='skip'], span[class*='skip'], a[class*='skip']"
  );
  
  skipButtons.forEach(button => {
    try {
      button.click();
    } catch (e) {
      // Try alternative method
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      button.dispatchEvent(clickEvent);
    }
  });
}

function removeAdContainers() {
  removeItems(document.querySelectorAll("anghami-ads, div[class*='ad-'], div[id*='ad-'], div[class*='ads'], div[id*='ads']"));
}

function removeAllAdElements() {
  // Target common ad selectors
  const adSelectors = [
    "[class*='ad-container']",
    "[class*='ad-wrapper']",
    "[class*='ad-slot']",
    "[class*='ad-banner']",
    "[class*='advert']",
    "[id*='ad-container']",
    "[id*='ad-wrapper']",
    "[id*='ad-slot']",
    "[id*='ad-banner']",
    "[id*='advert']",
    "[data-ad]",
    "[data-ads]",
    "[data-adunit]",
    "[aria-label*='advertisement']"
  ];
  
  removeItems(document.querySelectorAll(adSelectors.join(", ")));
}

function removePopups() {
  const popupSelectors = [
    "[class*='popup']",
    "[id*='popup']",
    "[class*='modal']",
    "[id*='modal']",
    "[class*='overlay']",
    "[id*='overlay']"
  ];
  
  removeItems(document.querySelectorAll(popupSelectors.join(", ")));
}

function removeOverlays() {
  const overlaySelectors = [
    "[class*='overlay']",
    "[id*='overlay']",
    "[style*='z-index: 9999']",
    "[style*='position: fixed']"
  ];
  
  const potentialOverlays = document.querySelectorAll(overlaySelectors.join(", "));
  
  potentialOverlays.forEach(element => {
    // Check if this might be an ad overlay
    const style = window.getComputedStyle(element);
    if (
      (style.position === 'fixed' || style.position === 'absolute') && 
      (parseInt(style.zIndex) > 100) &&
      element.offsetWidth > window.innerWidth * 0.5 &&
      element.offsetHeight > window.innerHeight * 0.3
    ) {
      element.remove();
    }
  });
}

function removeItems(items) {
  items.forEach((item) => item.remove());
}

function hideItems(items) {
  items.forEach((item) => {
    item.style.visibility = "hidden";
    item.style.display = "none";
  });
}

// Make optimizePage function available globally for Brave compatibility
window.optimizePage = optimizePage;
