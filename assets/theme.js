/* Learning Garden — apply the saved theme before first paint (load in <head>). */
(function () {
  try {
    var saved = localStorage.getItem('lg-theme');
    if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;
  } catch (_) {}
})();
