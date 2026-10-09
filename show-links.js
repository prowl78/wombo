// Sends the poster's show links to the hand-built pages at /knock-knock/ and
// /wombo/ instead of the canvas export's built-in show pages. Kept outside the
// export: after exporting, re-add this line to the <head> of index.html:
//   <script src="/show-links.js"></script>
(() => {
  const SHOWS = { 'knock-knock': '/knock-knock/', wombo: '/wombo/' };
  const target = (url) => SHOWS[String(url ?? '').split('#')[1]];

  // `replace` swaps out a #show history entry; otherwise add a new entry, so
  // Back from the show page returns to the poster.
  const go = (path, replace) => {
    // Hide the export's show page while the browser loads the real one.
    document.documentElement.style.visibility = 'hidden';
    replace ? location.replace(path) : location.assign(path);
  };

  // Old links like knockknockwombo.com/#wombo, and URLs typed by hand.
  if (target(location.hash)) return go(target(location.hash), true);
  addEventListener('hashchange', () => target(location.hash) && go(target(location.hash), true));

  // The poster opens a show with history.pushState('#wombo'); skip that push
  // and load the real page instead.
  const push = history.pushState;
  history.pushState = function (state, title, url) {
    const path = target(url);
    if (path) return go(path);
    return push.apply(this, arguments);
  };

  // Coming Back from a show page, the browser may restore this page from its
  // cache mid-redirect: show it again, and reload if it is not on the poster.
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    document.documentElement.style.visibility = '';
    if (!document.querySelector('img[alt*="double feature poster" i]')) location.reload();
  });
})();
