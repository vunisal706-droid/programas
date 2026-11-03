// Programas del cole · Saberes básicos por trimestre, informe trimestral (solo monitores), firma con el dedo,
// reuniones quincenales para monitores y tutores, e informes para la coordinación.
'use strict';

// ─── Saberes básicos de Lengua y Matemáticas por curso y trimestre (nivel medio-bajo, según la programación) ───
const SABERES = {
  3: {
    1: [['Lectura en voz alta con entonación y fluidez adecuadas', 'Comprensión literal de textos breves (quién, qué, dónde, cuándo)', 'Vocabulario de uso cotidiano y del aula', 'Escritura de oraciones con mayúscula y punto', 'Ortografía: mayúsculas; m antes de p y b', 'Expresión oral: contar experiencias propias con orden'],
        ['Números hasta el 999: lectura, escritura y descomposición (C, D, U)', 'Orden y comparación de números (<, >, =)', 'Sumas llevando', 'Restas llevando', 'Cálculo mental: sumar y restar decenas', 'Problemas de una operación (suma o resta)']],
    2: [['Comprensión de cuentos y textos informativos sencillos', 'Idea principal de un párrafo', 'Sinónimos y antónimos', 'El nombre y el adjetivo', 'Ortografía: ca, co, cu, que, qui; ga, go, gu, gue, gui', 'Escritura de descripciones breves de personas y animales'],
        ['Números hasta el 9.999', 'Tablas de multiplicar del 2 al 5', 'Multiplicación por una cifra', 'Problemas de multiplicar', 'Medida de longitud: metro y centímetro', 'El dinero: euros y céntimos']],
    3: [['Comprensión inferencial sencilla (por qué, qué pasará)', 'Lectura de textos instructivos (recetas, normas)', 'El verbo: presente, pasado y futuro', 'Ortografía: r/rr; za, zo, zu, ce, ci', 'Escritura de una narración breve (inicio, nudo y desenlace)', 'Exposición oral breve sobre un tema trabajado'],
        ['Tablas de multiplicar del 6 al 9', 'Iniciación a la división (repartos)', 'Problemas sencillos de dos operaciones', 'Medida del tiempo: el reloj y el calendario', 'Figuras planas: polígonos y circunferencia', 'Gráficos sencillos (pictogramas y barras)']]
  },
  4: {
    1: [['Lectura fluida respetando la puntuación', 'Comprensión literal e inferencial de textos narrativos', 'Vocabulario: familias de palabras y palabras compuestas', 'Ortografía: b/v y sílaba tónica', 'Escritura de textos narrativos breves', 'Expresión oral: narrar y describir con orden'],
        ['Números hasta 6 cifras: lectura, escritura y descomposición', 'Orden, comparación y redondeo', 'Suma y resta con números de varias cifras', 'Multiplicación por una y dos cifras', 'Cálculo mental: tablas, dobles y mitades', 'Problemas de una y dos operaciones']],
    2: [['Comprensión de textos informativos y expositivos', 'Resumen oral y escrito de un texto', 'Nombre, adjetivo, determinantes y pronombres personales', 'Ortografía: g/j, h; palabras agudas, llanas y esdrújulas', 'Escritura de descripciones y cartas', 'Uso del diccionario'],
        ['División por una cifra y su prueba', 'Fracciones: concepto, lectura y representación', 'Medida de longitud, masa y capacidad', 'Problemas de multiplicar y dividir', 'Cálculo mental: multiplicar y dividir por 10 y 100', 'Problemas de dos operaciones con esquema de pasos']],
    3: [['Comprensión de poemas y textos teatrales', 'Textos instructivos y publicitarios', 'El verbo: tiempos, personas y concordancia', 'Ortografía: ll/y; signos de interrogación y exclamación', 'Escritura con planificación y revisión', 'Exposición oral con apoyo de un guion'],
        ['Números decimales: décimas y céntimos de euro', 'Suma y resta de decimales sencillos (dinero)', 'Ángulos, rectas y polígonos', 'Perímetro de figuras', 'Tiempo: horas, minutos y segundos', 'Tablas y gráficos de barras']]
  },
  5: {
    1: [['Lectura fluida y expresiva; velocidad lectora', 'Comprensión literal, inferencial y crítica', 'Vocabulario: prefijos, sufijos, sinónimos y antónimos', 'Ortografía: acentuación de agudas, llanas y esdrújulas', 'Escritura de narraciones con estructura y conectores', 'Expresión oral: exposiciones breves y debates'],
        ['Números de hasta 9 cifras', 'Operaciones combinadas y uso del paréntesis', 'Multiplicación por varias cifras', 'División por una y dos cifras', 'Cálculo mental y estimación', 'Resolución de problemas con un esquema de pasos']],
    2: [['Textos expositivos y argumentativos sencillos', 'Esquemas y resúmenes', 'Clases de palabras: nombre, adjetivo, verbo y adverbio', 'Ortografía: diptongos e hiatos; b/v; g/j', 'Escritura de descripciones, noticias y cartas', 'Comprensión oral de textos de los medios'],
        ['Fracciones: equivalencia, comparación y fracción de una cantidad', 'Números decimales: lectura, orden y operaciones', 'Problemas con fracciones y decimales', 'Múltiplos y divisores', 'Medida: longitud, masa y capacidad', 'Porcentajes sencillos de la vida diaria']],
    3: [['El verbo: tiempos simples y compuestos', 'La oración: sujeto y predicado', 'Ortografía: h; ll/y; signos de puntuación', 'Textos literarios: poesía, cuento y teatro', 'Escritura con planificación, revisión y presentación', 'Búsqueda de información y uso del diccionario'],
        ['Ángulos y su medida', 'Polígonos, circunferencia y círculo', 'Perímetro y área de figuras sencillas', 'Medida del tiempo y del dinero', 'Estadística: tablas, gráficos y media', 'Probabilidad: seguro, posible e imposible']]
  },
  6: {
    1: [['Lectura fluida, expresiva y comprensiva; velocidad lectora', 'Idea principal e ideas secundarias de un texto', 'Vocabulario: polisemia, sinónimos y campos semánticos', 'Ortografía: reglas de acentuación y tilde diacrítica', 'Escritura de textos narrativos y descriptivos bien enlazados', 'Expresión oral: exposiciones y debates con argumentos'],
        ['Números naturales, potencias y raíz cuadrada', 'Operaciones combinadas con paréntesis', 'Múltiplos y divisores; m.c.m. y m.c.d. sencillos', 'Números enteros: positivos y negativos', 'Cálculo mental y estimación', 'Problemas de varias operaciones con esquema de pasos']],
    2: [['Textos argumentativos y de opinión', 'Resúmenes, esquemas y mapas conceptuales', 'Clases de palabras: análisis sencillo', 'La oración: sujeto, predicado y tipos de oraciones', 'Ortografía: b/v, g/j, h, x', 'Escritura de noticias, cartas formales y textos de opinión'],
        ['Fracciones: suma, resta y producto', 'Números decimales: las cuatro operaciones', 'Porcentajes y proporcionalidad', 'Problemas con fracciones, decimales y porcentajes', 'Sistema métrico decimal: unidades y cambios', 'Medida del tiempo y del dinero']],
    3: [['El verbo: modos, tiempos y verbos irregulares frecuentes', 'Textos literarios: recursos literarios sencillos', 'Ortografía: puntuación y palabras homófonas', 'Comprensión crítica de textos de los medios e internet', 'Escritura con planificación y revisión', 'Técnicas de estudio para el paso al instituto'],
        ['Ángulos, polígonos y cuerpos geométricos', 'Perímetro y área de figuras planas', 'Circunferencia y círculo: longitud', 'Volumen sencillo con cubitos', 'Estadística: media, moda y gráficos', 'Probabilidad en situaciones cotidianas']]
  }
};
const AREAS_XV = ['Lengua Castellana y Literatura', 'Matemáticas'];
function cursoNum(g) { const n = { Tercero: 3, Cuarto: 4, Quinto: 5, Sexto: 6 }; for (const k in n) if ((g.nombre || '').startsWith(k)) return n[k]; const m = String(Object.values(g.alumnos || {})[0] && Object.values(g.alumnos)[0].curso || '').match(/[3-6]/); return m ? +m[0] : 3; }
function saberes(g, tri) { return (SABERES[cursoNum(g)] || SABERES[3])[tri] || [[], []]; }
// El Anexo XV toma los saberes básicos del trimestre automáticamente
function contXV(gid, tri) { const S = saberes(D.grupos[gid] || {}, tri); return { a1: AREAS_XV[0], a2: AREAS_XV[1], c1: S[0].join('\n'), c2: S[1].join('\n') }; }
// Temporalización por trimestres para la programación (PDF)
function tempoProg(g) {
  return '<p class="b">TEMPORALIZACIÓN DE LOS SABERES BÁSICOS POR TRIMESTRES (' + cursoNum(g) + '.º DE PRIMARIA)</p><table><tr><th style="width:14%">Trimestre</th><th style="text-align:left">' + AREAS_XV[0] + '</th><th style="text-align:left">' + AREAS_XV[1] + '</th></tr>' +
    [1, 2, 3].map(t => { const S = saberes(g, t); return '<tr><td class="c b">' + t + '.º</td>' + S.map(l => '<td><ul style="margin:2px 0 2px 16px">' + l.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></td>').join('') + '</tr>'; }).join('') + '</table>';
}

// ─── Firma del monitor/a (se guarda en el grupo para que salga en todos sus documentos) ───
function firmaGrupo(gid) { const f = (((D.informes || {})[gid] || {})._firma) || ''; return f || (esMonitor() ? (localStorage.getItem('programas-firma-mia') || '') : ''); }
function rFirmaMon() {
  const f = firmaGrupo(grupoSel);
  return '<div class="card"><div class="card-h"><h2>✍️ Mi firma</h2></div><p class="small muted">Fírmala una vez con el dedo. Sale sola en tus hojas del mes, el informe trimestral y la programación.</p>' +
    (f ? '<img src="' + f + '" alt="Tu firma" style="height:60px;border:1px solid var(--border);border-radius:10px;background:#fff;padding:4px"><br>' : '') +
    '<button class="btn' + (f ? ' sec' : '') + ' peq" data-acc="firmaMon">' + (f ? 'Cambiar mi firma' : 'Firmar ahora') + '</button></div>';
}
function dlgFirma() {
  $('dlgIn').innerHTML = '<h2>✍️ Tu firma</h2><p class="small muted">Firma con el dedo (o con el ratón).</p><canvas id="fCv" width="560" height="170" style="width:100%;height:170px;border:1px dashed var(--border);border-radius:10px;background:#fff;touch-action:none"></canvas>' +
    '<div class="pie"><button class="btn sec" id="fBorrar">Borrar</button><button class="btn sec" id="fC">Cancelar</button><button class="btn" id="fOk">Guardar firma</button></div>';
  $('dlg').showModal();
  const cv = $('fCv'), cx = cv.getContext('2d'); cx.lineWidth = 2.4; cx.lineCap = 'round'; cx.strokeStyle = '#1a237e'; let p = false, hay = false;
  const pos = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * cv.width / b.width, (e.clientY - b.top) * cv.height / b.height]; };
  cv.onpointerdown = e => { p = true; hay = true; cv.setPointerCapture(e.pointerId); const [x, y] = pos(e); cx.beginPath(); cx.moveTo(x, y); };
  cv.onpointermove = e => { if (!p) return; const [x, y] = pos(e); cx.lineTo(x, y); cx.stroke(); };
  cv.onpointerup = () => p = false;
  $('fBorrar').onclick = () => { cx.clearRect(0, 0, cv.width, cv.height); hay = false; };
  $('fC').onclick = () => $('dlg').close();
  $('fOk').onclick = () => {
    if (!hay) return toast('Firma primero en el recuadro', 'err');
    const url = cv.toDataURL('image/png');
    try { localStorage.setItem('programas-firma-mia', url); } catch (e) { }
    Object.entries(D.grupos || {}).filter(([, g]) => g.monitor === PERFIL).forEach(([gid]) => guardar('informes/' + gid + '/_firma', url));
    $('dlg').close(); toast('Firma guardada'); render();
  };
}

// ─── Informe trimestral (Anexo XV): solo monitores. Saberes básicos ya puestos según el trimestre ───
function rInformeXV(A, tri) {
  const g = D.grupos[grupoSel], S = saberes(g, tri);
  const chip = (t, attr) => '<button type="button" class="chip" ' + attr + ' style="padding:3px 9px;margin:2px;font-size:.8rem">' + esc(t) + '</button>';
  let h = '<div class="card"><div class="card-h"><h2>📝 Informe trimestral (Anexo XV)</h2><select id="triInf" style="width:auto">' + [1, 2, 3].map(t => '<option value="' + t + '"' + (t === tri ? ' selected' : '') + '>' + t + '.º trimestre</option>').join('') + '</select></div>' +
    '<p class="small muted">Elige el trimestre. Los <b>saberes básicos</b> ya vienen puestos. En cada alumno/a, toca cómo va en cada uno y pulsa las frases que encajen (puedes cambiarlas). Al final, descarga el Anexo XV con tu firma.</p>';
  if (!A.length) return h + '<p class="muted">El grupo no tiene alumnado.</p></div>';
  h += A.map(([aid, a]) => {
    const inf = ((((D.informes || {})[grupoSel] || {})[aid] || {})['t' + tri]) || {}, marc = Object.keys(inf.e || {}).length, total = S[0].length + S[1].length, hechas = PREG_XV.filter((_, i) => inf['q' + (i + 1)]).length;
    const ok = marc >= total && hechas === 5;
    return '<details style="margin:10px 0"><summary>' + esc(a.siglas) + ' <span class="muted small">' + esc(a.curso || '') + ' · ' + (ok ? '✔ completo' : 'saberes ' + marc + '/' + total + ' · preguntas ' + hechas + '/5') + '</span></summary>' +
      (tri > 1 ? '<button type="button" class="btn sec peq" data-xvcopia="' + aid + '" style="margin-top:6px">📋 Copiar respuestas del trimestre anterior</button>' : '') +
      [1, 2].map(k => '<p class="small" style="margin-top:10px"><b>' + esc(AREAS_XV[k - 1]) + '</b></p>' + S[k - 1].map((c, i) => { const v = (inf.e || {})[k + '_' + i] || ''; return '<div style="display:flex;gap:6px;align-items:center;justify-content:space-between;border-bottom:1px solid #edf1f7;padding:4px 0;flex-wrap:wrap"><span>' + esc(c) + '</span><span>' + [['C', 'Conseguido'], ['EP', 'En proceso'], ['SI', 'Sin iniciar']].map(([kk, t]) => '<button type="button" class="chip' + (v === kk ? ' on' : '') + '" data-xvest="' + aid + '|' + k + '_' + i + '|' + kk + '" style="padding:3px 8px;margin:1px;font-size:.78rem">' + t + '</button>').join('') + '</span></div>'; }).join('')).join('') +
      PREG_XV.map((q, i) => { const key = 'q' + (i + 1); return '<label>' + esc(q.charAt(0) + q.slice(1).toLowerCase()) + '</label><div>' + RESP_SUG[key].map(s => chip(s, 'data-xvfrase="' + aid + '|' + key + '"')).join('') + '</div><textarea rows="2" data-inf="' + aid + '" data-k="' + key + '">' + esc(inf[key] || '') + '</textarea>'; }).join('') +
      '<label>Propuestas de mejora</label><div>' + RESP_SUG.mejora.map(s => chip('＋ ' + s, 'data-xvfrase="' + aid + '|mejora|add"')).join('') + '</div><textarea rows="2" data-inf="' + aid + '" data-k="mejora">' + esc(inf.mejora || '') + '</textarea></details>';
  }).join('');
  return h + '<div class="pie" style="justify-content:flex-start"><button class="btn" data-acc="anexoXV">📄 Descargar Anexo XV del ' + tri + '.º trimestre</button></div></div>';
}
// Coordinación: ver cómo van y descargar los informes
function rInformesCoord(g) {
  const A = Object.keys(g.alumnos || {});
  return '<div class="card"><div class="card-h"><h2>📝 Informes trimestrales (Anexo XV)</h2></div><p class="small muted">Los rellena ' + esc(g.docente || 'el monitor/a') + '. Aquí ves cómo van y los descargas firmados para subirlos a Séneca (tipo «Informe de evaluación Nº trimestre.»).</p>' +
    '<div class="g3" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">' + [1, 2, 3].map(t => {
      const S = saberes(g, t), total = S[0].length + S[1].length, n = A.filter(aid => { const i = ((((D.informes || {})[grupoSel] || {})[aid] || {})['t' + t]) || {}; return Object.keys(i.e || {}).length >= total && PREG_XV.every((_, k) => i['q' + (k + 1)]); }).length;
      return '<div class="card" style="box-shadow:none;margin:0"><b>' + t + '.º trimestre</b><p class="small ' + (A.length && n === A.length ? '' : 'muted') + '">' + (A.length ? n + ' de ' + A.length + ' completos' : 'Sin alumnado') + '</p><button class="btn sec peq" data-xvdes="' + t + '"' + (A.length ? '' : ' disabled') + '>📄 Descargar</button></div>';
    }).join('') + '</div></div>';
}

// ─── Programación por trimestres para monitores y tutores ───
function rProgEquipo(g) {
  const tri = trimestreActual(), P = g.prog ? Object.assign(progPorDefecto(g), g.prog) : null;
  const lista = l => '<ul style="margin:4px 0 8px 20px">' + l.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
  return '<div class="card"><div class="card-h"><h2>📘 Programación</h2>' + (P ? '<button class="btn sec peq" data-acc="verProg">📄 Completa en PDF</button>' : '') + '</div>' +
    '<p class="small muted">Saberes básicos que se trabajan cada trimestre en ' + cursoNum(g) + '.º. Úsalos para preparar las sesiones.</p>' +
    [1, 2, 3].map(t => { const S = saberes(g, t); return '<details' + (t === tri ? ' open' : '') + '><summary>' + t + '.º trimestre' + (t === tri ? ' · ahora' : '') + '</summary><div class="g2"><div><b class="small">' + AREAS_XV[0] + '</b>' + lista(S[0]) + '</div><div><b class="small">' + AREAS_XV[1] + '</b>' + lista(S[1]) + '</div></div></details>'; }).join('') +
    (P && P.ind && Object.keys(P.ind).length ? '<details><summary>Objetivos de cada alumno/a</summary><ul style="margin:4px 0 8px 20px">' + Object.entries(P.ind).map(([aid, t]) => '<li><b>' + esc(((g.alumnos || {})[aid] || {}).siglas || '') + ':</b> ' + esc(t) + '</li>').join('') + '</ul></details>' : '') + '</div>';
}

// ─── Reuniones quincenales: todas las fechas; al tocar una se entra a escribir en la reunión ───
function rReunionesEquipo(g) {
  const yo = PERFILES[PERFIL] || {}, hoy = hoyIso(), rol = yo.mon && yo.tut ? 'Profesor del grupo y tutor' : yo.mon ? 'Persona acompañante' : 'Tutor/a';
  const RR = Object.entries(D.reuniones || {}).filter(([, r]) => r.grupo === grupoSel && r.tipo === 'quincenal' && r.fecha).sort((a, b) => a[1].fecha.localeCompare(b[1].fecha));
  const prox = RR.find(([, r]) => r.fecha >= hoy && !r.salaAport);
  const boton = ([id, r]) => {
    const d = new Date(r.fecha + 'T12:00'), txt = DSEM[d.getDay()].slice(0, 3) + ' ' + d.getDate() + ' ' + MESES[d.getMonth()].slice(0, 3), es = prox && prox[0] === id;
    if (r.salaAport) return '<button class="chip" data-acta="' + id + '" title="Ver el acta" style="opacity:.75">✔ ' + txt + '</button>';
    if (r.sala) return '<a class="chip' + (es ? ' on' : '') + '" style="text-decoration:none" target="_blank" rel="noopener" href="' + esc(urlSala(r.sala) + '&n=' + encodeURIComponent(yo.nombre) + '&r=' + encodeURIComponent(rol)) + '">🎥 ' + txt + '</a>';
    return '<span class="chip" style="opacity:.5">' + txt + '</span>';
  };
  return '<div class="card" style="border-left:5px solid var(--primary)"><div class="card-h"><h2>🤝 Reuniones quincenales</h2></div>' +
    (prox ? '<p>Próxima: <b>' + esc(fechaCorta(prox[1].fecha)) + (prox[1].hora ? ' · ' + esc(prox[1].hora) : '') + '</b></p>' : '') +
    '<p class="small muted">Toca una fecha para entrar y escribir en el orden del día lo que veas necesario. Lo que escribís pasa al acta; el chat no. Las marcadas con ✔ ya están cerradas (toca para ver el acta).</p>' +
    (RR.length ? '<div class="chips">' + RR.map(boton).join('') + '</div>' : '<p class="muted small">Todavía no hay reuniones previstas.</p>') + '</div>';
}

// ─── Coordinación: crea las salas de las quincenales y publica todas las reuniones (con enlace) ───
async function crearSala(id, r) {
  const P = puntosReunion(r); if (!P.length) return null;
  const g = r.grupo && D.grupos[r.grupo], sid = [...crypto.getRandomValues(new Uint8Array(16))].map(b => (b % 36).toString(36)).join('');
  const fl = new Date(r.fecha + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  await db.ref('programas_salas/' + sid).set({ titulo: (TIPOS[r.tipo] || '').replace(/^\S+\s/, '') + (g ? ' · ' + g.nombre : ''), cuando: fl + (r.hora ? ' · ' + r.hora : ''), puntos: P.map(p => p.t), hints: P.map(p => p.hint), abierta: true, creada: Date.now() });
  guardar('reuniones/' + id + '/sala', sid); r.sala = sid; return sid;
}
async function syncReuniones() {
  if (esMon()) return;
  for (const [k, r] of Object.entries(D.reuniones || {})) {
    if (!r || !r.fecha) continue;
    if (r.tipo === 'quincenal' && !r.sala) { try { await crearSala(k, r); } catch (e) { console.warn('sala', e); } }
    publicarCita(k, r);
  }
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-acc="firmaMon"],[data-xvdes]'); if (!t) return;
  if (t.dataset.acc === 'firmaMon') return dlgFirma();
  if (t.dataset.xvdes) docAnexoXV(grupoSel, +t.dataset.xvdes);
});
