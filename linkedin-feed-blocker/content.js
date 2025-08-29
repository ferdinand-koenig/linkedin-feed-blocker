// === Config ===
const BLOCK_MINUTES = 0.25;                // duration before blocking
const LIMIT_MS = BLOCK_MINUTES * 60 * 1000;

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
          font-size:24px;
          text-align:center;
          margin-top:50px;
          color:#555;
        ">
          ⏳ Tes ${BLOCK_MINUTES} minutes sont écoulées.<br/>
          Ferme le feed et retourne à tes tâches ! 🚀
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
let timerId = null;

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
    startOrRestartTimer();
  } else {
    stopTimer();
  }
});

// Start immediately if already on feed
if (/linkedin\.com\/.*feed/.test(location.href)) {
  startOrRestartTimer();
}
