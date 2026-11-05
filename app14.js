// ─── Firmas de las hojas del mes: una firma distinta en cada hueco, con trazo de bolígrafo ───
// Las instrucciones del PROA no admiten una firma copiada en todos los huecos: cada sesión se firma
// por separado (una vez para el Anexo X y otra para el Anexo XII), mejor el mismo día al acabar.
// Las firmas se guardan solo en este dispositivo, aparte de la hoja del mes.
'use strict';
const FIRKEY = (gid, mes) => FKEY(gid, mes) + '-firmas';
const firmasDe = (gid, mes) => { try { return JSON.parse(localStorage.getItem(FIRKEY(gid, mes)) || '{}'); } catch (e) { return {}; } };
// La hoja del mes con la firma de cada sesión dentro
function hojaConFirmas(gid, mes, R) {
  const H = JSON.parse(JSON.stringify(rellenoMon(gid, mes) || R || { dias: {} })), Fi = firmasDe(gid, mes);
  Object.keys(H.dias || {}).forEach(f => { if (Fi[f]) Object.assign(H.dias[f], Fi[f]); });
  H.firma = ''; return H;
}

// Trazo de bolígrafo: tinta azul, curvas suaves y grosor que cambia con la velocidad y la presión
function trazoBoli(cv) {
  const cx = cv.getContext('2d'); let pts = [], hay = false, ancho = 2.2;
  cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = 'rgba(20,35,140,.92)';
  const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * cv.width / b.width, y: (e.clientY - b.top) * cv.height / b.height, t: performance.now(), p: e.pressure || .5 }; };
  cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); pts = [pos(e)]; hay = true; ancho = 2.2; e.preventDefault(); };
  cv.onpointermove = e => {
    if (!pts.length) return; e.preventDefault();
    const p = pos(e), a = pts[pts.length - 1], d = Math.hypot(p.x - a.x, p.y - a.y); if (d < 1.2) return;
    const v = d / Math.max(1, p.t - a.t), presion = e.pointerType === 'pen' ? .6 + p.p : 1;
    const objetivo = Math.max(1.1, Math.min(3.4, (3.2 - v * 1.1) * presion));
    ancho = ancho * .7 + objetivo * .3;
    pts.push(p);
    if (pts.length >= 3) {
      const [p0, p1, p2] = pts.slice(-3), m1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }, m2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      cx.lineWidth = ancho; cx.beginPath(); cx.moveTo(m1.x, m1.y); cx.quadraticCurveTo(p1.x, p1.y, m2.x, m2.y); cx.stroke();
    } else { cx.lineWidth = ancho; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(p.x, p.y); cx.stroke(); }
  };
  cv.onpointerup = cv.onpointercancel = () => { if (pts.length === 1) { cx.fillStyle = cx.strokeStyle; cx.beginPath(); cx.arc(pts[0].x, pts[0].y, 1.4, 0, 7); cx.fill(); } pts = []; };
  return { hay: () => hay, borrar: () => { cx.clearRect(0, 0, cv.width, cv.height); hay = false; } };
}
// Recorta los bordes vacíos y reduce la firma para guardarla
function firmaPng(cv) {
  const cx = cv.getContext('2d'), { width: W, height: H } = cv, d = cx.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 <= x0) return cv.toDataURL('image/png');
  const m = 8; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(W, x1 + m); y1 = Math.min(H, y1 + m);
  const k = Math.min(1, 90 / (y1 - y0)), o = document.createElement('canvas'); o.width = Math.round((x1 - x0) * k); o.height = Math.round((y1 - y0) * k);
  o.getContext('2d').drawImage(cv, x0, y0, x1 - x0, y1 - y0, 0, 0, o.width, o.height);
  return o.toDataURL('image/png');
}

