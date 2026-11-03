// Programas del cole · Quincenales por curso para la coordinación (enviadas / pendientes) y PDF informativo para familias
'use strict';

// ─── Estado de envío de cada reunión quincenal («Enviar a Víctor» desde la sala) ───
let LOGO_COLE = 'img/logo-colegio.jpg';
fetch('img/logo-colegio.jpg').then(r => r.blob()).then(b => new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(b); })).then(u => { LOGO_COLE = u; }).catch(() => { });
const ENVIOS = {}; let enviosCargando = false;
async function cargarEnvios() {
  if (enviosCargando) return; enviosCargando = true;
  const L = Object.entries(D.reuniones || {}).filter(([, r]) => r.tipo === 'quincenal' && r.sala && !r.salaAport && !(r.sala in ENVIOS));
  await Promise.all(L.map(([id, r]) => db.ref('programas_salas/' + r.sala + '/part/_envio').once('value').then(async s => { ENVIOS[r.sala] = s.val() || null; if (ENVIOS[r.sala]) await cerrarSala(id); }).catch(() => { ENVIOS[r.sala] = null; })));
  enviosCargando = false; if (L.length && seccion === 'reuniones' && !editando()) render();
}
async function cerrarSala(id) {
  const r = D.reuniones[id], s = (await db.ref('programas_salas/' + r.sala).once('value')).val() || {};
  const ap = s.aport || {}, part = Object.assign({}, s.part || {}), env = part._envio || null; delete part._envio;
  guardar('reuniones/' + id + '/salaAport', ap); guardar('reuniones/' + id + '/salaPart', part); guardar('reuniones/' + id + '/salaEnvio', env); guardar('reuniones/' + id + '/prevista', null);
  Object.assign(r, { salaAport: ap, salaPart: part, salaEnvio: env, prevista: null });
  await db.ref('programas_salas/' + r.sala).update({ abierta: false, chat: null });
}
function rQuincenalesCoord() {
  const hoy = hoyIso(), G = Object.entries(D.grupos || {}).sort((a, b) => ordGrupo(a[1]) - ordGrupo(b[1]));
  if (!G.length) return '';
  cargarEnvios();
  const fila = ([gid, g]) => {
    const RR = Object.entries(D.reuniones || {}).filter(([, r]) => r.tipo === 'quincenal' && r.grupo === gid && r.fecha).sort((a, b) => a[1].fecha.localeCompare(b[1].fecha));
    let env = 0, faltan = 0;
    const chips = RR.map(([id, r]) => {
      const d = new Date(r.fecha + 'T12:00'), t = d.getDate() + ' ' + MESES[d.getMonth()].slice(0, 3);
      if (r.salaAport) { env++; return '<button class="chip on" data-acta="' + id + '" title="Descargar el acta">✔ ' + t + '</button>'; }
      if (r.sala && ENVIOS[r.sala]) { env++; return '<button class="chip on" data-qenv="' + id + '" title="Enviada por ' + esc(ENVIOS[r.sala].n) + ' · descargar el acta">📨 ' + t + '</button>'; }
      if (r.fecha < hoy) { faltan++; return '<button class="chip" data-sala="' + id + '" style="border-color:var(--bad);color:var(--bad)" title="Celebrada y sin enviar">⚠ ' + t + '</button>'; }
      return '<button class="chip" data-sala="' + id + '" style="opacity:.6" title="Prevista">' + t + '</button>';
    }).join('');
    return '<div style="padding:8px 0;border-top:1px solid #edf1f7"><div style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap"><b>' + esc(g.nombre) + '</b><span class="small muted">' + esc(g.docente || '') + '</span><span class="small" style="margin-left:auto">' + env + ' enviadas' + (faltan ? ' · <b style="color:var(--bad)">' + faltan + ' sin enviar</b>' : '') + '</span></div>' +
      (RR.length ? '<div class="chips" style="margin-top:6px">' + chips + '</div>' : '<p class="small muted">Sin reuniones quincenales. Cárgalas con «Cargar reuniones previstas».</p>') + '</div>';
  };
  return '<div class="card"><div class="card-h"><h2>🤝 Quincenales por curso</h2></div>' +
    '<p class="small muted"><b>✔ / 📨</b> enviada: toca para descargar el acta · <b style="color:var(--bad)">⚠</b> ya celebrada y sin enviar · gris: prevista. La monitora o la tutora pulsan «Enviar a Víctor» al terminar.</p>' +
    G.map(fila).join('') + '</div>';
}
const _rReunionesBase = rReuniones;
rReuniones = function () { return (esMon() ? '' : rQuincenalesCoord()) + _rReunionesBase(); };

