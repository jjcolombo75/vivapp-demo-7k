(() => {
  // Halo: siempre queda encendido un cuerpo de la pantalla. Al tocar, el tocado; al desplazarse, el más cercano al centro.
  const SEL = '.card, .tile, .promo, .choice, .gcard, .slide, .passcard, .list, .post, .pcard, .ben, .cup, .sede, .wk, .slot, .rest';
  let cur = null, raf = 0, lock = 0;
  const light = el => { if (el === cur) return; if (cur) cur.classList.remove('lit'); cur = el; if (el) el.classList.add('lit'); };
  const screen = () => [...document.querySelectorAll('section.scr')].find(x => !x.hidden && x.offsetParent !== null);
  const pick = () => {
    raf = 0; const sc = screen(); if (!sc) return light(null);
    const vh = innerHeight, mid = vh * 0.42;
    let best = null, bd = Infinity;
    sc.querySelectorAll(SEL).forEach(el => {
      if (el.parentElement.closest(SEL) || el.closest('[hidden]') || !el.offsetParent) return;
      const r = el.getBoundingClientRect(); if (r.bottom < 60 || r.top > vh - 80 || !r.height || r.right < 8 || r.left > innerWidth - 8) return;
      const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (d < bd) { bd = d; best = el; }
    });
    if (!cur || !sc.contains(cur) || !cur.offsetParent || Date.now() > lock) light(best);
  };
  const later = () => { if (!raf) raf = requestAnimationFrame(pick); };
  document.addEventListener('pointerdown', e => { const el = e.target.closest(SEL); if (!el || el.closest('#demoSheet')) return; let top = el; while (top.parentElement && top.parentElement.closest(SEL)) top = top.parentElement.closest(SEL); light(top); lock = Infinity; }, { passive:true });
  document.addEventListener('scroll', () => { lock = 0; later(); }, { passive:true, capture:true });
  addEventListener('resize', later);
  new MutationObserver(() => setTimeout(later, 30)).observe(document.body, { attributes:true, attributeFilter:['hidden'], subtree:true });
  setTimeout(later, 300);
})();
