// Programas del cole · Asistencia desde el PDF del monitor, hojas para imprimir y documentos del PROA Andalucía
'use strict';
const DSEM = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const diasTxt = g => (g.dias || []).map(d => DSEM[d]).join(' y ') || g.horario || '';
// Calendario escolar (días sin cole) de la Agenda
let calCole = null;
function cargarCalCole() {
  if (calCole) return; calCole = 'cargando';
  const s = document.createElement('script'); s.src = '/agenda/calendario.js';
  s.onload = () => { calCole = window.CalendarioCole || null; const p = calCole && calCole.listo; if (p && p.then) p.then(() => render()); else render(); };
  s.onerror = () => { calCole = null; };
  document.head.appendChild(s);
}
const sinCole = f => { try { const x = calCole && calCole.sinCole && calCole.sinCole(f); return x && x.tipo !== 'finde' ? x : null; } catch (e) { return null; } };
// Días previstos de sesión de un grupo en un mes (sus días de la semana, dentro del programa, sin días sin cole)
function diasPrevistos(g, mes) {
  cargarCalCole();
  const y = +mes.slice(0, 4), m = +mes.slice(5), n = new Date(y, m, 0).getDate(), rg = rangoProg(), out = [];
  const ini = g.inicio || (startY(CURSO) + '-10-26');
  for (let d = 1; d <= n; d++) {
    const f = mes + '-' + pad(d), w = new Date(f + 'T12:00').getDay();
    if ((g.dias || []).includes(w) && f >= ini && f <= rg.fin && !sinCole(f)) out.push(f);
  }
  return out;
}

// ─── Monitores: hojas para imprimir ───
function rHojasMon(g, A, selMes) {
  const prev = diasPrevistos(g, mesResumen);
  return '<div class="card"><div class="card-h"><h2>🖨️ Hojas del mes para imprimir</h2>' + selMes + '</div>' +
    '<p class="small">Días previstos de ' + esc(MESES[+mesResumen.slice(5) - 1]) + ' (' + esc(diasTxt(g)) + '): <b>' + (prev.map(f => +f.slice(8)).join(', ') || '—') + '</b></p>' +
    '<div class="pie" style="justify-content:flex-start"><button class="btn" data-acc="xPrev">📄 Anexo X (asistencia) con las fechas previstas</button> <button class="btn sec" data-acc="xBlanco">📄 Anexo X en blanco</button> <button class="btn sec" data-acc="xiiBlanco">📄 Anexo XII (ausencias)</button> <button class="btn sec" data-acc="xiiiBlanco">📄 Anexo XIII (justificante de faltas)</button></div>' +
    '<p class="small muted">Si una sesión prevista no se da (festivo, falta…), táchala y anótalo en «Observaciones». No se recuperan sesiones. Entrega las hojas firmadas a dirección a final de mes.</p></div>';
}
function docAnexoXHoja(gid, mes, conFechas) {
  const g = D.grupos[gid], mesTxt = MESES[+mes.slice(5) - 1].toUpperCase() + ' ' + mes.slice(0, 4);
  const F = conFechas ? diasPrevistos(g, mes) : [], n = Math.max(14, F.length), filas = [];
  for (let i = 0; i < n; i++) filas.push('<tr><td>' + ORD(i + 1) + '</td><td class="c">' + (F[i] ? fechaAnexo(F[i]) : '') + '</td><td class="c">' + (F[i] ? esc((g.hi || '16:00') + ' - ' + (g.hf || '18:00')) : '') + '</td><td></td><td></td></tr>');
  abrirAnexo(g.nombre + ' - Hoja de asistencia de empleado (' + (DOC_MES[mes.slice(5)] || mesTxt) + ')', ['<h1>ANEXO X. MODELO PARA EL REGISTRO DE LA ASISTENCIA DEL PROFESORADO, MENTORES Y MENTORAS A LAS SESIONES DE ACOMPAÑAMIENTO ESCOLAR Y ACOMPAÑAMIENTO LINGÜÍSTICO PARA ALUMNADO INMIGRANTE.</h1>' +
    cabeceraGrupo(g, mesTxt, false) +
    '<table class="alto"><colgroup><col style="width:9%"><col style="width:14%"><col style="width:19%"><col style="width:29%"><col style="width:29%"></colgroup><tr><th>Sesión</th><th>Fecha</th><th>Horario</th><th>Firma del mentor/a o profesor/a</th><th>Observaciones (indicar cualquier incidencia)</th></tr>' + filas.join('') + '</table>' +
    '<p class="nota">* Este documento debe ser cumplimentado de forma independiente por grupo y mes de servicio.</p>' + lugarFecha() + firmaDir(true)]);
}
function docAnexoXIIHoja(gid, mes) {
  const g = D.grupos[gid], mesTxt = MESES[+mes.slice(5) - 1].toUpperCase() + ' ' + mes.slice(0, 4), F = diasPrevistos(g, mes), n = Math.max(14, F.length), filas = [];
  for (let i = 0; i < n; i++) filas.push('<tr><td>' + ORD(i + 1) + '</td><td class="c">' + (F[i] ? fechaAnexo(F[i]) : '') + '</td><td></td><td></td></tr>');
  abrirAnexo(g.nombre + ' - Anexo XII ausencias ' + mesTxt, ['<h1>ANEXO XII. MODELO PARA EL REGISTRO DE AUSENCIAS DEL ALUMNADO EN EL DESARROLLO DE LOS PROGRAMAS DE ACOMPAÑAMIENTO IMPARTIDOS EN EL CENTRO DOCENTE.</h1>' +
    cabeceraGrupo(g, mesTxt, true) +
    '<table class="muyalto"><colgroup><col style="width:9%"><col style="width:15%"><col style="width:48%"><col style="width:28%"></colgroup><tr><th>Sesión</th><th>Fecha</th><th>Alumnado ausente<br>(nombre y apellidos)</th><th>Firma del mentor/a o profesor/a</th></tr>' + filas.join('') + '</table>' +
    '<p class="nota">*Entregar a la persona responsable de la coordinación de PROA Andalucía en el centro con carácter mensual.</p>' + lugarFecha() + firmaDir(false)]);
}
function docAnexoXIII() {
  const una = '<h1>ANEXO XIII. MODELO PARA LA JUSTIFICACIÓN DE FALTAS DE ASISTENCIA DEL ALUMNADO A LOS PROGRAMAS DE ACOMPAÑAMIENTO IMPARTIDOS EN EL CENTRO DOCENTE.</h1>' +
    '<p class="c b" style="margin:18px 0">JUSTIFICACIÓN DE FALTAS DE ASISTENCIA</p>' +
    '<p style="line-height:2;text-align:justify">D./Dª ________________________________________________________, con DNI __________________, como padre, madre o tutor/a legal del alumno/a ____________________________________________ matriculado en el curso y grupo _______________, notifica que su hijo/hija, no ha asistido a la sesión de Acompañamiento que tuvo lugar el día ______ de ________________ de 20_____, por el siguiente motivo:</p>' +
    '<table style="width:70%"><tr><td style="width:36px"></td><td>ASISTENCIA A CITA MÉDICA</td></tr><tr><td></td><td>ENFERMEDAD</td></tr><tr><td></td><td>OTRO MOTIVO (INDIQUE CUÁL)<br><br></td></tr></table>' +
    '<p class="lugar" style="margin-top:30px">En _________________________, a _________ de __________________ de 20____</p><p class="firma" style="margin-top:40px">Fdo: _________________________</p>';
  abrirAnexo('Anexo XIII justificacion de faltas', [una]);
}

