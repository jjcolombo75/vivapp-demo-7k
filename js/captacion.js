/* Vivapp · Captación: ingreso, embudo, pago por uso, pase, primer entrenamiento y alta.
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 020
  // Ingreso por teléfono
  let demo = 'socio';
  function step(n){
    [0,1,2,3].forEach(i => $('#step'+i).hidden = i !== n);
    $('#loginBack').hidden = n === 0; $('#lDots').hidden = n === 0; $('#lSocioTop').hidden = n !== 0;
    $('#dot2').classList.toggle('on', n >= 2);
    $('#dot3').classList.toggle('on', n === 3);
    $('#loginBack').dataset.back = n - 1;
  }
  $$('[data-step]').forEach(b => b.addEventListener('click', () => {
    const t = $('#tel').value.trim(); $('#telShow').textContent = t; $('#telOk').textContent = t;
    step(+b.dataset.step);
  }));
  $('#loginBack').addEventListener('click', e => step(+e.currentTarget.dataset.back));
  $$('.code input').forEach((inp, i, all) => inp.addEventListener('input', () => { if (inp.value && all[i+1]) all[i+1].focus(); }));
  let ppuIntent = false;
  const entrarSocio = () => { demo = 'socio'; ppuIntent = false; $('#s1Title').textContent = 'Ingresá con tu teléfono'; $('#s1Txt').textContent = 'Te mandamos un código por WhatsApp. Lo hacés una sola vez: después la app entra directo.'; step(1); };
  $('#lSocio').addEventListener('click', entrarSocio); $('#lSocioTop').addEventListener('click', entrarSocio);
  $('#lPpu').addEventListener('click', () => { demo = 'nuevo'; ppuIntent = true; $('#s1Title').textContent = 'Primero, tu teléfono'; $('#s1Txt').textContent = 'Te mandamos un código por WhatsApp para crear tu cuenta. Después elegís la sede y pagás.'; step(1); });
  function renderLanding(){
    const col = { low:'var(--ok)', mid:'var(--orange)', high:'var(--pink)', full:'var(--pink)' };
    $('#lOcc').innerHTML = sedesPPU.map(x => { const [lv, c] = nivel(x.occ); return '<div class="lsede"><span class="hdot oc-' + c + '" style="background:' + col[c] + '"></span><span style="flex:1;font-weight:500">' + x.n + '</span><span class="small muted">' + (c === 'low' ? 'Poca gente' : c === 'mid' ? 'Gente moderada' : 'Mucha gente') + '</span></div>'; }).join('');
    const pr = sedesPPU.map(x => precio(x.occ)).filter(x => x !== null);
    $('#lDesde').textContent = 'Desde ' + money(Math.min.apply(null, pr)) + ' ahora';
    $('#hsTrial').textContent = mitad() ? 'Probala a mitad de precio con un profe' : 'Probala gratis con un profe';
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-group="gancho"]')) setTimeout(renderLanding, 0); });
  // Estado del embudo de personas nuevas
  var lastFeel = null;
  let leadFlow = false, leadMode = false, leadSaved = false, cuenta = false, preview = false, fichaOk = false, trial = null, feelMsg = null;
  $('#validar').addEventListener('click', () => {
    if (leadFlow) { leadFlow = false; cuenta = true; guardarLead(); return; }
    if (demo === 'socio') { go('inicio'); toast('Encontramos tu cuenta de socia'); }
    else step(3);
  });
  $('#crearCuenta').addEventListener('click', () => {
    if (!$('#rNom').value.trim()) { toast('Contanos tu nombre'); return; }
    $('#nName').textContent = $('#rNom').value.trim(); cuenta = true;
    renderNuevo(); if (ppuIntent) { go('ppu'); toast('Cuenta creada · elegí tu sede'); } else { go('nuevo'); toast('Cuenta creada'); }
  });
  $('#logout').addEventListener('click', () => { step(0); go('login'); });

//#bloque 110
  // ===== Pago por uso (valores de ejemplo, configurables desde Viva Gestión) =====
  const cfg = { ventana:30, tope:90, base:5000, tramos:[[40,1],[70,1.3],[101,1.6]] };
  const sedesPPU = [
    { id:'sar', n:'Sarmiento', occ:34 }, { id:'lyp', n:'López y Planes', occ:57 },
    { id:'cor', n:'Corrientes', occ:74 }, { id:'alb', n:'Alberdi', occ:92 }, { id:'sta', n:'Santa Ana', occ:22 }
  ];
  const money = n => '$' + Math.round(n).toLocaleString('es-AR');
  const precio = o => { if (o >= cfg.tope) return null; const t = cfg.tramos.find(x => o < x[0]); return Math.round(cfg.base * t[1] / 100) * 100; };
  const nivel = o => o >= cfg.tope ? ['Completa','full'] : o >= 70 ? ['Alta','high'] : o >= 40 ? ['Media','mid'] : ['Baja','low'];
  $$('.vent').forEach(el => el.textContent = cfg.ventana);
  let selSede = null, ago = 0, pase = null, saldo = 0;

  function renderPPU(){
    $('#ppuList').innerHTML = sedesPPU.map(s => {
      const pr = precio(s.occ), [lv, cls] = nivel(s.occ);
      return '<button class="sede ' + cls + '" data-sede="' + s.id + '"' + (pr === null ? ' aria-disabled="true"' : '') + '>' +
        '<span class="stack" style="gap:6px;flex:1;min-width:0"><span style="font-weight:700;font-size:16px">' + s.n + '</span>' +
        '<span class="occ sm"><i style="width:' + s.occ + '%"></i></span>' +
        '<span class="small"><span class="lv">' + lv + '</span> · ' + s.occ + '% de ocupación</span></span>' +
        (pr === null ? '<span class="pill bad">COMPLETA</span>' : '<span class="num" style="font-size:26px">' + money(pr) + '</span>') +
        '</button>';
    }).join('');
    const ok = sedesPPU.map(s => precio(s.occ)).filter(x => x !== null);
    $('#nDesde').textContent = ok.length ? 'Desde ' + money(Math.min.apply(null, ok)) + ' ahora' : 'Todas las sedes completas ahora';
  }
  function renderCotiza(){
    if (!selSede) return;
    const s = sedesPPU.find(x => x.id === selSede), pr = precio(s.occ), [lv, cls] = nivel(s.occ);
    $('#cSede').textContent = s.n;
    $('#cOcc').textContent = s.occ + '%'; $('#cLvl').textContent = lv;
    $('#cBar').style.width = s.occ + '%'; $('#cBar').className = cls;
    $('#cPrice').textContent = pr === null ? 'Completa' : money(pr);
    const b = $('#payBtn'); b.disabled = pr === null; b.style.opacity = pr === null ? .4 : 1;
    const usa = pr === null ? 0 : Math.min(saldo, pr), apagar = pr === null ? 0 : pr - usa;
    $('#cSaldo').hidden = !saldo; $('#cSaldo').textContent = 'Tenés ' + money(saldo) + ' de saldo a favor (vence en 60 días): lo descontamos solo.';
    $('#payTxt').textContent = pr === null ? 'Sede completa en este momento' : apagar === 0 ? 'Entrar con mi saldo a favor' : 'Pagar ' + money(apagar) + ' con Mercado Pago';
  }
  $('#ppuList').addEventListener('click', e => {
    const b = e.target.closest('[data-sede]'); if (!b) return;
    const s = sedesPPU.find(x => x.id === b.dataset.sede);
    if (precio(s.occ) === null) { toast(s.n + ' está completa ahora. Probá otra sede.'); return; }
    selSede = s.id; renderCotiza(); go('cotiza');
  });

  // Ocupación en vivo (simulada a partir de los ingresos de molinete)
  setInterval(() => {
    sedesPPU.forEach(s => {
      const d = Math.round((Math.random() - 0.5) * 8);
      s.occ = Math.max(8, Math.min(97, s.occ + d));
      if (s.id === 'alb') s.occ = Math.max(90, Math.min(96, s.occ));
    });
    ago = 0; renderPPU(); renderCotiza(); renderOcc();
  }, 4000);
  setInterval(() => { ago++; $('#ppuAgo').textContent = ago; tickPase(); }, 1000);

  // Pago (simulado) y pase
  const hhmm = d => String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  $('#payBtn').addEventListener('click', () => requireFicha(() => {
    const s = sedesPPU.find(x => x.id === selSede), pr = precio(s.occ); if (pr === null) return;
    const usa = Math.min(saldo, pr), apagar = pr - usa;
    const activar = () => {
      saldo -= usa; const now = new Date();
      pase = { sede:s.n, paid:pr, at:now, until:new Date(now.getTime() + cfg.ventana * 60000), estado:'activo' };
      consumos.unshift({ d:now, sede:s.n, monto:apagar }); paintPase(); go('pase');
    };
    if (!apagar) { activar(); toast('Usaste tu saldo a favor'); return; }
    $('#mpSheet').hidden = false; $('#mpWait').hidden = false; $('#mpOk').hidden = true;
    setTimeout(() => {
      $('#mpWait').hidden = true; $('#mpOk').hidden = false; $('#mpOkTxt').textContent = 'Acreditado en Viva Fit House · ' + money(apagar);
      setTimeout(() => { $('#mpSheet').hidden = true; activar(); }, 1300);
    }, 1600);
  }));
  function vencer(){
    if (!pase || pase.estado !== 'activo') return;
    pase.estado = 'vencido'; saldo += pase.paid;
    $('#pVencTxt').textContent = 'Pasaron los ' + cfg.ventana + ' minutos. Los ' + money(pase.paid) + ' quedaron como saldo a favor para tu próximo ingreso. Vence en 60 días.';
    paintPase(); renderCotiza(); toast('Quedó como saldo a favor');
  }
  function paintPase(){
    if (!pase) return;
    $('#pSede').textContent = pase.sede; $('#pPaid').textContent = money(pase.paid);
    $('#pAt').textContent = hhmm(pase.at); $('#pUntil').textContent = hhmm(pase.until);
    $('#pActivo').hidden = pase.estado !== 'activo'; $('#pDentro').hidden = pase.estado !== 'dentro'; $('#pVencido').hidden = pase.estado !== 'vencido';
    $('#pDemo').hidden = pase.estado !== 'activo';
    $('#nPase').hidden = pase.estado !== 'activo';
    renderPpuHome();
    tickPase();
  }
  function tickPase(){
    if (!pase || pase.estado !== 'activo') return;
    const left = Math.max(0, Math.round((pase.until - Date.now()) / 1000));
    const t = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
    $('#pCount').textContent = t;
    $('#pBar').style.width = (left / (cfg.ventana * 60) * 100).toFixed(1) + '%';
    $('#nPaseTxt').textContent = pase.sede + ' · quedan ' + t + ' para entrar';
    if (left === 0) vencer();
  }
  $('#simIngreso').addEventListener('click', () => {
    pase.estado = 'dentro'; pase.inAt = new Date(); $('#pDentroTxt').textContent = pase.sede + ' · ' + hhmm(new Date()) + '. ¡Buen entrenamiento!';
    paintPase(); toast('Molinete habilitado');
  });
  $('#simVence').addEventListener('click', () => { pase.until = new Date(); vencer(); });
  renderPPU();

  // ===== Inicio y entrenamientos de pago por uso =====
  const diasAtras = (n, h, m) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, m, 0, 0); return d; };
  const consumos = [
    { d:diasAtras(3, 18, 40), sede:'López y Planes', monto:6500 },
    { d:diasAtras(7, 10, 5), sede:'Sarmiento', monto:5000 },
    { d:diasAtras(14, 19, 30), sede:'López y Planes', monto:8000 }
  ];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const franjas = [['7',6500],['9',5000],['11',5000],['13',5000],['15',5000],['17',6500],['19',8000],['21',6500]];
  rutinas.ppu = null;

  function renderPpuHome(){
    $('#phName').textContent = $('#nName').textContent;
    try { const s = new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' }); $('#phHoy').textContent = s.charAt(0).toUpperCase() + s.slice(1); } catch(_){}
    // Estado del pase de hoy
    let h = '';
    if (!pase) h = '<span class="lbl">Sin pase hoy</span><button class="btn sm" data-go="ppu">Pagar un ingreso</button>';
    else if (pase.estado === 'activo') h = '<div class="between"><span class="lbl">Pase de hoy · ' + pase.sede + '</span><span class="pill ok">ACTIVO</span></div><span class="h2" style="font-size:28px">Entrá antes de las ' + hhmm(pase.until) + '</span><button class="btn sm" data-go="pase">Ver mi pase</button>';
    else if (pase.estado === 'dentro') h = '<div class="between"><span class="lbl">Pase de hoy · ' + pase.sede + '</span><span class="pill ok">USADO</span></div><span class="h2" style="font-size:28px">Ingresaste a las ' + hhmm(pase.inAt || new Date()) + '</span><span class="small muted">¡Buen entrenamiento! Tu rutina está en la pestaña Entrenamientos.</span>';
    else h = '<div class="between"><span class="lbl">Pase de hoy · ' + pase.sede + '</span><span class="pill" style="background:var(--panel2);color:var(--muted)">SIN USAR</span></div><span class="h2" style="font-size:26px">Tenés ' + money(saldo) + ' de saldo a favor</span><span class="small muted">No llegaste a entrar a tiempo: no perdiste nada.</span><button class="btn sm" data-go="ppu">Usar mi saldo</button>';
    $('#phPase').innerHTML = h;
    // Estadísticas del mes
    const now = new Date(), mes = consumos.filter(c => c.d.getMonth() === now.getMonth() && c.d.getFullYear() === now.getFullYear());
    $('#phCount').textContent = mes.length;
    $('#phSum').textContent = money(mes.reduce((a, c) => a + c.monto, 0));
    $('#phMes').textContent = meses[now.getMonth()];
    // Empujón a plan: lo pagado por uso se descuenta del primer mes
    const gast = mes.reduce((a, c) => a + c.monto, 0);
    const pagos = mes.filter(c => c.monto > 0).length;
    $('#phNudge').hidden = pagos < 2;
    $('#phNudge').innerHTML = '<span class="lbl">¿Venís seguido?</span><span style="font-weight:700;font-size:18px;line-height:1.3">Este mes ya pagaste ' + pagos + ' ingresos: ' + money(gast) + '.</span><span class="small muted" style="line-height:1.45">Si te pasás al plan mensual, te descontamos esos ' + money(gast) + ' del primer mes (hasta la mitad de la cuota).</span><button class="btn sm" data-go="planes">Ver planes</button>';
    $('#plNudge').hidden = !gast; $('#plNudge').textContent = 'Te descontamos los ' + money(gast) + ' que pagaste por uso este mes, hasta la mitad del primer mes.';
    // Mejores horarios
    const sede = pase ? pase.sede : 'López y Planes';
    $('#phSede').textContent = sede;
    const max = Math.max.apply(null, franjas.map(f => f[1])), min = Math.min.apply(null, franjas.map(f => f[1]));
    $('#phChart').innerHTML = franjas.map(f => '<span class="hb' + (f[1] === min ? ' best' : '') + '" style="height:' + Math.round(f[1] / max * 100) + '%" title="' + f[0] + ' h · ' + money(f[1]) + '"><em>' + (f[1] / 1000).toLocaleString('es-AR') + 'k</em></span>').join('');
    $('#phLabels').innerHTML = franjas.map(f => '<span>' + f[0] + ' h</span>').join('');
    $('#phTip').textContent = 'Lo más barato en ' + sede + ': de 9 a 16 h, ' + money(min) + ' promedio.';
    // Consumos
    $('#phList').innerHTML = consumos.map(c => '<div><span class="stack" style="gap:2px;flex:1"><span style="font-weight:700">' + c.sede + '</span><span class="small muted">' +
      c.d.toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit' }) + ' · ' + hhmm(c.d) + '</span></span><span style="font-weight:700">' + (c.monto ? money(c.monto) : 'Saldo a favor') + '</span></div>').join('');
  }

  function renderPpuTrain(){
    const r = rutinas.ppu;
    if (!r) { $('#ptList').innerHTML = '<div class="card" style="align-items:center;text-align:center"><span class="h2" style="font-size:24px">Todavía no tenés rutina</span><span class="small muted">Contanos tu objetivo y la IA te arma una rutina con las máquinas de la sede.</span></div>'; return; }
    $('#ptList').innerHTML = '<div class="card rut cur"><div class="between"><span class="pill ia">GENERADA CON IA</span><span class="pill ok">EN CURSO</span></div>' +
      '<div class="stack" style="gap:4px"><span class="h2" style="font-size:28px">' + r.nombre + '</span><span class="small muted">' + r.sub + '</span></div>' +
      '<div class="days" style="grid-template-columns:repeat(' + r.dias.length + ',minmax(0,1fr))">' +
      r.dias.map((d, i) => '<button class="day ' + (i < r.next ? 'done' : i === r.next ? 'today' : '') + '" data-pstart="' + i + '"><b>' + d.k + '</b><span>' + (i < r.next ? 'Hecho' : i === r.next ? 'Hoy' : d.lbl) + '</span></button>').join('') +
      '</div><span class="small muted">Tocá un día para entrenar.</span></div>';
  }
  $('#ptList').addEventListener('click', e => { const b = e.target.closest('[data-pstart]'); if (b) startDay('ppu', +b.dataset.pstart); });
  $('#iaBack').addEventListener('click', () => { if (leadMode) { setLead(false); if (!cuenta) step(0); go(cuenta ? 'nuevo' : 'login'); return; } go(modo === 'ppu' ? 'ppuTrain' : 'rutinas'); });
  $('#exMin').addEventListener('click', () => { stopRest(); if (preview) { go(leadSaved ? 'nuevo' : 'ia'); return; } go(modo === 'ppu' ? 'ppuHome' : 'inicio'); });
  $$('[data-go="ppuHome"],[data-go="ppuTrain"]').forEach(b => b.addEventListener('click', () => { renderPpuHome(); renderPpuTrain(); }));
  renderPpuTrain();

//#bloque 140
  // ===== Embudo: primero la rutina, después los datos =====
  function setLead(on){
    leadMode = on;
    $('#iaH1').textContent = on ? 'Creá tu rutina a medida' : 'Contanos cómo querés entrenar';
    $('#iaSub').hidden = !on;
  }
  function abrirLead(){ setLead(true); $('#iaResult').hidden = true; $('#iaLoading').hidden = true; $('#iaForm').hidden = false; go('ia'); }
  $('#leadStart').addEventListener('click', abrirLead);
  $('#nLead').addEventListener('click', abrirLead);
  function prepLead(){
    $('#leadPrev').hidden = !leadMode; $('#activarBtn').hidden = leadMode; $('#iaAviso').hidden = leadMode;
    if (!leadMode) return;
    rutinas.lead = crearRutinaIA(); leadSaved = false;
    const d = rutinas.lead.dias[0];
    $('#lpName').textContent = 'Día A · ' + d.n;
    $('#lpList').innerHTML = d.ex.map(k => { const e = lib[k]; return '<div class="between" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="stack" style="gap:0;min-width:0"><span style="font-weight:700">' + e.n + '</span><span class="small muted">' + e.grupo + '</span></span><span class="small" style="font-weight:700;white-space:nowrap">' + e.sets.length + ' × ' + e.sets[0][2] + '</span></div>'; }).join('');
  }
  $('#lpTry').addEventListener('click', () => startDay('lead', 0, true));
  function guardarLead(){
    leadSaved = true; setLead(false); renderNuevo(); renderSlots(); go('prueba');
    toast('Guardada · un profe la revisa');
  }
  $('#lpSave').addEventListener('click', () => { if (cuenta) guardarLead(); else go('guardar'); });
  $('#gBack').addEventListener('click', () => go('ia'));
  $('#gSend').addEventListener('click', () => {
    const n = $('#gNom').value.trim(), t = $('#gTel').value.trim();
    if (!n || t.replace(/\D/g, '').length < 8) { toast('Completá nombre y teléfono'); return; }
    $('#nName').textContent = n; $('#tel').value = t; $('#telShow').textContent = t;
    leadFlow = true; step(2); go('login');
  });

  // Primer entrenamiento gratis, en un horario con poca gente
  const diaLbl = n => { if (n === 0) return 'Hoy'; if (n === 1) return 'Mañana'; const d = new Date(Date.now() + n * 864e5), w = d.toLocaleDateString('es-AR', { weekday:'long' }); return w.charAt(0).toUpperCase() + w.slice(1) + ' ' + d.getDate(); };
  const slots = [ { dia:'Mañana', h:'14:00', sede:'Sarmiento', nota:'Poca gente · ideal para arrancar', lv:'low' }, { dia:'Mañana', h:'10:30', sede:'Santa Ana', nota:'Poca gente', lv:'low' }, { dia:diaLbl(3), h:'15:00', sede:'López y Planes', nota:'Gente moderada', lv:'mid' } ];
  let slotSel = 0;
  const okIco = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--dat)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
  const mitad = () => val('gancho') === 'Mitad de precio';
  function renderSlots(){
    const m = mitad();
    $('#pruH1').textContent = m ? 'Probala a mitad de precio' : 'Probala gratis';
    $('#pruTxt').textContent = m ? 'Tu primer entrenamiento en Viva a mitad de precio: $2.500 (uno por persona). Te recibe un profe con 15 minutos de bienvenida. Te sugerimos los horarios con menos gente.' : 'Tu primer entrenamiento en Viva no se paga (uno por persona). Te recibe un profe con 15 minutos de bienvenida. Te sugerimos los horarios con menos gente.';
    $('#trialOk').textContent = m ? 'Reservar a mitad de precio' : 'Reservar mi entrenamiento gratis';
    $('#slotList').innerHTML = slots.map((x, i) => '<button class="slot" data-slot="' + i + '" aria-pressed="' + (i === slotSel) + '"><span class="stack" style="gap:2px;flex:1"><span style="font-weight:700;font-size:17px">' + x.dia + ' · ' + x.h + '</span><span class="small muted">Sede ' + x.sede + '</span><span class="small lvt ' + x.lv + '">' + x.nota + '</span></span>' + (i === slotSel ? okIco : '') + '</button>').join('');
  }
  $('#slotList').addEventListener('click', e => { const b = e.target.closest('[data-slot]'); if (b) { slotSel = +b.dataset.slot; renderSlots(); } });
  $('#trialOk').addEventListener('click', () => { trial = slots[slotSel]; renderNuevo(); go('nuevo'); toast('Te esperamos ' + trial.dia.toLowerCase() + ' a las ' + trial.h); });
  $('#trialSkip').addEventListener('click', () => { renderNuevo(); go('nuevo'); });

  let planOffer = false;
  const vence48 = () => { const d = new Date(Date.now() + 2 * 864e5); return d.toLocaleDateString('es-AR', { weekday:'long', day:'numeric' }); };
  function renderNuevo(){
    const t = $('#nTrial'); t.hidden = !trial;
    if (trial && trial.hecho) t.innerHTML = '<div class="between"><span class="lbl">Tu primera visita</span><span class="pill ok">HECHA</span></div><span class="h2" style="font-size:28px">¡Gracias por venir, ' + $('#nName').textContent + '!</span>' +
      '<div class="note"><span class="avatar" style="width:30px;height:30px;font-size:11px">LP</span><span>Prof. Lucas ajustó tu rutina: bajó el peso en sentadilla y sumó movilidad de cadera.</span></div>' +
      '<div class="note lime"><span><strong>Asociate antes del ' + vence48() + ':</strong> 20% en tu primer mes.</span></div>' +
      '<button class="btn sm" data-go="planes">Ver planes</button><span class="small muted" style="text-align:center">Tu cara ya quedó registrada: como socio entrás directo.</span>';
    else if (trial) t.innerHTML = '<div class="between"><span class="lbl">' + (mitad() ? 'Tu entrenamiento a mitad de precio' : 'Tu entrenamiento gratis') + '</span><span class="pill ok">RESERVADO</span></div><span class="h2" style="font-size:28px">' + trial.dia + ' · ' + trial.h + '</span><span class="small muted" style="line-height:1.45">Sede ' + trial.sede + ' · un profe te recibe con 15 minutos de bienvenida.' + (mitad() ? ' Pagás $2.500 al entrar.' : '') + '</span><button class="btn sm" id="nTrialQr">Preparar mi primer ingreso</button><button class="link" id="simVisita" style="min-height:44px;font-size:13px">Demo: simular que ya fui</button>';
    $('#plNudge').hidden = !planOffer && $('#plNudge').hidden; if (planOffer) { $('#plNudge').hidden = false; $('#plNudge').innerHTML = '<span><strong>20% en tu primer mes</strong> por haber venido a tu primera visita. Válido hasta el ' + vence48() + '.</span>'; }
    const r = $('#nRut'), tiene = !!(rutinas.lead && leadSaved);
    r.hidden = !tiene;
    if (tiene) r.innerHTML = '<div class="between"><span class="pill ia">GENERADA CON IA</span><span class="small muted">Se revisa después de tu visita</span></div><span class="h2" style="font-size:26px">' + rutinas.lead.nombre + '</span><div class="note"><span class="avatar" style="width:30px;height:30px;font-size:11px">LP</span><span>Después de tu primera visita, un profe la ajusta a vos y te avisa por WhatsApp.</span></div><button class="btn ghost sm" id="nRutVer">Ver mi rutina</button>';
    $('#nLead').hidden = tiene;
  }
  $('#nuevo').addEventListener('click', e => {
    if (e.target.closest('#nTrialQr')) requireFicha(() => showAcceso((mitad() ? 'Entrenamiento a mitad de precio' : 'Entrenamiento gratis') + ' · ' + trial.dia + ' ' + trial.h + ' · Sede ' + trial.sede));
    if (e.target.closest('#simVisita')) { trial.hecho = true; fichaOk = true; planOffer = true; renderNuevo(); $('#nuevo .body').scrollTop = 0; toast('Así se ve después de tu primera visita'); }
    if (e.target.closest('#nRutVer')) startDay('lead', 0, true);
  });
  function showQR(lbl, name){ $('#qrLbl').textContent = lbl; $('#qrName').textContent = name; $('#qrOverlay').hidden = false; }
  function showAcceso(lbl){ showQR(lbl, $('#nName').textContent); }

  // Elegir plan → Mercado Pago (simulado) → alta de socio
  $('#planes').addEventListener('click', e => {
    const b = e.target.closest('[data-plan]'); if (!b) return;
    requireFicha(() => {
      $('#mpSheet').hidden = false; $('#mpWait').hidden = false; $('#mpOk').hidden = true;
      setTimeout(() => {
        $('#mpWait').hidden = true; $('#mpOk').hidden = false; $('#mpOkTxt').textContent = 'Acreditado en Viva Fit House · ' + b.dataset.plan;
        setTimeout(() => { $('#mpSheet').hidden = true; altaSocio(b.dataset.plan); }, 1300);
      }, 1600);
    });
  });
  function altaSocio(plan){
    $('#altaPlan').textContent = plan + (plan.includes('3 veces') ? ' · tu sede' : ' · todas las sedes') + (planOffer ? ' · 20% en el primer mes' : '');
    // Forma de alguien que arranca: solo su primera visita (TAU 42 días, meta 4 por semana)
    const m = 3, f0 = Math.max(1, Math.round((1 / 42) / (m / 7) * 100)), zs = zonas();
    $('#altaF').textContent = f0;
    $('#altaTxt').textContent = 'Tu meta: ' + m + ' veces por semana' + (plan.includes('3 veces') ? ', la de tu plan' : ' (la cambiás cuando quieras)') + '. Si la cumplís, en unas ' + semHasta(zs[1][0]) + ' semanas pasás a ' + zs[1][1] + ' y en unas ' + semHasta(zs[2][0]) + ', a ' + zs[2][1] + '.';
    go('alta');
  }
  $('#altaGo').addEventListener('click', () => { const n = $('#nName').textContent; $('#inicio .title').textContent = 'Hola, ' + n; go('inicio'); toast('Bienvenido, ' + n + ' · la demo sigue con datos de una socia con historia'); });

  // DNI y deslinde: recién antes del primer ingreso
  let fichaCb = null;
  function requireFicha(cb){ if (fichaOk) return cb(); fichaCb = cb; $('#fichaSheet').hidden = false; }
  $('#fCancel').addEventListener('click', () => { $('#fichaSheet').hidden = true; fichaCb = null; });
  $('#fOk').addEventListener('click', () => {
    if ($('#fDni').value.replace(/\D/g, '').length < 7) { toast('Revisá tu DNI'); return; }
    if (!$('#fDes').checked) { toast('Aceptá el deslinde para entrar'); return; }
    fichaOk = true; $('#fichaSheet').hidden = true; const cb = fichaCb; fichaCb = null; toast('Listo, no te lo pedimos más'); if (cb) cb();
  });