// La firma «en el momento» (Anexo XV, programación…) también con trazo de bolígrafo
firmarAhora = function (doc, generar) {
  let d = document.getElementById('dlgFirmaYa');
  if (!d) { d = document.createElement('dialog'); d.id = 'dlgFirmaYa'; document.body.appendChild(d); }
  d.innerHTML = '<h2>✍️ Firma este documento</h2><p class="small muted">' + esc(doc) + '. Firma con el dedo o con el ratón. La firma solo se usa en este documento y no se guarda.</p>' +
    '<canvas id="fyCv" width="560" height="170" style="width:100%;height:170px;border:2px dashed var(--border);border-radius:12px;background:#fff;touch-action:none;margin-top:8px"></canvas>' +
    '<div class="pie"><button class="btn sec" id="fyB">Borrar</button><button class="btn sec" id="fyC">Cancelar</button><button class="btn" id="fyOk">Firmar y generar</button></div>';
  d.showModal();
  const cv = d.querySelector('#fyCv'), T = trazoBoli(cv);
  d.querySelector('#fyB').onclick = () => T.borrar();
  d.querySelector('#fyC').onclick = () => d.close();
  d.querySelector('#fyOk').onclick = () => {
    if (!T.hay()) return toast('Firma primero en el recuadro', 'err');
    const url = firmaPng(cv); d.close();
    _firmaTmp = url; try { generar(url); } finally { _firmaTmp = ''; }
  };
};

// Firma de una sesión: dos firmas seguidas, una para cada anexo
function firmarSesion(gid, mes, f, alAcabar) {
  let d = document.getElementById('dlgFirmaDia');
  if (!d) { d = document.createElement('dialog'); d.id = 'dlgFirmaDia'; document.body.appendChild(d); }
  const dia = new Date(f + 'T12:00'), txt = DSEM[dia.getDay()] + ' ' + dia.getDate() + ' de ' + MESES[dia.getMonth()];
  const paso = (n) => {
    const cual = n === 1 ? 'Anexo X (asistencia del monitor/a)' : 'Anexo XII (ausencias del alumnado)';
    d.innerHTML = '<h2>✍️ Firma de la sesión del ' + esc(txt) + '</h2><p class="small muted">Firma ' + n + ' de 2 · <b>' + cual + '</b>. Cada hueco lleva su propia firma: fírmalo de nuevo aunque sea igual.</p>' +
      '<canvas width="560" height="170" style="width:100%;height:170px;border:2px dashed var(--border);border-radius:12px;background:#fff;touch-action:none;margin-top:8px"></canvas>' +
      '<div class="pie"><button class="btn sec" data-f="b">Borrar</button><button class="btn sec" data-f="c">Cancelar</button><button class="btn" data-f="ok">' + (n === 1 ? 'Siguiente →' : 'Guardar firmas') + '</button></div>';
    const cv = d.querySelector('canvas'), T = trazoBoli(cv);
    d.onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return;
      if (b.dataset.f === 'b') T.borrar();
      else if (b.dataset.f === 'c') d.close();
      else { if (!T.hay()) return toast('Firma primero en el recuadro', 'err');
        const Fi = firmasDe(gid, mes); Fi[f] = Fi[f] || {}; Fi[f][n === 1 ? 'fx' : 'fxii'] = firmaPng(cv);
        try { localStorage.setItem(FIRKEY(gid, mes), JSON.stringify(Fi)); } catch (er) { return toast('No queda espacio en el dispositivo para guardar la firma', 'err'); }
        if (n === 1) paso(2); else { d.close(); toast('✔ Sesión del ' + txt + ' firmada'); alAcabar(); } } };
  };
  if (!d.open) d.showModal(); paso(1);
}