// ─── Coordinación: asistencia del mes a partir del PDF del monitor ───
const BORR = {};   // borradores por grupo|mes (no se guardan hasta pulsar Guardar)
function borrador(g, gid, mes) {
  const k = gid + '|' + mes; if (BORR[k]) return BORR[k];
  const S = (D.sesiones || {})[gid] || {}, fechas = new Set(diasPrevistos(g, mes));
  Object.keys(S).filter(f => f.startsWith(mes)).forEach(f => fechas.add(f));
  const filas = [...fechas].sort().map(f => { const s = S[f] || {}; return { f, imp: !!s.impartida, hi: s.hi || g.hi || '16:00', hf: s.hf || g.hf || '18:00', aus: Object.entries(s.asist || {}).filter(([, v]) => v !== 'P').map(([a]) => a), obs: s.obs || '', prev: !!s.impartida }; });
  return (BORR[k] = { filas, cambiado: false });
}
function rAsistPDF(g, A, selMes) {
  const B = borrador(g, grupoSel, mesResumen);
  return '<div class="card"><div class="card-h"><h2>📥 Asistencia del mes (del PDF del monitor)</h2>' + selMes + '</div>' +
    '<p class="small">1) Sube el <b>Anexo X</b> (y el XII) que te entrega ' + esc(g.docente || 'el monitor/a') + ' o márcalo a mano. 2) Revisa los días y las faltas. 3) Pulsa <b>Guardar</b>. Con eso salen los días para Séneca y el PDF con su nombre para subirlo.</p>' +
    '<label class="btn sec peq" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer">📎 Leer el PDF de asistencia<input type="file" id="pdfAsis" accept="application/pdf" multiple style="display:none"></label> <span id="pdfAsisMsg" class="small muted"></span>' +
    (B.filas.length ? '<div class="tabla" style="margin-top:8px"><table><tr><th>Día</th><th>¿Se dio?</th><th>Horario</th><th>Faltan</th><th>Observaciones</th></tr>' + B.filas.map((r, i) => {
      const d = new Date(r.f + 'T12:00'), sc = sinCole(r.f);
      return '<tr style="' + (r.imp ? 'background:#f0fbf4' : '') + '"><td><b>' + DSEM[d.getDay()].slice(0, 3) + ' ' + d.getDate() + '</b>' + (sc ? '<br><span class="small muted">' + esc(sc.nombre) + '</span>' : '') + '</td>' +
        '<td><input type="checkbox" class="chk" data-bimp="' + i + '"' + (r.imp ? ' checked' : '') + '></td>' +
        '<td style="white-space:nowrap"><input type="time" data-bhi="' + i + '" value="' + esc(r.hi) + '" style="width:96px;padding:4px"> – <input type="time" data-bhf="' + i + '" value="' + esc(r.hf) + '" style="width:96px;padding:4px"></td>' +
        '<td>' + (r.imp ? A.map(([aid, a]) => '<button class="chip' + (r.aus.includes(aid) ? ' on' : '') + '" data-baus="' + i + '|' + aid + '" style="padding:3px 8px;margin:1px">' + esc(a.siglas) + '</button>').join('') || '<span class="muted small">sin alumnado</span>' : '') + '</td>' +
        '<td><input data-bobs="' + i + '" value="' + esc(r.obs) + '" style="padding:4px" ' + (r.imp ? '' : 'disabled') + '></td></tr>';
    }).join('') + '</table></div>' : '<p class="small muted">Este grupo no tiene días de sesión configurados (Editar grupo).</p>') +
    '<div class="pie" style="justify-content:flex-start"><button class="btn" data-acc="guardarAsis"' + (B.cambiado ? '' : ' disabled') + '>💾 Guardar asistencia de ' + esc(MESES[+mesResumen.slice(5) - 1]) + '</button> <button class="btn sec peq" data-acc="xPrev">🖨️ Anexo X para el monitor (fechas previstas)</button></div>' +
    '<p class="small muted">Marca en «Faltan» a quien no vino ese día (pulsa sus siglas). El nombre de quien firma y el resto de datos ya están en el grupo.</p></div>';
}
async function leerPDFs(files) {
  const msg = $('pdfAsisMsg'); msg.textContent = '⏳ Leyendo…';
  try {
    if (!window.pdfjsLib) { await cargarScript('/refuerzo/lib/pdf.min.js'); }
    const lib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
    lib.GlobalWorkerOptions.workerSrc = '/refuerzo/lib/pdf.worker.min.js';
    let texto = '';
    for (const f of files) {
      const doc = await lib.getDocument({ data: await f.arrayBuffer() }).promise;
      for (let p = 1; p <= doc.numPages; p++) texto += ' ' + (await (await doc.getPage(p)).getTextContent()).items.map(x => x.str).join(' ');
    }
    const B = borrador(D.grupos[grupoSel], grupoSel, mesResumen), y = mesResumen.slice(0, 4), m = +mesResumen.slice(5);
    const vistos = new Set();
    (texto.match(/\b(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/g) || []).forEach(s => {
      const [d, mm] = s.split(/[\/\-.]/).map(Number); if (mm === m && d >= 1 && d <= 31) vistos.add(mesResumen + '-' + pad(d));
    });
    if (!texto.trim()) { msg.textContent = 'El PDF es una imagen escaneada: no se puede leer el texto. Marca los días a mano mirando el PDF.'; return; }
    if (!vistos.size) { msg.textContent = 'No he encontrado fechas de ' + MESES[m - 1] + ' en el PDF. Márcalas a mano.'; return; }
    vistos.forEach(f => { let r = B.filas.find(x => x.f === f); if (!r) { const g = D.grupos[grupoSel]; r = { f, imp: false, hi: g.hi || '16:00', hf: g.hf || '18:00', aus: [], obs: '' }; B.filas.push(r); } r.imp = true; });
    B.filas.sort((a, b) => a.f.localeCompare(b.f)); B.cambiado = true;
    // Faltas (Anexo XII): siglas que aparecen cerca de cada fecha
    render(); $('pdfAsisMsg').textContent = '✔ ' + vistos.size + ' sesiones encontradas en el PDF. Revísalas y pulsa Guardar.';
  } catch (e) { console.warn(e); msg.textContent = 'No he podido leer el PDF. Márcalo a mano.'; }
}
function guardarAsistencia() {
  const g = D.grupos[grupoSel], B = borrador(g, grupoSel, mesResumen), al = Object.keys(g.alumnos || {});
  B.filas.forEach(r => {
    const ruta = 'sesiones/' + grupoSel + '/' + r.f;
    if (r.imp) {
      const mins = (+r.hf.slice(0, 2) * 60 + +r.hf.slice(3)) - (+r.hi.slice(0, 2) * 60 + +r.hi.slice(3));
      const asist = {}; al.forEach(a => asist[a] = r.aus.includes(a) ? 'F' : 'P');
      guardar(ruta, { impartida: true, hi: r.hi, hf: r.hf, horas: mins > 0 ? Math.round(mins / 30) / 2 : (g.horasSesion || 2), asist, obs: r.obs || null });
    } else if (r.prev) guardar(ruta, null);
  });
  delete BORR[grupoSel + '|' + mesResumen];
  toast('Asistencia de ' + MESES[+mesResumen.slice(5) - 1] + ' guardada'); render();
}

// ─── Documentos del grupo (programación, acta de selección, autorizaciones, bajas…) ───
const NKEY = gid => 'programas-nombres-' + gid;   // nombres completos: solo en este dispositivo
const nombres = gid => { try { return JSON.parse(localStorage.getItem(NKEY(gid)) || '{}'); } catch (e) { return {}; } };
const nombreDe = (gid, aid, a) => nombres(gid)[aid] || a.siglas;
const CURSO_G = g => ({ Tercero: '3.º', Cuarto: '4.º', Quinto: '5.º', Sexto: '6.º' }[g.nombre] || '');
function rDocsGrupo(g, A) {
  const P = g.prog || {}, hechos = ['obj', 'comp', 'b1', 'b2', 'b3', 'b4'].filter(k => P[k]).length;
  return '<div class="card"><div class="card-h"><h2>📑 Documentos del grupo</h2><span class="small muted">Con los logos oficiales, listos para subir o imprimir</span></div>' +
    '<div class="g2">' +
    '<div><b>Programación</b><p class="small muted">Se sube en Séneca (tipo «Programación»). ' + (hechos ? hechos + '/6 apartados revisados.' : 'Viene con una propuesta lista para revisar.') + '</p><button class="btn peq" data-acc="dProg">✏️ Revisar y generar</button></div>' +
    '<div><b>Acta de selección (Anexo XVI)</b><p class="small muted">Se sube en Séneca (tipo «Acta de selección del alumnado»).</p><button class="btn peq" data-acc="dActa">✏️ Rellenar y generar</button></div>' +
    '<div><b>Autorizaciones de las familias (Anexo VI)</b><p class="small muted">Una por alumno/a. Se guardan en el centro.</p><button class="btn sec peq" data-acc="dAut">📄 Generar</button></div>' +
    '<div><b>Bajas y suplentes</b><p class="small muted">Anexo VIII (baja, a la familia) y Anexo XVII (anexo al acta).</p><button class="btn sec peq" data-acc="dBaja">📄 Anexo VIII</button> <button class="btn sec peq" data-acc="dXVII">✏️ Anexo XVII</button></div>' +
    '</div><p class="small muted" style="margin-top:8px">Los nombres completos del alumnado se escriben en el acta de selección y se guardan <b>solo en este dispositivo</b> (en la nube solo hay siglas).</p></div>';
}
function progPorDefecto(g) {
  const c = CURSO_G(g);
  return {
    obj: 'Mejorar la competencia lectora (fluidez y comprensión) y la competencia matemática (cálculo y resolución de problemas) del alumnado de ' + c + ' de Educación Primaria.\nAdquirir hábitos de trabajo, organización y estudio: uso de la agenda, planificación de tareas y constancia.\nMejorar la motivación, la autoestima y la integración del alumnado en el grupo y en el centro.\nPrevenir el absentismo y favorecer la relación de las familias con el centro.',
    comp: 'Competencia en comunicación lingüística (CCL).\nCompetencia matemática y competencia en ciencia, tecnología e ingeniería (STEM).\nCompetencia digital (CD).\nCompetencia personal, social y de aprender a aprender (CPSAA).\nCompetencia ciudadana (CC).',
    b1: 'Lectura diaria guiada con lecturas adaptadas a su nivel y registro de fluidez lectora.\nComprensión lectora: preguntas literales, inferenciales y valorativas; resúmenes orales y escritos.\nExpresión escrita: oraciones, descripciones, notas y pequeños textos.\nCálculo mental y operaciones con material manipulativo (metodología OAOA del centro).\nResolución de problemas de uno y dos pasos con un esquema común de pasos.\nApoyo en las tareas escolares del día en coordinación con el tutor/a.',
    b2: 'Uso de juegos y aplicaciones educativas del centro (lectura, cálculo, ortografía).\nBúsqueda guiada de información y uso responsable y seguro de internet.\nUso del Aula del Futuro y pequeñas presentaciones digitales.',
    b3: 'Normas del grupo consensuadas al inicio y asamblea de inicio de sesión.\nTrabajo del valor del mes del centro («Un mes, un valor, juntos crecemos»).\nJuegos cooperativos, igualdad entre niños y niñas y resolución pacífica de conflictos (diálogo, mediación).',
    b4: 'Visitas a espacios de la comunidad de Santa Fe: biblioteca municipal, comercios, mercado y talleres de la zona.\nSituaciones funcionales: hacer la compra con dinero simulado, leer recetas, carteles y horarios, medir y calcular en la vida diaria.\nCelebración de logros y actividades motivadoras al final de cada trimestre.',
    met: 'Sesiones de ' + (g.hi || '16:00') + ' a ' + (g.hf || '18:00') + ' (' + diasTxt(g) + '). Estructura: acogida y agenda (10 min), tareas escolares y refuerzo de lo trabajado en clase (40 min), lectura y comprensión (30 min), cálculo y problemas (30 min), actividad motivadora o juego (10 min).\nTrabajo individualizado y en pequeño grupo, partiendo de la evaluación inicial.',
    ev: 'Evaluación inicial al comenzar el programa. Seguimiento continuo con registro de asistencia y observación diaria.\nInforme individualizado trimestral (Anexo XV) para el equipo docente antes de cada sesión de evaluación.\nCoordinación quincenal (telemática) con el tutor o tutora de cada alumno/a.'
  };
}
const PROG_CAMPOS = [['obj', 'Objetivos a alcanzar'], ['comp', 'Competencias a trabajar'], ['b1', 'Aprendizajes instrumentales básicos: comprensión lectora, expresión oral o escrita, cálculo y resolución de problemas · actividades tipo'], ['b2', 'Uso de las TIC en la vida diaria · actividades tipo'], ['b3', 'Coeducación, normas para la convivencia, mediación y resolución pacífica de conflictos · actividades tipo'], ['b4', 'Actividades motivadoras y funcionales (visitas a espacios de la comunidad: comercios, cines, hogares y talleres de la zona) · actividades tipo'], ['met', 'Organización y metodología'], ['ev', 'Evaluación y coordinación']];
function dlgProg() {
  const g = D.grupos[grupoSel], P = Object.assign(progPorDefecto(g), g.prog || {}), A = Object.entries(g.alumnos || {});
  $('dlgIn').innerHTML = '<h2>Programación · ' + esc(g.nombre) + '</h2><p class="small muted">Viene con una propuesta según lo que piden las Instrucciones (Anexo III) y la lista de cotejo. Cámbiala lo que quieras: se guarda para el grupo.</p>' +
    PROG_CAMPOS.map(([k, t]) => '<label>' + esc(t) + '</label><textarea id="pg_' + k + '" rows="4">' + esc(P[k] || '') + '</textarea>').join('') +
    (A.length ? '<label>Objetivos individuales de cada alumno/a</label>' + A.map(([aid, a]) => '<div style="display:flex;gap:8px;align-items:center;margin:3px 0"><b style="min-width:60px">' + esc(a.siglas) + '</b><input id="pgi_' + aid + '" value="' + esc((P.ind || {})[aid] || '') + '" placeholder="Ej.: leer con fluidez textos de su nivel; resolver problemas de dos pasos"></div>').join('') : '') +
    '<div class="pie"><button class="btn sec" id="pgC">Cancelar</button><button class="btn" id="pgOk">Guardar y generar PDF</button></div>';
  $('dlg').showModal();
  $('pgC').onclick = () => $('dlg').close();
  $('pgOk').onclick = () => {
    const v = {}; PROG_CAMPOS.forEach(([k]) => v[k] = $('pg_' + k).value.trim());
    v.ind = {}; A.forEach(([aid]) => { const x = $('pgi_' + aid).value.trim(); if (x) v.ind[aid] = x; });
    guardar('grupos/' + grupoSel + '/prog', v); $('dlg').close(); docProg(grupoSel, v); render();
  };
}
function docProg(gid, P) {
  const g = D.grupos[gid], A = Object.entries(g.alumnos || {}), lista = t => '<ul style="margin:4px 0 10px 20px">' + String(t || '').split('\n').filter(Boolean).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
  abrirAnexo(g.nombre + ' - Programación', ['<h1>PROGRAMACIÓN DEL GRUPO DE ACOMPAÑAMIENTO ESCOLAR «' + esc(g.nombre.toUpperCase()) + '»<br>PROGRAMA DE REFUERZO, ORIENTACIÓN Y APOYO (PROA ANDALUCÍA) · CURSO ' + CURSO.replace('-', '/20') + '</h1>' +
    '<table><colgroup><col style="width:30%"><col></colgroup><tr><td class="et">CENTRO</td><td>CEIP Capitulaciones (Santa Fe) · código 18008853</td></tr><tr><td class="et">GRUPO</td><td>' + esc(g.nombre) + ' · ' + esc(ACT[g.act] || '') + ' · ' + (g.mod === 'A' ? 'Modalidad A (mentor/a)' : 'Modalidad B (profesorado)') + '</td></tr><tr><td class="et">MENTOR/A O PROFESOR/A</td><td>' + esc(g.docente || '') + '</td></tr><tr><td class="et">HORARIO</td><td>' + esc(diasTxt(g)) + ', de ' + esc(g.hi || '16:00') + ' a ' + esc(g.hf || '18:00') + ' · del ' + fechaAnexo(g.inicio || (startY(CURSO) + '-10-26')) + ' al 31/05/' + (startY(CURSO) + 1) + '</td></tr><tr><td class="et">ALUMNADO</td><td>' + A.length + ' alumnos/as de ' + esc(CURSO_G(g)) + ' de Educación Primaria</td></tr></table>' +
    PROG_CAMPOS.map(([k, t], i) => '<p class="b">' + (i + 1) + '. ' + esc(t.toUpperCase()) + '</p>' + lista(P[k])).join('') +
    (A.length ? '<p class="b">' + (PROG_CAMPOS.length + 1) + '. OBJETIVOS INDIVIDUALES</p><table><tr><th style="text-align:left;width:35%">Alumno/a</th><th style="text-align:left">Objetivos</th></tr>' + A.map(([aid, a]) => '<tr><td>' + esc(nombreDe(gid, aid, a)) + '</td><td>' + esc((P.ind || {})[aid] || '') + '</td></tr>').join('') + '</table>' : '') +
    tempoProg(g) + '<p class="lugar">En Santa Fe, a ' + fLarga(hoyIso()) + '.</p><table style="border:0"><tr><td style="border:0;text-align:center">El mentor/a o profesor/a<br>' + (firmaGrupo(gid) ? '<img src="' + firmaGrupo(gid) + '" style="height:46px">' : '<br><br>') + '<br>Fdo.: ' + esc(g.docente || '') + '</td><td style="border:0;text-align:center">Vº Bº El coordinador del Programa<br><br><br>Fdo.: ' + DIRECTOR + '</td></tr></table>']);
}
// Acta de selección (Anexo XVI)
const COMISION_DEF = { je: 'María Rodríguez Rodríguez', co: 'Víctor Manuel Única Salas', ciclos: 'Silvia Tatiana Tortosa Espínola (2.º ciclo) y Manuel Lupión Puente (3.er ciclo); María Noelia Sáez Guerrero (Equipo de Orientación)', eoe: 'Bianca Ruiz Muñoz' };
function dlgActa() {
  const g = D.grupos[grupoSel], A = Object.entries(g.alumnos || {}), C = Object.assign({}, COMISION_DEF, (D.comision || {})); if (!C.eoe) C.eoe = COMISION_DEF.eoe; if (!/Sáez Guerrero/.test(C.ciclos)) C.ciclos += '; María Noelia Sáez Guerrero (Equipo de Orientación)';
  const N = nombres(grupoSel), a0 = g.acta || {};
  $('dlgIn').innerHTML = '<h2>Acta de selección · ' + esc(g.nombre) + '</h2>' +
    '<div class="g2"><div><label>Fecha de la reunión</label><input type="date" id="acF" value="' + esc(a0.fecha || hoyIso()) + '"></div><div><label>Hora</label><input type="time" id="acH" value="' + esc(a0.hora || '13:00') + '"></div></div>' +
    '<label>Jefe/a de Estudios</label><input id="acJe" value="' + esc(C.je) + '"><label>Coordinador/a del Programa</label><input id="acCo" value="' + esc(C.co) + '">' +
    '<label>Coordinadores/as de los ciclos (incluido el del Equipo de Orientación del centro)</label><input id="acCi" value="' + esc(C.ciclos) + '"><label>Orientador/a de referencia del E.O.E.</label><input id="acEoe" value="' + esc(C.eoe) + '">' +
    '<label>Nombre y apellidos del alumnado seleccionado <span class="muted">(solo en este dispositivo)</span></label>' + (A.map(([aid, a]) => '<div style="display:flex;gap:8px;align-items:center;margin:3px 0"><b style="min-width:60px">' + esc(a.siglas) + '</b><input data-nom="' + aid + '" value="' + esc(N[aid] || '') + '" placeholder="Nombre y apellidos"><span class="small muted">' + esc(a.curso || '') + '</span></div>').join('') || '<p class="small muted">Añade primero el alumnado del grupo.</p>') +
    '<label>Alumnado suplente (uno por línea: nombre y apellidos, curso)</label><textarea id="acSup" rows="3">' + esc(localStorage.getItem(NKEY(grupoSel) + '-sup') || '') + '</textarea>' +
    '<div class="pie"><button class="btn sec" id="acC">Cancelar</button><button class="btn" id="acOk">Guardar y generar PDF</button></div>';
  $('dlg').showModal();
  $('acC').onclick = () => $('dlg').close();
  $('acOk').onclick = () => {
    if (!$('acF').value || !$('acH').value) { toast('Pon la fecha y la hora de la reunión de la comisión', 'err'); return; }
    const n = {}; document.querySelectorAll('[data-nom]').forEach(i => { if (i.value.trim()) n[i.dataset.nom] = i.value.trim(); });
    try { localStorage.setItem(NKEY(grupoSel), JSON.stringify(Object.assign(nombres(grupoSel), n))); localStorage.setItem(NKEY(grupoSel) + '-sup', $('acSup').value); } catch (e) { }
    const com = { je: $('acJe').value.trim(), co: $('acCo').value.trim(), ciclos: $('acCi').value.trim(), eoe: $('acEoe').value.trim() };
    guardar('comision', com); guardar('grupos/' + grupoSel + '/acta', { fecha: $('acF').value, hora: $('acH').value });
    $('dlg').close(); docActa(grupoSel, com, $('acF').value, $('acH').value, $('acSup').value); render();
  };
}
const lin = (v, n) => v ? '<u>&nbsp;' + esc(v) + '&nbsp;</u>' : '_'.repeat(n || 30);
function bloqueComision(C) {
  return '<p style="margin:10px 0 4px">En Educación Primaria:</p><ul style="margin:0 0 10px 26px;line-height:1.7"><li>Jefe/a de Estudios: ' + lin(C.je, 50) + '</li><li>Coordinador/a del Programa: ' + lin(C.co, 40) + '</li><li>Coordinador/a de cada uno de los ciclos de la etapa, incluyendo al del Equipo de Orientación del centro: ' + lin(C.ciclos, 50) + '</li><li>Orientador/a de referencia del E.O.E.: ' + lin(C.eoe, 45) + '</li></ul>' +
    '<p style="margin:10px 0 4px">En Educación Secundaria Obligatoria:</p><ul style="margin:0 0 10px 26px;line-height:1.7"><li>Jefa o jefe de Estudios: ' + '_'.repeat(50) + '</li><li>Coordinador o coordinadora del Programa: ' + '_'.repeat(40) + '</li><li>Orientador u orientadora del centro: ' + '_'.repeat(45) + '</li><li>Al menos uno de todos los profesionales que ostenten las tutorías: ' + '_'.repeat(25) + '</li></ul>';
}
function cabActa(fecha, hora, verbo) {
  return '<p style="text-align:justify;line-height:1.8">Siendo las ' + lin(hora, 10) + ' horas del día ' + lin(fecha ? fLarga(fecha) : '', 30) + ', en el centro docente ' + lin('CEIP Capitulaciones', 40) + ', código ' + lin('18008853', 14) + ', de la localidad de ' + lin('Santa Fe (Granada)', 20) + ', ' + verbo + ' la Comisión de Selección del alumnado participante en el Programa de Refuerzo, Orientación y Apoyo (PROA Andalucía), cofinanciado por el Fondo Social Europeo Plus, cuya composición es la siguiente:</p>';
}
function firmasComision(C) {
  const p = [['Jefe/a de Estudios', C.je], ['Coordinador/a del Programa', C.co], ['Coordinadores/as de ciclo', C.ciclos], ['Orientador/a del E.O.E.', C.eoe]];
  return '<table style="margin-top:20px"><tr>' + p.map(([t, n]) => '<td style="height:90px;vertical-align:bottom;font-size:9pt;text-align:center">' + esc(t) + '<br>Fdo.: ' + esc(n || '') + '</td>').join('') + '</tr></table><p class="firma" style="margin-top:30px">VºBº El Director<br><br><br>Fdo.: ' + DIRECTOR + '</p>';
}
function docActa(gid, C, fecha, hora, sup) {
  const g = D.grupos[gid], A = Object.entries(g.alumnos || {}), cur = startY(CURSO) + '/' + (startY(CURSO) + 1), anio = fecha ? fecha.slice(0, 4) : '20__';
  const S = String(sup || '').split('\n').map(x => x.trim()).filter(Boolean);
  abrirAnexo(g.nombre + ' - Acta de selección del alumnado', ['<h1>ANEXO XVI. MODELO DE ACTA DE SELECCIÓN DEL ALUMNADO.</h1>' + cabActa(fecha, hora, 'se constituye') + bloqueComision(C) +
    '<p style="text-align:justify">Una vez oída la propuesta del equipo docente, esta Comisión elabora el siguiente listado de alumnado que participará en el Programa PROA Andalucía en el presente curso ' + lin(cur, 16) + ', así como el listado de alumnado suplente para cubrir posibles bajas, en su caso:</p>' +
    '<p class="b">Grupo «' + esc(g.nombre) + '»</p><table><tr><th style="width:8%">N.º</th><th style="text-align:left">Nombre y apellidos</th><th style="width:22%">Curso</th></tr>' + A.map(([aid, a], i) => '<tr><td class="c">' + (i + 1) + '</td><td>' + esc(nombreDe(gid, aid, a)) + '</td><td class="c">' + esc(a.curso || '') + ' E. Primaria</td></tr>').join('') + '</table>' +
    (S.length ? '<p class="b">Alumnado suplente</p><table>' + S.map((x, i) => '<tr><td class="c" style="width:8%">' + (i + 1) + '</td><td>' + esc(x) + '</td></tr>').join('') + '</table>' : '') +
    '<p style="text-align:justify">Para constancia se cierra y firma la presente Acta por todos los miembros de la Comisión de Selección que han intervenido en la selección del alumnado participante en el Programa PROA Andalucía del presente curso ' + lin(cur, 14) + ', con el VºBº del Director/a del centro (y el sello oficial del centro, en el caso de no emplear las firmas electrónicas), en ' + lin('Santa Fe', 12) + ' a ' + lin(fecha ? String(+fecha.slice(8)) : '', 5) + ' de ' + lin(fecha ? MESES[+fecha.slice(5, 7) - 1] : '', 15) + ' de ' + anio + '.</p>' + firmasComision(C)]);
}
// Autorizaciones (Anexo VI), una por alumno/a
function docAutorizaciones() {
  const g = D.grupos[grupoSel], A = Object.entries(g.alumnos || {}), ini = new Date((g.inicio || (startY(CURSO) + '-10-26')) + 'T12:00');
  const pag = (nom, cur) => '<h1>ANEXO VI. MODELO DE INFORMACIÓN Y AUTORIZACIÓN FAMILIAR PARA EL DESARROLLO DEL ACOMPAÑAMIENTO ESCOLAR O EL ACOMPAÑAMIENTO LINGÜÍSTICO PARA ALUMNADO INMIGRANTE.</h1>' +
    '<p style="text-align:justify;line-height:1.8">Con el fin de optimizar la consecución de las competencias clave en los alumnos y en las alumnas, el centro ' + lin('CEIP Capitulaciones (Santa Fe)', 50) + ', a partir del día ' + lin(String(ini.getDate()), 8) + ' del mes de ' + lin(MESES[ini.getMonth()], 18) + ' comenzará la actuación gratuita de ' + lin(ACT[g.act] || 'Acompañamiento Escolar', 40) + ' cofinanciada por el Fondo Social Europeo Plus en la que, una vez acabada la jornada lectiva, se ofrecerán al alumnado las herramientas y técnicas que les permita mejorar su rendimiento escolar y adquirir una motivación positiva hacia su aprendizaje, entre otras ventajas.</p>' +
    '<p style="text-align:justify;line-height:1.8">Estas actividades serán impartidas por profesorado del propio centro o por mentores o mentoras y se realizarán los días ' + lin(diasTxt(g), 30) + ' desde las ' + lin(g.hi || '16:00', 10) + ' a las ' + lin(g.hf || '18:00', 10) + ' horas, en las instalaciones del centro.</p>' +
    '<p style="text-align:justify;line-height:1.8">El alumno/ la alumna ' + lin(nom, 45) + ' ha sido propuesto/a por el equipo docente para asistir a dicho Programa. Por tanto, solicitamos su autorización para que participe en el mismo, entregando al centro esta hoja firmada y aportando los datos solicitados.</p>' +
    '<p class="c" style="margin:14px 0 28px">La persona titular de la dirección del centro</p><p class="b" style="margin-top:20px">AUTORIZACIÓN</p>' +
    '<p style="text-align:justify;line-height:1.9">D./Dª ____________________________________________, con DNI _______________________, como padre, madre o tutor/a legal del alumno/a ' + lin(nom, 40) + ' matriculado en el curso y grupo ' + lin(cur ? cur + ' E. Primaria' : '', 14) + ', <b>autorizo su participación</b> en una de las siguientes actuaciones del Programa PROA Andalucía cofinanciado por Fondo Social Europeo Plus, y me responsabilizo de su acompañamiento, asistencia y recogida en el centro en el que se imparte.</p>' +
    '<table><tr><td class="b">ACOMPAÑAMIENTO ESCOLAR</td><td class="c" style="width:40px">' + (g.act !== 'ALI' ? 'X' : '') + '</td></tr><tr><td class="b">ACOMPAÑAMIENTO LINGÜÍSTICO PARA ALUMNADO INMIGRANTE</td><td class="c">' + (g.act === 'ALI' ? 'X' : '') + '</td></tr></table>' +
    '<p>Teléfono de contacto: _______________________</p><p class="lugar" style="margin-top:24px">En________________, a______de________________ de ________</p><p class="c" style="margin-top:30px">Firmado______________________________________</p>';
  abrirAnexo(g.nombre + ' - Autorizaciones familiares (Anexo VI)', (A.length ? A.map(([aid, a]) => pag(nombreDe(grupoSel, aid, a) === a.siglas ? '' : nombreDe(grupoSel, aid, a), a.curso)) : [pag('', '')]));
}
function docBaja() {
  const g = D.grupos[grupoSel];
  abrirAnexo('Anexo VIII baja del programa', ['<h1>ANEXO VIII. MODELO PARA LA COMUNICACIÓN DE BAJAS EN LOS PROGRAMAS DE ACOMPAÑAMIENTO IMPARTIDOS EN EL CENTRO DOCENTE.</h1>' +
    '<p style="text-align:justify;line-height:1.9">El día______ del mes de __________,D/Dª_________________________________________ autorizaron la participación del alumno/a ____________________________________________________________ en el Programa de ' + lin(ACT[g.act] || 'Acompañamiento Escolar', 40) + ' que gratuitamente y cofinanciado por el Fondo Social Europeo Plus ofrece nuestro centro, con el objetivo de que tuviera la opción de mejorar su rendimiento escolar. Recientemente ha dejado de asistir a dichas clases, por lo que solicitamos que, si ha sido bajo vuestro consentimiento, nos confirméis su baja firmando y enviándonos urgentemente el documento adjunto.</p>' +
    '<p class="c" style="margin:14px 0 28px">La persona titular de la dirección del centro</p><p class="b">BAJA DEL ALUMNADO EN EL PROGRAMA</p>' +
    '<table><tr><td class="b">ACOMPAÑAMIENTO ESCOLAR</td><td class="c" style="width:40px">' + (g.act !== 'ALI' ? 'X' : '') + '</td></tr><tr><td class="b">ACOMPAÑAMIENTO LINGÜÍSTICO PARA ALUMNADO INMIGRANTE</td><td class="c">' + (g.act === 'ALI' ? 'X' : '') + '</td></tr></table>' +
    '<p style="text-align:justify;line-height:1.9">D./Dª _____________________________________________________ con DNI _____________________, como padre, madre o tutor/a legal del alumno/a _________________________________________ matriculado en el curso y grupo ____________________________, notifica su baja en el Programa arriba señalado a partir del día ______ de______________ de 20___</p>' +
    '<p class="lugar" style="margin-top:24px">En_______________, a______de________________ de ________</p><p class="c" style="margin-top:30px">Firmado______________________________________</p>']);
}
function dlgXVII() {
  $('dlgIn').innerHTML = '<h2>Anexo XVII · Anexo al acta de selección</h2><div class="g2"><div><label>Fecha</label><input type="date" id="x7F" value="' + hoyIso() + '"></div><div><label>Hora</label><input type="time" id="x7H"></div></div>' +
    '<label>Alumno/a que causa baja (nombre y apellidos)</label><input id="x7B"><label>Alumno/a que se incorpora (nombre y apellidos)</label><input id="x7A">' +
    '<div class="pie"><button class="btn sec" id="x7C">Cancelar</button><button class="btn" id="x7Ok">Generar PDF</button></div>';
  $('dlg').showModal(); $('x7C').onclick = () => $('dlg').close();
  $('x7Ok').onclick = () => {
    const C = Object.assign({}, COMISION_DEF, D.comision || {}); if (!C.eoe) C.eoe = COMISION_DEF.eoe; const f = $('x7F').value, h = $('x7H').value, b = $('x7B').value.trim(), a = $('x7A').value.trim(); $('dlg').close();
    abrirAnexo(D.grupos[grupoSel].nombre + ' - Anexo al acta de selección', ['<h1>ANEXO XVII. MODELO DE ANEXO AL ACTA DE SELECCIÓN DEL ALUMNADO.</h1>' + cabActa(f, h, 'se reúne') + bloqueComision(C) +
      '<p style="text-align:justify;line-height:1.8">Ante la baja del alumno/a ' + lin(b, 50) + ' en el Programa PROA Andalucía, esta Comisión propone la incorporación al Programa del alumno/a ' + lin(a, 50) + '.</p>' +
      '<p style="text-align:justify">Para constancia, este Anexo al Acta de selección del alumnado participante en el Programa PROA Andalucía se cierra y firma por todos los miembros de la Comisión de Selección que han intervenido. Con el VºBº del Director/a del centro (y el sello oficial del centro, en el caso de no emplear las firmas electrónicas), en ' + lin('Santa Fe', 12) + ' a ' + lin(f ? String(+f.slice(8)) : '', 5) + ' de ' + lin(f ? MESES[+f.slice(5, 7) - 1] : '', 15) + ' de ' + (f ? f.slice(0, 4) : '20__') + '.</p>' + firmasComision(C)]);
  };
}

// ─── Eventos ───
document.addEventListener('click', e => {
  const t = e.target.closest('[data-acc],[data-baus]'); if (!t) return;
  if (t.dataset.baus) { const [i, aid] = t.dataset.baus.split('|'), B = borrador(D.grupos[grupoSel], grupoSel, mesResumen), r = B.filas[+i]; r.aus = r.aus.includes(aid) ? r.aus.filter(x => x !== aid) : r.aus.concat(aid); B.cambiado = true; render(); return; }
  const a = t.dataset.acc;
  const F = { xPrev: () => docAnexoXHoja(grupoSel, mesResumen, true), xBlanco: () => docAnexoXHoja(grupoSel, mesResumen, false), xiiBlanco: () => docAnexoXIIHoja(grupoSel, mesResumen), xiiiBlanco: docAnexoXIII,
    guardarAsis: guardarAsistencia, dProg: dlgProg, dActa: dlgActa, dAut: docAutorizaciones, dBaja: docBaja, dXVII: dlgXVII }[a];
  if (F) F();
});
document.addEventListener('change', e => {
  const t = e.target, d = t.dataset;
  if (t.id === 'pdfAsis' && t.files.length) { leerPDFs([...t.files]); t.value = ''; return; }
  const k = d.bimp != null ? 'imp' : d.bhi != null ? 'hi' : d.bhf != null ? 'hf' : d.bobs != null ? 'obs' : null; if (!k) return;
  const B = borrador(D.grupos[grupoSel], grupoSel, mesResumen), r = B.filas[+(d.bimp ?? d.bhi ?? d.bhf ?? d.bobs)];
  r[k] = k === 'imp' ? t.checked : t.value; B.cambiado = true; if (k === 'imp') render(); else { const b = document.querySelector('[data-acc=guardarAsis]'); if (b) b.disabled = false; }
});
document.addEventListener('change', e => { if (e.target.id === 'mesResumen') Object.keys(BORR).forEach(k => { if (!BORR[k].cambiado) delete BORR[k]; }); }, true);
