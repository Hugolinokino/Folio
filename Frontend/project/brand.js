/* Folio — brand book interactions */
(function () {
  'use strict';

  /* ---------- custom icon family ----------
     shared language: 24px grid · 1.8 stroke · round joins
     recurring motifs: bi-fold (Eselsohr) · bi-accent margin */
  const S = 'fill="none" stroke-width="1.8"';
  const ICONS = [
    { l: 'Dokument', s: `
      <path class="bi-stroke" d="M6 3h7l5 5v13H6z"/>
      <path class="bi-accent bi-fold" d="M13 3v5h5"/>
      <path class="bi-stroke" d="M9 13h6M9 16.5h6"/>` },
    { l: 'Bibliothek', s: `
      <path class="bi-stroke" d="M4 5.5C7 4 9.5 4 12 5.5C14.5 4 17 4 20 5.5V19C17 17.5 14.5 17.5 12 19C9.5 17.5 7 17.5 4 19Z"/>
      <path class="bi-accent bi-draw" d="M12 5.5V19"/>` },
    { l: 'Recherche', s: `
      <circle class="bi-stroke" cx="10" cy="10" r="6"/>
      <path class="bi-accent" d="M8 8.5h4M8 11h2.5"/>
      <path class="bi-stroke bi-nudge" d="M14.5 14.5 20.5 20.5"/>` },
    { l: 'Notiz', s: `
      <path class="bi-stroke" d="M3.5 17.5h6"/>
      <path class="bi-stroke" d="M16 7l3 3"/>
      <path class="bi-accent bi-nudge" d="M12.5 14.5 17 10l3 3-4.5 4.5-3.6 1z"/>` },
    { l: 'Schreiben', s: `
      <path class="bi-stroke" d="M12 3 6 14l6 7 6-7z"/>
      <path class="bi-accent" d="M12 12v6"/>
      <circle class="bi-stroke" cx="12" cy="10.3" r="1.3"/>` },
    { l: 'Recht', s: `
      <path class="bi-stroke" d="M12 4v15M8 21h8"/>
      <circle class="bi-stroke" cx="12" cy="4.2" r="1.2"/>
      <path class="bi-stroke" d="M5 8h14"/>
      <path class="bi-accent bi-draw" d="M5 8 3 13h4zM19 8 17 13h4z"/>` },
    { l: 'Zitat', s: `
      <path class="bi-stroke" d="M5 7h4.5v4.5c0 2.6-1.6 3.8-4.5 4.6"/>
      <path class="bi-accent bi-draw" d="M14.5 7H19v4.5c0 2.6-1.6 3.8-4.5 4.6"/>` },
    { l: 'Tag', s: `
      <path class="bi-stroke" d="M4 4h8l8 8-8 8-8-8z"/>
      <circle class="bi-accent" cx="8.5" cy="8.5" r="1.7"/>` },
    { l: 'Verknüpfung', s: `
      <path class="bi-stroke bi-draw" d="M9.5 14.5 14.5 9.5"/>
      <path class="bi-accent" d="M14 5.5 15 4.5a3.7 3.7 0 0 1 5.3 5.3l-2.8 2.8a3.7 3.7 0 0 1-5.3 0"/>
      <path class="bi-accent" d="M10 18.5 9 19.5a3.7 3.7 0 0 1-5.3-5.3l2.8-2.8a3.7 3.7 0 0 1 5.3 0"/>` },
    { l: 'Fussnote', s: `
      <path class="bi-stroke" d="M4 9h9M4 14h11M4 19h11"/>
      <path class="bi-accent bi-spin" d="M18.5 3.5v6M15.9 4.8l5.2 3.4M21.1 4.8l-5.2 3.4"/>` },
    { l: 'Export', s: `
      <path class="bi-stroke" d="M5 4h7l4 4v12H5z"/>
      <path class="bi-accent bi-fold" d="M12 4v4h4"/>
      <path class="bi-accent bi-nudge" d="M10.5 18v-6M8 14.5l2.5-2.5L13 14.5"/>` },
    { l: 'Frist', s: `
      <path class="bi-stroke" d="M4 6h16v10l-4 4H4z"/>
      <path class="bi-stroke" d="M4 10h16M8 4v4M16 4v4"/>
      <path class="bi-accent bi-fold" d="M20 16h-4v4"/>` },
  ];

  const grid = document.getElementById('iconGrid');
  if (grid) {
    ICONS.forEach(function (ic) {
      const cell = document.createElement('div');
      cell.className = 'bicon';
      cell.innerHTML =
        '<svg width="30" height="30" viewBox="0 0 24 24" ' + S + ' stroke-linecap="round" stroke-linejoin="round">' + ic.s + '</svg>' +
        '<span class="lbl">' + ic.l + '</span>';
      grid.appendChild(cell);
    });
  }

  /* ---------- hero replay ---------- */
  const heroSvg = document.getElementById('heroSvg');
  const replay = document.getElementById('replay');
  const heroStage = document.getElementById('heroMark');
  function play(svg) {
    if (!svg) return;
    svg.classList.remove('anim');
    void svg.offsetWidth;        // force reflow
    svg.classList.add('anim');
  }
  if (replay) replay.addEventListener('click', function () { play(heroSvg); });
  if (heroStage) heroStage.addEventListener('click', function () { play(heroSvg); });

  /* ---------- motion demos ---------- */
  document.querySelectorAll('.motion-card').forEach(function (card) {
    const kind = card.getAttribute('data-motion');
    const svg = card.querySelector('.m-demo');
    function run() {
      if (!svg) return;
      svg.querySelectorAll('[style]').forEach(function (el) {
        el.style.animation = 'none';
      });
      void svg.offsetWidth;
      if (kind === 'write') {
        svg.querySelectorAll('.dline').forEach(function (l, i) {
          l.style.transformBox = 'fill-box';
          l.style.transformOrigin = 'left center';
          l.style.transform = 'scaleX(0)';
          l.style.animation = 'writeLine .5s var(--ease) ' + (0.1 + i * 0.13) + 's forwards';
        });
      } else if (kind === 'fold') {
        const f = svg.querySelector('.dfold');
        if (f) { f.style.opacity = '0'; f.style.animation = 'foldIn .6s var(--ease) .1s forwards'; }
      } else if (kind === 'rule') {
        const r = svg.querySelector('.drule');
        if (r) { r.style.strokeDasharray = '36'; r.style.strokeDashoffset = '36'; r.style.animation = 'draw .55s var(--ease) .1s forwards'; }
      }
    }
    card.addEventListener('click', run);
    card.addEventListener('mouseenter', run);
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