// En «Rellenar y firmar»: un botón de firma por cada sesión dada
const _dlgRellenar14 = dlgRellenar;
dlgRellenar = function () {
  _dlgRellenar14();
  const gid = grupoSel, mes = mesResumen; if (!rellenoMon(gid, mes)) return;
  // quita el aviso antiguo de «firma al pulsar cada anexo»
  [...$('dlgIn').querySelectorAll('p.small.muted')].forEach(p => { if (/te pedirá que lo firmes/.test(p.textContent)) p.remove(); });
  const caja = document.createElement('div'); caja.id = 'firmasDias'; caja.style.marginTop = '10px';
  const pie = $('dlgIn').querySelector('.pie'); if (pie) pie.before(caja);
  const pintar = () => {
    const R = hojaConFirmas(gid, mes);
    const F = Object.keys(R.dias).sort().filter(f => R.dias[f].dada), falta = F.filter(f => !(R.dias[f].fx && R.dias[f].fxii));
    caja.innerHTML = '<b>✍️ Firmas de cada sesión</b><p class="small muted" style="margin:2px 0 6px">Las instrucciones no admiten una firma copiada: <b>firma cada sesión por separado</b>, mejor el mismo día al terminar. Se guardan solo en este dispositivo.</p>' +
      (F.length ? '<div style="display:flex;flex-wrap:wrap;gap:6px">' + F.map(f => { const ok = R.dias[f].fx && R.dias[f].fxii;
        return '<button type="button" class="btn ' + (ok ? 'sec' : '') + ' peq" data-fdia="' + f + '">' + (ok ? '✔ ' : '✍️ ') + (+f.slice(8)) + '</button>'; }).join('') + '</div>' +
        (falta.length ? '<p class="small" style="color:#b45309;margin-top:6px">Faltan por firmar: ' + falta.map(f => +f.slice(8)).join(', ') + '</p>' : '<p class="small" style="color:var(--ok);margin-top:6px">✔ Todas las sesiones firmadas</p>')
        : '<p class="small muted">Marca primero los días que se dio la sesión.</p>');
  };
  caja.onclick = e => { const b = e.target.closest('[data-fdia]'); if (!b) return;
    const f = b.dataset.fdia, x = firmasDe(gid, mes)[f] || {};
    if (x.fx && x.fxii && !confirm('Esta sesión ya está firmada. ¿Firmarla otra vez?')) return;
    firmarSesion(gid, mes, f, pintar); };
  $('dlgIn').addEventListener('change', () => setTimeout(pintar, 50));
  pintar();
};

// Ver los anexos: cada fila con la firma de su sesión (sin pedir una firma para todo el mes)
docXFirmado = (gid, mes, R) => _docXFirmado(gid, mes, hojaConFirmas(gid, mes, R));
docXIIFirmado = (gid, mes, R) => _docXIIFirmado(gid, mes, hojaConFirmas(gid, mes, R));

// Enviar a Víctor: solo cuando todas las sesiones dadas tienen sus dos firmas
enviarAnexosMon = async function (btn) {
  const gid = grupoSel, mes = mesResumen, g = D.grupos[gid], R = rellenoMon(gid, mes) ? hojaConFirmas(gid, mes) : null;
  const F = R ? Object.keys(R.dias).sort().filter(f => R.dias[f].dada) : [];
  if (!F.length) return toast('Marca al menos un día que se dio la sesión', 'err');
  const falta = F.filter(f => !(R.dias[f].fx && R.dias[f].fxii));
  if (falta.length) return toast('Faltan firmas de las sesiones: ' + falta.map(f => +f.slice(8)).join(', '), 'err');
  const R2 = R, t0 = btn.textContent; btn.disabled = true; btn.textContent = '⏳ Preparando el PDF…';
  try {
    const blob = await window.anexosAPdf([() => _docXFirmado(gid, mes, R2), () => _docXIIFirmado(gid, mes, R2)]);
    if (!blob) throw new Error('sin documento');
    const mesN = MESES[+mes.slice(5) - 1], nombre = (g.nombre + ' - Anexos X y XII - ' + mesN + ' ' + mes.slice(0, 4)).replace(/[\\/:*?"<>|]/g, '') + '.pdf';
    const file = new File([blob], nombre, { type: 'application/pdf' }), txt = 'Hola, Víctor. Te mando los Anexos X y XII de ' + g.nombre + ' (' + mesN + '), rellenos y firmados.';
    btn.disabled = false;
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      btn.textContent = '📲 Pulsa aquí: enviar por WhatsApp';
      btn.onclick = async () => { try { await navigator.share({ files: [file], text: txt }); toast('✅ Elige WhatsApp y el chat de Víctor'); } catch (e) { if (e.name !== 'AbortError') toast('No se ha podido compartir', 'err'); } btn.textContent = t0; btn.onclick = () => enviarAnexosMon(btn); };
      return;
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
    toast('PDF descargado: adjúntalo en WhatsApp (📎) en el chat de Víctor');
  } catch (e) { console.warn(e); toast('No se ha podido preparar el PDF. Usa «Ver Anexo» e imprímelo en PDF.', 'err'); }
  btn.disabled = false; if (btn.textContent.startsWith('⏳')) btn.textContent = t0;
};
