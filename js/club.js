/* Vivapp · Club y plan: deuda, comercios, banners, categorías, pausa, plan en Inicio y Tus premios.
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 090
  // Plan: ejemplo con deuda (también pausa el club)
  let deuda = false;
  // T16 · Franja de deuda (T16-instrumentos § 0.5): único rojo de la app. Fuente: estado de deuda del socio en EVO
  // (GET v1/receivables/debtors; cuota con estado 4 = atrasada; sin probar contra la API real). Nunca en la sesión ni en Tu plan.
  var DEUDA_SCR = ['inicio','hoy','rutinas','progreso','muralScr','beneficios','social','socialB','socialC','socialD','socialE','socialF','people','semana','forma','fit','evolucion','matches','chat','ia'];
  function deudaFranja(){ const b = $('#deudaBar'); if (b) b.hidden = !(deuda && DEUDA_SCR.includes(curScr)); }
  $('#deudaToggle').addEventListener('click', () => {
    deuda = !deuda;
    $('#deudaBox').hidden = !deuda;
    const p = $('#estadoPill'); p.textContent = deuda ? 'CON SALDO' : 'AL DÍA'; p.className = 'pill' + (deuda ? ' bad' : '');
    $('#deudaToggle').textContent = deuda ? 'Ver ejemplo al día' : 'Ver ejemplo con saldo pendiente'; deudaFranja();
    renderClub(); renderAvisoPlan();
  });

  // T3 · Club VIVA (v117): lo que trae a la sala (premio para retirar, invitar) y una puerta al catálogo, que vive en Bonda (clubvivafithouse.com).
  // Fuentes: premios, base propia (semanas cumplidas confirmadas) → recepción en Viva Gestión. Acceso: débito automático o plan de 6 o 12 meses
  // (EVO, membermembership; el medio de pago, sin verificar en la API). Catálogo, canjes y ahorro: Bonda, afuera (no verificado que informe por socio).
  var DEBITO = true;
  $('#clubInvitar').addEventListener('click', () => {
    const txt = 'Te invito a entrenar gratis un día conmigo en Viva Fit House. Bajate la app y usá mi código VIVA-MART.';
    try { if (navigator.share) navigator.share({ text:txt }).catch(() => {}); else toast('Se abre WhatsApp con tu invitación'); } catch(_) { toast('Se abre WhatsApp con tu invitación'); }
  });
  $('#clubAbrir').addEventListener('click', () => toast('Se abre clubvivafithouse.com (Bonda)'));
  $('#debAdherir').addEventListener('click', () => { DEBITO = true; renderClub(); toast('Débito adherido: ya entrás al Club VIVA'); });
  function renderClub(){
    renderPremios();
    $('#clubPausa').hidden = !deuda;
    $('#clubPuerta').hidden = deuda || !DEBITO;
    $('#clubSinDeb').hidden = deuda || DEBITO;
    $('#debNote').hidden = !DEBITO; $('#debNo').hidden = DEBITO;
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
  // T3 · Tus datos y permisos: en real, cada consentimiento con su fecha en la base propia; apagar salud borra lo guardado (Ley 25.326)
  $$('#permisos .sw').forEach(sw => sw.addEventListener('change', () => toast(sw.checked ? sw.dataset.on : sw.dataset.off)));
  $('#datosCopia').addEventListener('click', () => toast('Te mandamos una copia de tus datos por mail'));
  $('#pausaSheet').addEventListener('click', e => { if (e.target.id === 'pausaSheet') { $('#pausaSheet').hidden = true; return; } updPs(); });
  $('#psCancel').addEventListener('click', () => $('#pausaSheet').hidden = true);
  $('#psOk').addEventListener('click', () => {
    const n = psDias(), desde = new Date(+ahora() + 864e5);
    pausa = { n, mot:val('pmot'), desde, hasta:new Date(desde.getTime() + (n - 1) * 864e5) };
    $('#pausaSheet').hidden = true; renderPlan(); toast('Plan pausado por ' + n + ' días');
  });

//#bloque 270
  // ----- Tus premios (Club): solo por semanas cumplidas; se retiran en recepción. Club muestra solo lo que está para retirar (T3) -----
  function renderPremios(){
    if (!MUR) return;
    const n = MUR.sem, P = [[12, 'Pin VIVA + InBody de control', 'rayo'], [24, 'Remera VIVA + InBody de control', 'corazon'], [36, 'InBody de control', 'mancuerna'], [48, 'InBody de control + premio VIVA', 'estrella']].filter(x => n >= x[0]);
    const u = P[P.length - 1];
    $('#premList').innerHTML = u ? '<div class="prem"><span class="pi"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[u[2]] + '</svg></span><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + u[1] + '</span><span class="small muted" style="line-height:1.4">Por tus ' + u[0] + ' semanas cumplidas · en recepción de cualquier sede</span></span></div>' : '';
    $('#clubRetirar').hidden = !u;
    PREM_N = u ? 1 : 0; avisosLater();
    $('#promoTxt').innerHTML = u ? 'Club VIVA: tenés un premio para retirar en recepción' : 'Club VIVA: descuentos en más de 1.000 comercios';
  }

