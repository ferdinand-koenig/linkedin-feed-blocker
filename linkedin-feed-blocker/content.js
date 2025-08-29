// === Default Config ===
let BLOCK_MINUTES = 3; // default in case storage fails
let LIMIT_MS = BLOCK_MINUTES * 60 * 1000;
let timerId = null;

// === Load setting from storage ===
chrome.storage.sync.get({ blockMinutes: 3 }, data => {
  BLOCK_MINUTES = parseFloat(data.blockMinutes);
  LIMIT_MS = BLOCK_MINUTES * 60 * 1000;

  // If user set 0 → block immediately
  if (BLOCK_MINUTES === 0) {
    blockWhenReady();
  } else if (/linkedin\.com\/.*feed/.test(location.href)) {
    startOrRestartTimer();
  }
});

// === Helper to get localized message ===
function getBlockedMessage() {
  const lang = navigator.language || navigator.userLanguage || 'en';

  if (lang.startsWith('fr')) {
    return `⏳ Tes ${BLOCK_MINUTES === 0 ? "0" : BLOCK_MINUTES} minutes sont écoulées.<br/>Ferme le feed et retourne à tes tâches ! 🚀`;
  }
  if (lang.startsWith('de')) {
    return `⏳ Deine ${BLOCK_MINUTES === 0 ? "0" : BLOCK_MINUTES} Minuten sind vorbei.<br/>Schließe den Feed und widme dich wieder deinen Aufgaben! 🚀`;
  }
  if (lang.startsWith('es')) {
    return `⏳ Tus ${BLOCK_MINUTES === 0 ? "0" : BLOCK_MINUTES} minutos han terminado.<br/>Cierra el feed y vuelve a tus tareas! 🚀`;
  }
  return `⏳ Your ${BLOCK_MINUTES === 0 ? "0" : BLOCK_MINUTES} minutes are up.<br/>Close the feed and get back to work! 🚀`;
}

// === Replace feed with message ===
function replaceFeed() {
  const feedSelectors = [
    "main",
    ".scaffold-finite-scroll__content",
    "[data-test-feed-update-list]"
  ];

  for (const selector of feedSelectors) {
    const feed = document.querySelector(selector);
    if (feed) {
      feed.innerHTML = `
        <div style="
          position: relative;
          height: 100vh;  /* viewport height */
          width: 100%;
          text-align: center;
          color: #555;
          font-size: 24px;
        ">
          <div style="
            position: absolute;
            top: 10vh;      /* 10% from top of viewport */
            width: 100%;
          ">
            ${getBlockedMessage()}
          </div>
          <div style="
            position: absolute;
            bottom: -20vh;   /* 10% from bottom of viewport */
            width: 100%;
          ">
            ${getBlockedMessage()}
          </div>
        </div>
      `;
      return true;
    }
  }
  return false;
}

// Wait until feed exists then replace
function blockWhenReady() {
  if (replaceFeed()) return;

  const mo = new MutationObserver(() => {
    if (replaceFeed()) mo.disconnect();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  setTimeout(() => mo.disconnect(), 10_000);
}

// Timer logic
function startOrRestartTimer() {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    blockWhenReady();
  }, LIMIT_MS);
}

function stopTimer() {
  clearTimeout(timerId);
}

// === SPA navigation detection (no polling) ===
(function() {
  const _pushState = history.pushState;
  history.pushState = function() {
    _pushState.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
  };

  const _replaceState = history.replaceState;
  history.replaceState = function() {
    _replaceState.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
  };

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("locationchange"));
  });
})();

// React to URL changes
window.addEventListener("locationchange", () => {
  const isFeed = /linkedin\.com\/.*feed/.test(location.href);
  if (isFeed) {
    if (BLOCK_MINUTES === 0) {
      blockWhenReady();
    } else {
      startOrRestartTimer();
    }
  } else {
    stopTimer();
  }
});

// Start immediately if already on feed
if (/linkedin\.com\/.*feed/.test(location.href) && BLOCK_MINUTES !== 0) {
  startOrRestartTimer();
}
