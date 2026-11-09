// Rail reading-band probe (v2.1). For every section heading the rail lists:
//   click:  set location.hash to the heading (what a rail click does) → that section is marked. When the next
//           heading lands inside the band too (a short section) the line carries guard=1: only the hash guard
//           can make this case pass, so the count of guard=1 lines is the number of times the guard was proven.
//   in:     heading placed 20 % down the window → marked;   in24:  heading at 24 % → marked;
//   out26:  heading at 26 % → the previous section stays marked (nothing for the first heading);
//   out:    heading at 35 % → the previous section;         both out cases skipped when the window cannot reach the position.
//   stale:  click the heading, then scroll to the page end → the last section is marked unless the clicked
//           heading is still on screen (top within [-4, viewport height)), in which case it stays marked.
// Writes LGPROBE lines into <pre id="lgprobe"> for --dump-dom.
(function () {
  setTimeout(function () {
    var out = [];
    var links = Array.from(document.querySelectorAll('.rail-toc a'));
    if (!links.length) { out.push('LGPROBE no-rail innerWidth=' + innerWidth); finish(); return; }
    var ids = links.map(function (a) { return a.getAttribute('href').slice(1); });
    var vh = document.documentElement.clientHeight;
    var band = vh * 0.25;
    var maxY = document.documentElement.scrollHeight - vh;
    var cases = [];
    ids.forEach(function (id, k) {
      ['click', 'in', 'in24', 'out26', 'out', 'stale'].forEach(function (name) { cases.push({ id: id, k: k, name: name }); });
    });
    var c = 0;
    function marked() { var cur = document.querySelector('.rail-toc a[aria-current]'); return cur ? ids[links.indexOf(cur)] : 'none'; }
    function record(cs, expected, extra) {
      var got = marked();
      out.push('LGPROBE ' + (got === expected ? 'ok ' : 'MISMATCH ') + 'case=' + cs.name + ' section=' + cs.id + ' marked=' + got + ' expected=' + expected + ' y=' + Math.round(window.scrollY) + (extra || ''));
    }
    function clearHash() { history.replaceState(null, '', location.pathname); }
    function step() {
      if (c >= cases.length) { finish(); return; }
      var cs = cases[c++];
      var h = document.getElementById(cs.id);
      if (!h) { out.push('LGPROBE MISMATCH case=' + cs.name + ' section=' + cs.id + ' marked=? expected=? missing-heading'); step(); return; }
      var extra = '';
      if (cs.name === 'click' || cs.name === 'stale') {
        clearHash();
        location.hash = '#' + cs.id;
        if (cs.name === 'click') {
          var nh = cs.k + 1 < ids.length ? document.getElementById(ids[cs.k + 1]) : null;
          if (nh && nh.getBoundingClientRect().top <= band) extra = ' guard=1';
        }
      } else {
        clearHash();
        var y = h.getBoundingClientRect().top + window.scrollY;
        var frac = { in: 0.20, in24: 0.24, out26: 0.26, out: 0.35 }[cs.name];
        var target = Math.round(y - vh * frac);
        if ((cs.name === 'out' || cs.name === 'out26') && (target < 0 || target >= maxY - 2)) { out.push('LGPROBE skip case=' + cs.name + ' section=' + cs.id + ' (window cannot place the heading there)'); step(); return; }
        window.scrollTo(0, Math.max(0, target));
      }
      window.dispatchEvent(new Event('scroll'));
      setTimeout(function () {
        if (cs.name === 'stale') {   // second half of the stale case: leave the clicked heading behind
          window.scrollTo(0, maxY);
          window.dispatchEvent(new Event('scroll'));
          setTimeout(function () {
            var top = h.getBoundingClientRect().top;
            var expected = (top >= -4 && top < vh) ? cs.id : ids[ids.length - 1];
            record(cs, expected, top >= -4 && top < vh ? ' clicked-still-on-screen' : ' clicked-left-above');
            step();
          }, 80);
          return;
        }
        var expected;
        if (cs.name === 'click' || cs.name === 'in' || cs.name === 'in24') expected = cs.id;
        else expected = cs.k > 0 ? ids[cs.k - 1] : 'none';
        var atBottom = window.scrollY > 0 && vh + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom && cs.name !== 'click') expected = ids[ids.length - 1];
        record(cs, expected, extra + (atBottom ? ' at-bottom' : ''));
        step();
      }, 80);
    }
    function finish() {
      var p = document.createElement('pre'); p.id = 'lgprobe'; p.textContent = out.join('\n'); document.body.appendChild(p);
    }
    step();
  }, 900);
})();
