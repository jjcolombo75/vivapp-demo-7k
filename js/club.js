/* Vivapp · Club y plan: deuda, comercios, banners, categorías, pausa, plan en Inicio y Tus premios.
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 090
  // Plan: ejemplo con deuda (también pausa el club)
  let deuda = false;
  // T16 · Franja de deuda (T16-instrumentos § 0.5): único rojo de la app. Fuente: estado de deuda del socio en EVO
  // (GET v1/receivables/debtors; cuota con estado 4 = atrasada; sin probar contra la API real). Nunca en la sesión ni en Tu plan.
  var DEUDA_SCR = ['inicio','hoy','rutinas','progreso','muralScr','beneficios','social','semana','forma','fit','evolucion','beneficio','matches','chat','ia'];
  function deudaFranja(){ const b = $('#deudaBar'); if (b) b.hidden = !(deuda && DEUDA_SCR.includes(curScr)); }
  $('#deudaToggle').addEventListener('click', () => {
    deuda = !deuda;
    $('#deudaBox').hidden = !deuda;
    const p = $('#estadoPill'); p.textContent = deuda ? 'CON SALDO' : 'AL DÍA'; p.className = 'pill' + (deuda ? ' bad' : '');
    $('#deudaToggle').textContent = deuda ? 'Ver ejemplo al día' : 'Ver ejemplo con saldo pendiente'; deudaFranja();
    renderClub(); renderAvisoPlan();
  });

  // Club Viva (comercios del club actual como ejemplo; valores de ejemplo)
  const socio = { meses: 8, debito: true };
  const cats = [
    { id:'todo', n:'Todo' }, { id:'compras', n:'Compras' }, { id:'gastro', n:'Gastronomía' },
    { id:'belleza', n:'Belleza' }, { id:'salud', n:'Salud' }, { id:'serv', n:'Servicios' }
  ];
  const icons = {
    todo:'<path d="M3 9h18v4H3zM5 13v8h14v-8M12 9v12M12 9C10 5 6 5 6 7.5S12 9 12 9zM12 9c2-4 6-4 6-1.5S12 9 12 9z"/>',
    compras:'<path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    gastro:'<path d="M5 8h12v5a6 6 0 0 1-12 0zM17 9h1a3 3 0 0 1 0 6h-1M8 2v3M11 2v3M14 2v3"/>',
    belleza:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    salud:'<path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 15.4 12 20 12 20z"/>',
    serv:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'
  };
  const bens = [
    { id:1, com:'Belezza Estudio', cat:'belleza', pct:'30%', t:'30% de descuento', d:'30% de descuento.', tile:['#111','#fff','BELEZZA'], cover:['#f2c9c3','#8d6a66'], vig:'Hasta el 30/11', usos:'1 por mes', rec:true, camp:true },
    { id:2, com:'Paola Cajide', cat:'salud', pct:'20%', t:'20% en sesiones de sauna', d:'20% de descuento en sesiones de sauna.', tile:['#fbf6ea','#a8873b','PC'], cover:['#d39a58','#6b4220'], vig:'Hasta el 31/12', usos:'1 por semana', camp:true },
    { id:3, com:'Paola Cajide', cat:'salud', pct:'PROMO', t:'Promo cámara hiperbárica', d:'Promo en sesiones de cámara hiperbárica.', tile:['#fbf6ea','#a8873b','PC'], cover:['#b3c2ee','#4b5a8c'], vig:'Hasta el 31/12', usos:'1 por año' },
    { id:4, com:'Martyn & Laureano', cat:'belleza', pct:'35%', t:'35% de descuento', d:'35% de descuento.', tile:['#111','#fff','M&amp;L'], cover:['#6a6a6a','#1f1f1f'], vig:'Hasta el 30/11', usos:'1 por mes', rec:true },
    { id:5, com:'Mili Integral', cat:'gastro', pct:'20%', t:'20% de descuento', d:'20% de descuento en la tienda saludable.', tile:['#f1e27a','#1b1b1b','MILI'], cover:['#e0c294','#7a5a36'], vig:'Hasta el 31/12', usos:'2 por mes' },
    { id:6, com:'Fullness', cat:'salud', pct:'20%', t:'20% en el centro kinésico', d:'20% de descuento en el centro kinésico.', tile:['#fff','#1d3f8a','FULLNESS'], cover:['#c9d5e1','#5d6f82'], vig:'Hasta el 31/12', usos:'1 por mes', rec:true },
    { id:7, com:'Aveno', cat:'compras', pct:'15%', t:'15% en la tienda online', d:'Descuento acumulable en la tienda online.', tile:['#fff','#e8761e','Aveno'], cover:['#f7e3cf','#d58c4e'], vig:'Hasta el 31/12', usos:'Sin límite', rec:true, top:true },
    { id:8, com:'Espacio Casa', cat:'compras', pct:'5% extra', t:'5% extra en colchones y sommiers', d:'5% extra en colchones y sommiers.', tile:['#1b1b2a','#fff','EC'], cover:['#2a2240','#b23a7a'], vig:'Hasta el 30/11', usos:'1 por socio', banner:'Accedé a un 5% extra en colchones y sommiers' },
    { id:9, com:'Farmacity', cat:'compras', pct:'PROMO', t:'Promo Día de la Madre', d:'Beneficio especial por el Día de la Madre.', tile:['#fff','#1e9b4c','FARMACITY'], cover:['#d9efe0','#3f9a62'], vig:'Hasta el 20/10', usos:'1 por socio', camp:true },
    { id:10, com:"Kiehl's", cat:'belleza', pct:'PROMO', t:'Promo Día de la Madre', d:'Beneficio especial por el Día de la Madre.', tile:['#fff','#111',"KIEHL'S"], cover:['#dfe7f2','#5f7ea8'], vig:'Hasta el 20/10', usos:'1 por socio', camp:true },
    { id:11, com:'Viva Fit House', cat:'serv', pct:'$10.000', t:'Invitá a un amigo', d:'Tu amigo entrena gratis un día con vos. Si se asocia, vos recibís $10.000 y tu amigo paga la mitad de su primera cuota.', tile:['#07b0f2','#0a0d12','VIVA'], cover:['#2c3a12','#0a0d12'], vig:'Sin vencimiento', usos:'Sin límite', invite:true, banner:'Invitá a un amigo: entrena gratis con vos' },
  ];
  bens[0].banner = '30% de descuento en Belezza Estudio';
  const canjes = [ { t:'20% de descuento', com:'Mili Integral', code:'VIVA-3MQ8', estado:'usado', fecha:'05/10' } ];
  let cat = 'todo', q = '', curBen = null, campOnly = false;
  const fmtPts = n => n.toLocaleString('es-AR');

  function lockReason(b){
    if (deuda) return 'Club pausado: regularizá tu plan.';
    return '';
  }
  function badges(b){
    let h = '';
    if (b.req === 'debito') h += '<span class="badge deb">Exclusivo débito automático</span>';
    if (b.req === 'antig') h += '<span class="badge ant">Desde 1 año de socio</span>';
    return h;
  }
  const svg = (c, s=22) => '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[c] + '</svg>';
  const tile = b => '<span class="logo-t" style="background:' + b.tile[0] + ';color:' + b.tile[1] + '">' + b.tile[2] + '</span>';
  const cover = b => '<span class="cover" style="background:linear-gradient(135deg,' + b.cover[0] + ',' + b.cover[1] + ')">' + svg(b.cat, 40) + '</span>';

  function card(b, kind){
    const why = lockReason(b);
    return '<button class="gcard' + (kind ? ' ' + kind : '') + (why ? ' locked' : '') + '" data-ben="' + b.id + '">' +
      (kind === 'rc' ? (b.top ? '<span class="rec">' + svg('belleza', 14) + ' Recomendado</span>' : '<span class="rec ghost">' + cats.find(c => c.id === b.cat).n + '</span>') : cover(b)) +
      tile(b) + '<span class="npill">' + b.com + '</span><span class="pct">' + b.pct + '</span><span class="bdesc">' + b.d + '</span>' +
      (why ? '<span class="lockb">' + why + '</span>' : (b.req === 'debito' ? '<span class="lockb ok">Débito automático</span>' : '')) +
      '</button>';
  }

  // Banners
  const bnrItems = bens.filter(b => b.banner);
  $('#bnr').innerHTML = bnrItems.map(b => '<button class="slide" data-ben="' + b.id + '" style="background:linear-gradient(120deg,' + b.cover[1] + ' 0%,' + b.cover[0] + ' 100%)">' +
    '<span class="stile">' + tile(b) + '</span><span class="stxt"><span class="sk">' + b.com + '</span><span class="sh">' + b.banner + '</span></span></button>').join('');
  $('#bdots').innerHTML = bnrItems.map((_, i) => '<i' + (i === 0 ? ' class="on"' : '') + '></i>').join('');
  $('#bnr').addEventListener('scroll', () => {
    const i = Math.round($('#bnr').scrollLeft / ($('#bnr').scrollWidth / bnrItems.length));
    $$('#bdots i').forEach((d, j) => d.classList.toggle('on', j === i));
  });
  let bnrI = 0;
  setInterval(() => {
    if ($('#beneficios').hidden || $('#ctab-desc').hidden) return;
    bnrI = (bnrI + 1) % bnrItems.length;
    const el = $('#bnr'); el.scrollTo({ left: bnrI * (el.scrollWidth / bnrItems.length), behavior: 'smooth' });
  }, 4500);

  // Categorías
  $('#cats').innerHTML = cats.map(c => '<button class="catb" data-cat="' + c.id + '" aria-pressed="' + (c.id === cat) + '"><span class="circ">' + svg(c.id, 28) + '</span>' + c.n + '</button>').join('');
  $('#cats').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    cat = b.dataset.cat; campOnly = false; $$('#cats .catb').forEach(x => x.setAttribute('aria-pressed', x === b));
    renderList(); $('#gridBox').scrollIntoView({ behavior:'smooth', block:'start' });
  });
  $('#buscar').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); renderList(); });
  $('#campMore').addEventListener('click', () => { campOnly = true; cat = 'todo'; $$('#cats .catb').forEach(x => x.setAttribute('aria-pressed', x.dataset.cat === 'todo')); renderList(); $('#gridBox').scrollIntoView({ behavior:'smooth', block:'start' }); });
  $('#gridAll').addEventListener('click', () => { campOnly = false; cat = 'todo'; $$('#cats .catb').forEach(x => x.setAttribute('aria-pressed', x.dataset.cat === 'todo')); renderList(); });
  $$('[data-ctab]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.ctab;
    $$('.tabs [data-ctab]').forEach(x => x.setAttribute('aria-selected', x.dataset.ctab === k));
    ['desc','premios','canjes'].forEach(t => $('#ctab-' + t).hidden = t !== k);
  }));

  function renderList(){
    const items = bens.filter(b => !b.pts && (cat === 'todo' || b.cat === cat) && (!campOnly || b.camp) && (!q || (b.t + ' ' + b.com + ' ' + b.d).toLowerCase().includes(q)));
    $('#gridTitle').textContent = campOnly ? '¡Día de la Madre!' : cat === 'todo' ? 'Todos los descuentos' : cats.find(c => c.id === cat).n;
    $('#gridAll').hidden = !(campOnly || cat !== 'todo');
    $('#benList').innerHTML = items.length ? items.map(b => card(b)).join('') : '<p class="muted" style="grid-column:1/-1;text-align:center;margin:12px 0">No hay descuentos que coincidan.</p>';
    $('#recRow').innerHTML = bens.filter(b => b.rec).sort((a, b) => (b.top ? 1 : 0) - (a.top ? 1 : 0)).map(b => card(b, 'rc')).join('');
    $('#campRow').innerHTML = bens.filter(b => b.camp).map(b => card(b, 'hc')).join('');
  }
  $('#beneficios').addEventListener('click', e => { const b = e.target.closest('[data-ben]'); if (b) openBen(+b.dataset.ben); });

  function renderCanjes(){
    const vig = canjes.filter(c => c.estado === 'vigente'), us = canjes.filter(c => c.estado === 'usado');
    $('#canjesList').innerHTML = vig.concat(us).map(c =>
      '<div><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + c.com + '</span><span class="small muted">' + c.t + ' · <span style="font-family:ui-monospace,Menlo,monospace">' + c.code + '</span></span></span>' +
      (c.estado === 'vigente' ? '<span class="pill warn">VENCE EN 24 H</span>' : '<span class="small muted">Usado ' + c.fecha + '</span>') + '</div>').join('');
  }

  function openBen(id){
    const b = bens.find(x => x.id === id); curBen = b;
    $('#dCat').textContent = cats.find(c => c.id === b.cat).n;
    $('#dHero').innerHTML = cover(b) + tile(b);
    $('#dCom').textContent = b.com; $('#dTit').textContent = b.t; $('#dDesc').textContent = b.d;
    $('#dBadges').innerHTML = badges(b); $('#dVig').textContent = b.vig; $('#dUsos').textContent = b.usos;
    const why = lockReason(b);
    $('#dLock').hidden = !why; $('#dLockTxt').textContent = why;
    $('#dCode').hidden = true;
    const btn = $('#canjearBtn');
    btn.hidden = false; btn.disabled = !!why; btn.style.opacity = why ? .4 : 1;
    btn.textContent = b.invite ? 'Invitar por WhatsApp' : 'Obtener mi código';
    go('beneficio');
  }
  $('#canjearBtn').addEventListener('click', () => {
    const b = curBen; if (!b || lockReason(b)) return;
    if (b.invite) {
      const txt = 'Te invito a entrenar gratis un día conmigo en Viva Fit House. Bajate la app y usá mi código VIVA-MART.';
      try { if (navigator.share) navigator.share({ text:txt }).catch(() => {}); else toast('Se abre WhatsApp con tu invitación'); } catch(_) { toast('Se abre WhatsApp con tu invitación'); }
      return;
    }
    const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const code = 'VIVA-' + Array.from({length:4}, () => abc[Math.floor(Math.random() * abc.length)]).join('');
    canjes.unshift({ t:b.t, com:b.com, code:code, estado:'vigente' });
    $('#dCodeTxt').textContent = code; $('#dCode').hidden = false; $('#canjearBtn').hidden = true;
    renderClub(); toast('Código generado');
  });
  $('#copyBtn').addEventListener('click', () => {
    const txt = $('#dCodeTxt').textContent;
    try { navigator.clipboard.writeText(txt).then(() => toast('Código copiado'), () => toast('Mantené apretado el código para copiarlo')); }
    catch(_) { toast('Mantené apretado el código para copiarlo'); }
  });

  function renderClub(){
    renderPremios();
    $('#clubPausa').hidden = !deuda;
    renderList(); renderCanjes();
  }
  renderClub();

//#bloque 180
  // ===== Pausar el plan =====
  const HOY0 = ahora(); HOY0.setHours(0, 0, 0, 0);
  let VENCE = new Date(HOY0.getTime() + 18 * 864e5); // demo: al día; el panel lo lleva a 3 días
  const ddmm = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  let pausa = null;
  // Últimos pagos: un mes antes de cada vencimiento (en producción, los recibos del socio en EVO)
  $('#pagosList').innerHTML = [1, 2, 3].map(k => { const d = new Date(VENCE.getFullYear(), VENCE.getMonth() - k, VENCE.getDate()), m = mesTxt(d.getMonth());
    return '<div><span class="stack" style="gap:0;flex:1"><span style="font-weight:500">' + m.charAt(0).toUpperCase() + m.slice(1) + '</span><span class="small muted" style="font-size:12px">' + ddmm(d) + ' · ' + (k === 3 ? 'Transferencia' : 'Débito automático') + '</span></span><span style="font-weight:700">[MONTO]</span></div>'; }).join('');
  const psDias = () => parseInt(val('pdias'), 10);
  function updPs(){
    const n = psDias(), nv = new Date(VENCE.getTime() + n * 864e5);
    $('#psInfo').textContent = 'Desde mañana, por ' + n + ' días. Tu plan pasa a vencer el ' + ddmm(nv) + '. No pagás nada extra.' + (val('pmot') === 'Lesión o salud' ? ' Le avisamos a tu profe para que la vuelta sea gradual.' : '');
  }
  // En Inicio, el plan aparece solo cuando hace falta: vence en 5 días o menos, o hay saldo pendiente
  function renderAvisoPlan(){
    const nv = pausa ? new Date(VENCE.getTime() + pausa.n * 864e5) : VENCE, dias = Math.round((nv - HOY0) / 864e5);
    PLAN_AV = deuda || dias <= 5; $('#planAviso').hidden = !PLAN_AV; avisosLater();
    $('#paTxt').textContent = deuda ? 'Tenés un saldo pendiente. Regularizalo para seguir sumando en Club VIVA.' : dias <= 0 ? 'Tu plan vence hoy. Renovalo en un toque.' : 'Tu plan vence en ' + dias + (dias === 1 ? ' día' : ' días') + ' (' + ddmm(nv) + '). Renovalo en un toque.';
  }
  function renderPlan(){
    const nv = pausa ? new Date(VENCE.getTime() + pausa.n * 864e5) : VENCE;
    $('#planVenc').textContent = 'Vence el ' + ddmm(nv); renderAvisoPlan();
    { const dd = Math.max(0, Math.round((nv - HOY0) / 864e5)); $('#planDias').textContent = dd === 1 ? '1 día' : dd + ' días'; $('#planBar').style.width = Math.min(100, Math.round(dd / 30 * 100)) + '%'; }
    $('#pausaNote').hidden = !pausa;
    if (pausa) $('#pausaNote').textContent = 'Pausado del ' + ddmm(pausa.desde) + ' al ' + ddmm(pausa.hasta) + ' (' + pausa.mot.toLowerCase() + '). Tus semanas, tu mes y tus fichas quedan congelados: no perdés nada.';
    $('#pausaBtn').lastChild.textContent = pausa ? 'Reanudar mi plan ahora' : 'Pausar mi plan';
    $('#pausaHint').hidden = !!pausa;
    if (!deuda) { const p = $('#estadoPill'); p.textContent = pausa ? 'PAUSADO' : 'AL DÍA'; p.className = 'pill' + (pausa ? ' gris' : ''); }
  }
  $('#venceDemo').addEventListener('click', () => { const corto = Math.round((VENCE - HOY0) / 864e5) > 5; VENCE = new Date(HOY0.getTime() + (corto ? 3 : 18) * 864e5); $('#venceDemo').textContent = corto ? 'Volver al plan al día' : 'Ver plan que vence en 3 días'; renderPlan(); $('#demoSheet').hidden = true; go('inicio'); toast(corto ? 'El plan vence en 3 días: aparece el aviso en Inicio' : 'Plan al día: el aviso no aparece'); });
  $('#pausaBtn').addEventListener('click', () => { if (pausa) { pausa = null; renderPlan(); toast('Tu plan está activo otra vez'); return; } updPs(); $('#pausaSheet').hidden = false; });
  $('#pausaSheet').addEventListener('click', e => { if (e.target.id === 'pausaSheet') { $('#pausaSheet').hidden = true; return; } updPs(); });
  $('#psCancel').addEventListener('click', () => $('#pausaSheet').hidden = true);
  $('#psOk').addEventListener('click', () => {
    const n = psDias(), desde = new Date(+ahora() + 864e5);
    pausa = { n, mot:val('pmot'), desde, hasta:new Date(desde.getTime() + (n - 1) * 864e5) };
    $('#pausaSheet').hidden = true; renderPlan(); toast('Plan pausado por ' + n + ' días');
  });

//#bloque 270
  // ----- Tus premios (Club): solo por semanas cumplidas; se retiran en recepción -----
  function renderPremios(){
    if (!MUR) return;
    const n = MUR.sem, L = [];
    const it = (ico, t, s, done) => '<div class="prem' + (done ? ' done' : '') + '"><span class="pi"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[ico] + '</svg></span><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + t + '</span><span class="small muted" style="line-height:1.4">' + s + '</span></span></div>';
    if (BEN_MES && (MUR.cerrado || MUR.meses.length)) L.push(it('regalo', '25% en Mili Integral', 'Beneficio del mes de Club VIVA, por tu Mes cumplido. Pedí el código en Descuentos.', false));
    if (n === 0) L.push(it('pulso', 'InBody de punto de partida, gratis', 'Si venís 8 veces en tus primeras 4 semanas. Llevás 2.', false));
    else L.push(it('pulso', 'InBody de punto de partida', n >= 12 ? 'Ganado en tu primer mes · usado' : 'Ganado en tu primer mes · pedí tu turno en recepción', n >= 12));
    [[12, 'Pin VIVA + InBody de control', 'rayo'], [24, 'Remera VIVA + InBody de control', 'corazon'], [36, 'InBody de control', 'mancuerna'], [48, 'InBody de control + premio VIVA', 'estrella']].forEach(([u, t, ico]) => {
      if (n >= u) L.push(it(ico, t, 'Ficha de ' + u + ' semanas · ' + (u === Math.max.apply(null, [12, 24, 36, 48].filter(x => x <= n)) ? 'para retirar en recepción' : 'retirado'), u !== Math.max.apply(null, [12, 24, 36, 48].filter(x => x <= n))));
    });
    const prox = [12, 24, 36, 48].find(u => u > n);
    if (prox) L.push(it('estrella', 'Próximo: ' + (prox === 12 ? 'pin VIVA + InBody de control' : prox === 24 ? 'remera VIVA + InBody de control' : 'InBody de control'), 'Con tu ficha de ' + prox + ' semanas cumplidas. Te faltan ' + (prox - n) + '.', true));
    $('#premList').innerHTML = L.join('');
    const porRetirar = L.filter(x => x.includes('para retirar') || x.includes('pedí tu turno')).length; PREM_N = porRetirar; avisosLater();
    $('#promoTxt').innerHTML = porRetirar ? 'Club Viva: tenés <strong>' + porRetirar + (porRetirar === 1 ? ' premio' : ' premios') + '</strong> para retirar en recepción' : 'Club Viva: beneficios en más de 1.000 comercios';
  }