// ─── PDF informativo para las familias que no vinieron a la reunión ───
function docFamilias(id) {
  const r = D.reuniones[id], g = r.grupo && D.grupos[r.grupo];
  if (!g) return toast('Pon el grupo en la reunión (Editar) para hacer el PDF', 'err');
  const base = location.href.replace(/[^/]*$/, ''), fse = LOGO_FSE.startsWith('data:') ? LOGO_FSE : base + LOGO_FSE, tri = trimestreActual(), S = saberes(g, tri), c = cursoNum(g);
  const ini = new Date((g.inicio || (startY(CURSO) + '-10-26')) + 'T12:00'), fl = f => new Date(f + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const otros = (r.acuerdos || '').split('\n').map(x => x.replace(/^\d+\.\s*/, '').trim()).filter(x => x && !/presentaci|días y horario|autorizaci|justificaci|ruegos/i.test(x));
  const caja = (ico, tit, html, col) => '<section class="caja" style="--c:' + col + '"><h3><span>' + ico + '</span>' + tit + '</h3>' + html + '</section>';
  const html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Acompañamiento Escolar · Información para las familias · ' + esc(g.nombre) + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"><style>' +
    '@page{size:A4;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font-family:Nunito,Arial,sans-serif;color:#1c2638;margin:0;background:#e9eef7;font-size:9.6pt;line-height:1.32}' +
    '.pag{background:#fff;width:210mm;min-height:297mm;margin:12px auto;padding:8mm 10mm;position:relative}' +
    '.top{display:flex;align-items:center;gap:12px}.top img.cole{height:62px}.top .t{flex:1}.top h1{margin:0;font-size:20pt;font-weight:900;color:#1f3f7a;line-height:1.05}.top p{margin:3px 0 0;color:#5d6b82;font-weight:700}' +
    '.fse{display:block;width:62%;margin:4px auto 8px}' +
    '.hola{background:linear-gradient(135deg,#e8effc,#f3ecfd);border-radius:14px;padding:8px 13px;margin-bottom:8px}.hola b{color:#1f3f7a}' +
    '.grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.ancha{grid-column:1/-1}' +
    '.caja{border:2px solid var(--c);border-radius:14px;padding:6px 11px;break-inside:avoid}.caja h3{margin:0 0 4px;font-size:12pt;font-weight:900;color:var(--c);display:flex;gap:6px;align-items:center}.caja p{margin:3px 0}.caja ul{margin:3px 0 0 18px;padding:0}.caja li{margin:1px 0}' +
    '.dato{display:flex;gap:8px;align-items:baseline}.dato b{min-width:84px;color:#1f3f7a}' +
    '.big{font-size:15pt;font-weight:900;color:#1f3f7a}.dos{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.pie{margin-top:8px;display:flex;justify-content:space-between;align-items:flex-end;gap:12px;font-size:9.5pt;color:#5d6b82}.firma{text-align:right;color:#1c2638}' +
    '.recorte{margin-top:8px;border-top:2px dashed #9aa7bd;padding-top:8px;font-size:9.5pt}.recorte .l{border-bottom:1px solid #9aa7bd;display:inline-block;min-width:200px;height:14px}' +
    '.bar{text-align:center;padding:10px;font-family:Arial}.bar button{font-size:15px;padding:8px 14px;cursor:pointer}@media print{body{background:#fff}.pag{margin:0;width:auto;min-height:0;padding:10mm;-webkit-box-decoration-break:clone;box-decoration-break:clone}.bar{display:none}}' +
    '</style></head><body><div class="bar"><button onclick="print()">🖨️ Imprimir o guardar en PDF</button></div><div class="pag">' +
    '<div class="top"><img class="cole" src="' + (LOGO_COLE.startsWith('data:') ? LOGO_COLE : base + LOGO_COLE) + '" alt="CEIP Capitulaciones"><div class="t"><h1>Acompañamiento Escolar</h1><p>PROA Andalucía · ' + esc(g.nombre) + ' (' + c + '.º de Primaria) · Curso ' + CURSO.replace('-', '/20') + '</p></div></div>' +
    '<img class="fse" src="' + fse + '" alt="Cofinanciado por la Unión Europea · Fondos Europeos · Junta de Andalucía">' +
    '<div class="hola">👋 <b>Querida familia:</b> vuestro hijo o hija ha sido <b>seleccionado</b> para participar en el Acompañamiento Escolar. Son unas pocas plazas que el colegio da a quien más le puede ayudar. <b>¡Es una gran oportunidad!</b> Aquí tenéis todo lo que necesitáis saber.</div>' +
    '<div class="grid">' +
    caja('🌟', '¿Qué es?', '<p>Clases <b>gratuitas</b> en el colegio, por la tarde, en <b>grupos pequeños</b>, para mejorar en <b>lectura, escritura, cálculo y resolución de problemas</b>, y aprender a organizarse y a estudiar.</p><p>Está cofinanciado por el Fondo Social Europeo Plus (FSE+) y la Junta de Andalucía.</p>', '#2f5fb3') +
    caja('🗓️', '¿Cuándo y dónde?', '<div class="dato"><b>Días</b><span class="big">' + esc(diasTxt(g)) + '</span></div><div class="dato"><b>Horario</b><span class="big">' + esc((g.hi || '16:00') + ' a ' + (g.hf || '18:00')) + '</span></div><div class="dato"><b>Lugar</b><span>En el colegio</span></div><div class="dato"><b>Desde</b><span>el ' + esc(fl(iso(ini))) + ' hasta el 31 de mayo</span></div>', '#0f8a7e') +
    caja('💪', '¿Por qué es tan importante?', '<div class="dos"><ul><li>En un grupo pequeño se atiende a cada niño o niña <b>de uno en uno</b> y se refuerza justo lo que más le cuesta.</li><li>Leer bien y calcular bien es la base de <b>todas las asignaturas</b>: cuando mejora aquí, mejora en clase.</li><li>Gana <b>confianza</b>, hábitos de estudio y ganas de aprender.</li></ul><ul><li>Lo que se trabaja va <b>de la mano de su clase</b>: la persona del Acompañamiento y su tutor o tutora se coordinan cada quince días.</li><li>Es una ayuda <b>gratuita</b> que en una academia costaría mucho dinero.</li><li><b>Solo funciona si viene todos los días.</b> Cada tarde que falta es una oportunidad perdida que no se recupera.</li></ul></div>', '#b86e00').replace('class="caja"', 'class="caja ancha"') +
    caja('⏰', 'Asistir todos los días', '<ul><li><b>Hay que venir todos los días</b> que toca y <b>llegar a la hora</b>.</li><li>A las <b>' + esc(g.hf || '18:00') + '</b> hay que <b>recoger</b> al alumno o alumna en la puerta del colegio, puntualmente.</li><li>Las sesiones que no se dan <b>no se recuperan</b>.</li></ul>', '#d9622b') +
    caja('📝', 'Si falta un día', '<ul><li>Hay que <b>justificar la falta por escrito</b> (os damos la hoja: Anexo XIII) y entregarla al día siguiente.</li><li>Si hay <b>muchas faltas sin justificar</b>, el alumno o alumna puede <b>perder su plaza</b> (Anexo VIII) y se le da a otro niño o niña que la necesita.</li></ul>', '#c93838') +
    caja('📚', 'Qué vamos a trabajar este trimestre', '<p><b>Lengua:</b> ' + S[0].map(esc).join(' · ') + '.</p><p><b>Matemáticas:</b> ' + S[1].map(esc).join(' · ') + '.</p><p style="margin-top:3px">También les ayudamos con las <b>tareas de clase</b>, en coordinación con su tutor o tutora.</p>', '#7a4fc9').replace('class="caja"', 'class="caja ancha"') +
    caja('✍️', 'Autorización y contacto', '<p>Devolved <b>firmada</b> la autorización para participar (Anexo VI) y comprobad que el colegio tiene vuestro <b>teléfono</b> actualizado. Para cualquier duda: tutor o tutora, iPasen o dirección.</p>', '#1f9d55').replace('class="caja"', 'class="caja ancha"') +
    '</div>' +
    '<div class="pie"><span>CEIP Capitulaciones · Santa Fe (Granada) · Código 18008853</span><span class="firma">Un saludo,<br><b>Víctor Manuel Única Salas</b><br>Director</span></div>' +
    '<div class="recorte">✂️ <b>Devolver al colegio:</b> He recibido la información del Acompañamiento Escolar. Alumno/a: <span class="l"></span> &nbsp; Firma de la familia: <span class="l" style="min-width:140px"></span></div>' +
    '</div></body></html>';
  const w = window.open('', '_blank'); if (!w) return toast('Permite las ventanas emergentes para ver el PDF', 'err');
  w.document.write(html); w.document.close();
}

document.addEventListener('click', async e => {
  const q = e.target.closest('[data-qenv]'), f = e.target.closest('[data-fampdf]');
  if (f) return docFamilias(f.dataset.fampdf);
  if (!q) return;
  e.stopPropagation();
  const id = q.dataset.qenv;
  try { toast('⏳ Preparando el acta…'); await cerrarSala(id); acta(id); render(); }
  catch (er) { console.warn(er); toast('No se ha podido leer la reunión', 'err'); }
}, true);
