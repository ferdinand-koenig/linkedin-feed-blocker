let BLOCK_MINUTES = 3;
let LIMIT_MS = BLOCK_MINUTES * 60 * 1000;
let timerId = null;
let feedObserver = null;
let lastHref = location.href;

chrome.storage.sync.get({ blockMinutes: 3 }, data => {
  BLOCK_MINUTES = parseFloat(data.blockMinutes);
  LIMIT_MS = BLOCK_MINUTES * 60 * 1000;
  handleFeedTab();
});

function isOnFeed() {
  return /^https:\/\/www\.linkedin\.com\/feed\/?$/.test(location.href);
}

function getBlockedMessage() {
  const lang = navigator.language || navigator.userLanguage || 'en';
  if (lang.startsWith('fr')) return `⏳ Tes ${BLOCK_MINUTES} minutes sont écoulées.<br/>Ferme le feed et retourne à tes tâches ! 🚀`;
  if (lang.startsWith('de')) return `⏳ Deine ${BLOCK_MINUTES} Minuten sind vorbei.<br/>Schließe den Feed und widme dich wieder deinen Aufgaben! 🚀`;
  if (lang.startsWith('es')) return `⏳ Tus ${BLOCK_MINUTES} minutos han terminado.<br/>Cierra el feed y vuelve a tus tareas! 🚀`;
  return `⏳ Your ${BLOCK_MINUTES} minutes are up.<br/>Close the feed and get back to work! 🚀`;
}

function replaceFeed() {
  const feed = document.querySelector("main, .scaffold-finite-scroll__content, [data-test-feed-update-list]");
  if (!feed) return false;

  feed.innerHTML = `
    <div style="
      position: relative;
      height: 100vh;
      width: 100%;
      text-align: center;
      color: #555;
      font-size: 24px;
    ">
      <div style="position: absolute; top: 10vh; width: 100%;">${getBlockedMessage()}</div>
      <div style="position: absolute; bottom: -20vh; width: 100%;">${getBlockedMessage()}</div>
    </div>
  `;
  return true;
}

function blockWhenReady() {
  if (replaceFeed()) return;

  if (!feedObserver) {
    feedObserver = new MutationObserver(() => replaceFeed());
    feedObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
}

function startOrRestartTimer() {
  clearTimeout(timerId);
  if (BLOCK_MINUTES === 0) {
    blockWhenReady();
    return;
  }
  timerId = setTimeout(blockWhenReady, LIMIT_MS);
}

function stopTimer() {
  clearTimeout(timerId);
}

function handleFeedTab() {
  if (BLOCK_MINUTES === 0) blockWhenReady();
  else startOrRestartTimer();
}

// SPA detection
(function() {
  const _pushState = history.pushState;
  history.pushState = function() { _pushState.apply(this, arguments); window.dispatchEvent(new Event("locationchange")); };
  const _replaceState = history.replaceState;
  history.replaceState = function() { _replaceState.apply(this, arguments); window.dispatchEvent(new Event("locationchange")); };
  window.addEventListener("popstate", () => window.dispatchEvent(new Event("locationchange")));
})();

window.addEventListener("locationchange", () => {
  if (isOnFeed()) handleFeedTab();
  else stopTimer();
});

// Poll for tab changes (internal LinkedIn tabs)
setInterval(() => {
  if (location.href !== lastHref) {
    lastHref = location.href;
    if (isOnFeed()) handleFeedTab();
    else stopTimer();
  }
}, 500);

// Start immediately if already on feed
if (isOnFeed()) handleFeedTab();
