// === Config ===
const LIMIT_MS = 0.25 * 60 * 1000; // 3 minutes
const POLL_MS = 1000;

// === Utils ===
const log = (...a) => console.log("[FeedBlocker]", ...a);

function replaceFeed() {
  log("Essai de remplacement du feed…");

  const feedSelectors = [
    "main",
    ".scaffold-finite-scroll__content",
    "[data-test-feed-update-list]"
  ];

  for (const selector of feedSelectors) {
    const feed = document.querySelector(selector);
    if (feed) {
      log(`Feed trouvé avec le sélecteur '${selector}', remplacement…`);
      feed.innerHTML = `
        <div style="
          font-size:24px;
          text-align:center;
          margin-top:50px;
          color:#555;
        ">
          ⏳ Tes 3 minutes sont écoulées. Ferme le feed et retourne à tes tâches ! 🚀
        </div>
      `;
      return true;
    }
  }
  return false;
}

// Attend que le feed existe puis remplace
function blockWhenReady() {
  if (replaceFeed()) return;

  // Si pas encore là, observe le DOM jusqu'à ce que le feed apparaisse
  const mo = new MutationObserver(() => {
    if (replaceFeed()) mo.disconnect();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // Sécurité: arrêter l'observer après 10s pour éviter les fuites
  setTimeout(() => mo.disconnect(), 10_000);
}

// Démarre un compte à rebours, le réinitialise si on quitte le feed
let timerId = null;
let lastHref = location.href;

function startOrRestartTimer() {
  clearTimeout(timerId);
  log("Démarrage du minuteur de 3 minutes…");
  timerId = setTimeout(() => {
    log("Minuteur terminé, blocage du feed.");
    blockWhenReady();
  }, LIMIT_MS);
}

// Sur SPA, détecter les changements d’URL
setInterval(() => {
  if (location.href !== lastHref) {
    const wasFeed = /linkedin\.com\/.*feed/.test(lastHref);
    const isFeed = /linkedin\.com\/.*feed/.test(location.href);
    lastHref = location.href;

    if (isFeed) {
      log("Arrivée sur le feed -> (re)lancer le minuteur.");
      startOrRestartTimer();
    } else if (wasFeed) {
      log("Sortie du feed -> arrêter le minuteur.");
      clearTimeout(timerId);
    }
  }
}, POLL_MS);

// Lancer au chargement si on est déjà sur le feed
if (/linkedin\.com\/.*feed/.test(location.href)) {
  startOrRestartTimer();
}

// Bonus: si l’onglet est masqué trop longtemps, on bloque à la reprise
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" &&
      /linkedin\.com\/.*feed/.test(location.href)) {
  }
});
