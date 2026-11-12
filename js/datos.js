/* Vivapp · Datos simulados con la forma de EVO (biblioteca de ejercicios, rutinas activas).
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 040
  // ===== Biblioteca de ejercicios (ejemplo) =====
  const lib = {
    sentadilla:{ n:'Sentadilla goblet', grupo:'Cuádriceps y glúteos', mus:['cuads','gluteos'], sec:['abdomen'], tip:'Pecho arriba y rodillas en línea con la punta del pie.', sug:'Probá 16 kg: la última vez completaste todas las repeticiones.', sets:[['14 kg × 12','16','12'],['14 kg × 12','16','12'],['14 kg × 10','16','10']], anim:'squat', cues:['Bajá controlado, cadera atrás','Subí empujando el piso'] },
    puente:{ n:'Puente de glúteos', grupo:'Glúteos e isquiotibiales', mus:['gluteos'], sec:['isquios'], tip:'Apretá los glúteos arriba durante 1 segundo.', sug:'Sumá un disco de 10 kg sobre la cadera.', sets:[['Corporal × 15','10','15'],['Corporal × 15','10','15'],['Corporal × 15','10','12']], anim:'bridge', cues:['Subí la cadera','Bajá sin apoyar del todo'] },
    plancha:{ n:'Plancha frontal', grupo:'Abdomen y core', mus:['abdomen'], sec:['hombros'], tip:'Cuerpo en línea recta, sin levantar la cadera.', sug:'Sumá 5 segundos por serie respecto a la última vez.', sets:[['35 s','—','40 s'],['35 s','—','40 s'],['30 s','—','35 s']], anim:'plank', cues:['Sostené y respirá','Abdomen firme'] },
    remo:{ n:'Remo sentado', grupo:'Dorsales y espalda alta', mus:['dorsales','trapecio'], sec:['biceps'], tip:'Espalda neutra, llevá el agarre hacia el ombligo.', sug:'Probá 42,5 kg: la última vez completaste todas las repeticiones.', sets:[['40 kg × 10','40','10'],['40 kg × 10','42,5','10'],['40 kg × 9','42,5','9'],['40 kg × 8','42,5','8']], anim:'row', cues:['Tirá hacia el ombligo','Estirá los brazos controlado'] },
    jalon:{ n:'Jalón al pecho', grupo:'Dorsales', mus:['dorsales'], sec:['biceps','trapecio'], tip:'Bajá la barra a la clavícula, sin balancearte.', sug:'Mantené 45 kg y buscá llegar a 12 repeticiones.', sets:[['45 kg × 10','45','12'],['45 kg × 10','45','12'],['45 kg × 9','45','10']], anim:'pulldown', cues:['Bajá la barra al pecho','Subí controlado'] },
    curl:{ n:'Curl martillo', grupo:'Bíceps y antebrazo', mus:['biceps'], sec:['antebrazo'], tip:'Codos pegados al cuerpo, sin balanceo.', sug:'Subí a 12 kg por mancuerna en la primera serie.', sets:[['10 kg × 12','12','10'],['10 kg × 12','10','12'],['10 kg × 10','10','12']], anim:'curl', cues:['Subí sin mover el codo','Bajá lento'] },
    pecho:{ n:'Press de pecho en máquina', grupo:'Pecho y tríceps', mus:['pecho'], sec:['triceps','hombros'], tip:'Escápulas atrás y abajo; empujá sin despegar la espalda del respaldo.', sug:'Mantené 30 kg y buscá las 12 repeticiones en las tres series.', sets:[['30 kg × 12','30','12'],['30 kg × 12','30','12'],['30 kg × 11','30','12']], anim:'press', cues:['Empujá hasta casi estirar','Volvé despacio'] },
    press:{ n:'Press de hombros', grupo:'Hombros y tríceps', mus:['hombros'], sec:['triceps'], tip:'Abdomen firme, sin arquear la espalda.', sug:'Probá 10 kg por mancuerna.', sets:[['8 kg × 12','10','10'],['8 kg × 12','10','10'],['8 kg × 10','8','12']], anim:'press', cues:['Empujá hacia arriba','Bajá a la altura de las orejas'] }
  };
  const musName = { hombros:'Hombros', pecho:'Pecho', biceps:'Bíceps', antebrazo:'Antebrazo', abdomen:'Abdomen', cuads:'Cuádriceps', trapecio:'Espalda alta', dorsales:'Dorsales', triceps:'Tríceps', gluteos:'Glúteos', isquios:'Isquiotibiales' };

  // ===== Rutinas activas (ejemplo) =====
  const rutinas = {
    profe:{ tipo:'profe', nombre:'Hipertrofia · 4 días', by:'Prof. Lucas Pérez', sub:'Semana 3 de 8 · vence el 15/11', next:1,
      dias:[ {k:'A', n:'Pierna y glúteos', ex:['sentadilla','puente','plancha'], lbl:'Lun'}, {k:'B', n:'Espalda, pecho y bíceps', ex:['remo','jalon','pecho','curl'], lbl:'Mar'}, {k:'C', n:'Hombros y core', ex:['press','plancha','curl'], lbl:'Jue'}, {k:'D', n:'Full body', ex:['sentadilla','press','remo'], lbl:'Vie'} ] },
    ia:{ tipo:'ia', nombre:'Core y movilidad · 2 días', by:'Generada con IA', sub:'Creada el 12/10 · 3 ejercicios por día', next:0,
      dias:[ {k:'A', n:'Core', ex:['plancha','puente','sentadilla'], lbl:'Mié'}, {k:'B', n:'Movilidad y fuerza', ex:['puente','press','plancha'], lbl:'Sáb'} ] }
  };
  let actual = 'profe';

  // ===== T15 · Modelo de rutina con variantes (lo escribe el profe; en producción, la app del profe / Viva Gestión, E6) =====
  // Por día y ejercicio. grp + gt (super · tri · gigante · circuito) + vueltas: agrupación, descanso solo al terminar el grupo (descG).
  // esq (const · asc · desc · drop · restpause · cluster) + kgs por serie (+ drop: cargas de bajada sin descanso).
  // obj (reps · rango · amrap · rir · tiempo · dist · escalera) + rango / rir / seg. amrapUlt: solo la última serie.
  // desc (s por serie) · tempo · ctl · nota · prog (progresión semanal) · fallo (nunca para menores ni Arranco: exArr).
  const VARIANTES = {
    A:{ sentadilla:{ grp:'s1', gt:'super', desc:0, descG:90, obj:'rango', rango:[10, 12], nota:'Con el puente, seguido: sin descanso entre los dos.' },
        puente:{ grp:'s1', gt:'super', desc:0, descG:90, prog:'Cuando hagas 15 en las tres, sumá 5 kg de disco.' },
        plancha:{ obj:'tiempo', seg:true, desc:60, ctl:'Sostené sin que caiga la cadera; respirá.' } },
    B:{ remo:{ esq:'asc', kgs:[40, 42.5, 45], repsS:[12, 10, 8], nota:'Pirámide: cada serie más peso y menos repeticiones.' },
        jalon:{ obj:'rango', rango:[8, 10], prog:'Cuando hagas 10 en las tres, +2,5 kg.' },
        curl:{ esq:'drop', drop:[15, 10], desc:60, nota:'La última es drop: bajá a 15 y a 10 sin descansar.', fallo:true } },
    C:{ press:{ obj:'amrap', amrapUlt:true, nota:'La última, las que salgan con buena técnica.', fallo:true },
        plancha:{ obj:'tiempo', seg:true, desc:45 },
        curl:{ obj:'rir', rir:2, nota:'Pará cuando te queden 2 repeticiones en el tanque.' } },
    D:{ sentadilla:{ grp:'c1', gt:'circuito', vueltas:3, desc:0, descG:120 },
        press:{ grp:'c1', gt:'circuito', vueltas:3, desc:0, descG:120 },
        remo:{ grp:'c1', gt:'circuito', vueltas:3, desc:0, descG:120, nota:'Circuito: los tres seguidos y 2 minutos al terminar la vuelta.' } }
  };
  var CARDIO_DEMO = { min:12, int:'habla' };  // int: 'habla' (prueba del habla) o { vel:5.5, inc:6 }
  var GT_N = { super:'Superserie', tri:'Triserie', gigante:'Serie gigante', circuito:'Circuito' };
  var ESQ_N = { asc:'Pirámide', desc:'Pirámide invertida', drop:'Drop set', restpause:'Rest-pause', cluster:'Cluster' };
  function varTxt(f){ if (!f) return ''; return f.gt ? GT_N[f.gt] : f.esq && ESQ_N[f.esq] ? ESQ_N[f.esq] : f.obj === 'amrap' ? 'Las que salgan' : f.obj === 'tiempo' ? 'Por tiempo' : f.obj === 'rango' ? 'Rango ' + f.rango.join('–') : f.obj === 'rir' ? 'RIR ' + f.rir : f.obj === 'escalera' ? 'Escalera' : f.obj === 'dist' ? 'Por distancia' : ''; }

  function renderRoutines(){
    const order = [actual].concat(Object.keys(rutinas).filter(k => k !== actual && k !== 'ppu' && k !== 'lead' && rutinas[k]));
    if (typeof renderCambios === 'function') renderCambios();
    $('#rutList').innerHTML = order.map(rid => {
      const r = rutinas[rid], cur = rid === actual;
      const head = r.tipo === 'profe'
        ? '<span class="avatar">LP</span><span class="stack" style="gap:0;flex:1"><span class="small muted">Asignada por</span><span style="font-size:14px;font-weight:700">' + r.by + '</span></span>'
        : '<span class="pill ia"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>GENERADA CON IA</span><span class="spacer"></span>';
      const days = r.dias.map((d, i) => {
        const st = i < r.next ? 'done' : i === r.next ? (cur ? 'today' : 'nextd') : '';
        const lab = i < r.next ? 'Hecho' : i === r.next ? (cur ? 'Hoy' : 'Sigue') : d.lbl;
        return '<button class="day ' + st + (RUT_VER === rid + ':' + i ? ' sel' : '') + '" data-ver="' + rid + ':' + i + '" aria-expanded="' + (RUT_VER === rid + ':' + i) + '" aria-label="Día ' + d.k + ', ' + d.n + '"><b>' + d.k + '</b><span>' + lab + '</span></button>';
      }).join('');
      return '<div class="card rut' + (cur ? ' cur' : '') + '">' +
        '<div style="display:flex;align-items:center;gap:10px">' + head + (cur ? '<span class="pill">EN CURSO</span>' : '<span class="pill gris">ACTIVA</span>') + '</div>' +
        '<div class="stack" style="gap:4px"><span class="h2">' + r.nombre + '</span><span class="small muted">' + r.sub + '</span></div>' +
        '<div class="days" style="grid-template-columns:repeat(' + r.dias.length + ',minmax(0,1fr))">' + days + '</div>' +
        (RUT_VER && RUT_VER.split(':')[0] === rid ? rutDetalle(rid, +RUT_VER.split(':')[1]) : '') +
        (r.tipo === 'ia' ? '<div class="note muted"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>' + (r.valida === false ? 'Sin validar: Lucas la está revisando. La usás cuando la valide.' : 'Generada con IA y validada por tu profe') + '</div>' : '') +
        (cur || r.valida === false ? '' : '<button class="btn ghost sm" data-use="' + rid + '">Seguir esta rutina</button>') +
        '</div>';
    }).join('');
  }
  $('#rutList').addEventListener('click', e => {
    const u = e.target.closest('[data-use]');
    if (u) { actual = u.dataset.use; renderRoutines(); renderToday(); toast('Ahora seguís: ' + rutinas[actual].nombre); return; }
    if (rutClick(e)) return;
    const s = e.target.closest('[data-start]');
    if (s) { const [rid, i] = s.dataset.start.split(':'); startDay(rid, +i); }
  });

  function renderToday(){
    const r = rutinas[actual], mm = typeof MOM === 'undefined' ? 'antes' : MOM, prox = (mm === 'despues' && !sesHecha) || mm === 'descanso';
    const d = r.dias[mm === 'despues' && !sesHecha ? (r.next + 1) % r.dias.length : r.next];
    $('#todayLbl').innerHTML = '<span class="sig">' + firma(mm === 'sesion' ? 'Tu sesión' : prox || mm === 'despues' ? 'Tu próxima rutina' : 'Tu rutina hoy') + '</span>';
    $('#todayCambiar').hidden = true; // v57 · Cambiar vive en Hoy y Rutinas
    $('#todayBy').textContent = r.tipo === 'profe' ? 'Prof. Lucas' : 'Generada con IA';
    $('#todayLetter').textContent = d.k; $('#todayName').textContent = d.n;
    // La sesión en tres partes (simulada: la prescribe el profe en EVO; activación y cardio según el objetivo)
    const nEx = d.ex.length, P = [['Activación', 8, "8'"], ['Fuerza', nEx * 8, nEx + ' ejercicios'], ['Cardio', 12, "12'"]], tot = P.reduce((a, x) => a + x[1], 0);
    $('#todayMeta').textContent = (r.tipo === 'profe' ? 'Prof. Lucas' : 'Generada con IA') + ' · ' + tot + ' min';
    let prog = [0, 0, 0];
    if (mm === 'sesion') try { if (SALA) prog = salaProg(); else prog = [1, 1 / 3, 0]; } catch (_) {}
    const col = 'var(--lime)'; // cian = acción: lo que vas a hacer hoy
    $('#todayPlan').style.setProperty('--pc', col);
    $('#todayPlan').innerHTML = P.map((x, i) => '<span class="tdp" style="flex:' + x[1] + '"><span class="bar tdb' + (mm === 'sesion' ? ' live' : '') + '"><i style="width:' + Math.round(prog[i] * 100) + '%"></i></span><span class="tdl"><b>' + x[0] + '</b> ' + x[2] + '</span></span>').join('');
    $('#todayPlan').setAttribute('aria-label', 'Tu sesión: ' + P.map(x => x[0] + ' ' + x[2]).join(', ') + '.');
    $('#todayTags').innerHTML = d.ex.map(k => '<span class="tag">' + lib[k].n + '</span>').join('');
    // v57 · rutina en una línea + Empezar (entrenar-propuesta § 11.6); Empezar lleva a Hoy (§ 11.8)
    let nL = nEx, mL = tot; try { if (!prox && mm !== 'despues' && typeof salaPlan === 'function') { const SP = salaPlan(); nL = SP.fue.length; mL = planMin(SP); } } catch (_) {}
    let SPd = null; try { if (!prox && mm !== 'despues' && typeof salaPlan === 'function') SPd = salaPlan(); } catch (_) {}
    const fila = (a, b) => '<div><span>' + a + '</span><span>' + b + '</span></div>';
    let det = '';
    if (SPd) {
      det = '<div class="tdsec">Activación</div>' + fila(SPd.act.items.length + ' movimientos', SPd.act.min + "'")
        + '<div class="tdsec">Fuerza</div>' + SPd.fue.map(f => fila(f.n, f.sr + ' × ' + f.rep + (f.kg > 0 ? ' · ' + String(f.kg).replace('.', ',') + ' kg' : ''))).join('')
        + '<div class="tdsec">Cardio</div>' + fila(SPd.car.maq + (SPd.car.txt ? ' · ' + SPd.car.txt : ''), SPd.car.min + "'");
    } else det = d.ex.map(k => fila(lib[k].n, lib[k].sets.length + ' series')).join('');
    $('#todayLine').innerHTML = '<b>Día ' + d.k + ' · ' + d.n.toLowerCase() + '</b><span>' + (r.tipo === 'profe' ? 'Prof. Lucas' : 'Generada con IA') + ' · ' + nL + ' ejercicios · ~' + mL + ' min</span><div class="tdex">' + det + '</div>';
    $('#iniAcc').hidden = true;  // T-R v85 · Empezar vive abajo, a todo el ancho
  }
  $('#startToday').addEventListener('click', () => startDay(actual, rutinas[actual].next));
  $('#iniEmpezar').addEventListener('click', () => go('hoy'));
