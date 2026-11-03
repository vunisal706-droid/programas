// ─── Firma en el momento: cada documento se firma con el dedo al generarlo. No se guarda ninguna firma ───
let _firmaTmp = '';
firmaGrupo = function () { return _firmaTmp || ''; };

function firmarAhora(doc, generar) {
  let d = document.getElementById('dlgFirmaYa');
  if (!d) { d = document.createElement('dialog'); d.id = 'dlgFirmaYa'; document.body.appendChild(d); }
  d.innerHTML = '<h2>✍️ Firma este documento</h2><p class="small muted">' + esc(doc) + '. Firma con el dedo o con el ratón. La firma solo se usa en este documento y no se guarda.</p>' +
    '<canvas id="fyCv" width="560" height="170" style="width:100%;height:170px;border:2px dashed var(--border);border-radius:12px;background:#fff;touch-action:none;margin-top:8px"></canvas>' +
    '<div class="pie"><button class="btn sec" id="fyB">Borrar</button><button class="btn sec" id="fyC">Cancelar</button><button class="btn" id="fyOk">Firmar y generar</button></div>';
  d.showModal();
  const cv = d.querySelector('#fyCv'), cx = cv.getContext('2d'); cx.lineWidth = 2.4; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = '#1a237e';
  let pinta = false, hay = false;
  const pos = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * cv.width / b.width, (e.clientY - b.top) * cv.height / b.height]; };
  cv.onpointerdown = e => { pinta = true; hay = true; cv.setPointerCapture(e.pointerId); const [x, y] = pos(e); cx.beginPath(); cx.moveTo(x, y); e.preventDefault(); };
  cv.onpointermove = e => { if (!pinta) return; const [x, y] = pos(e); cx.lineTo(x, y); cx.stroke(); e.preventDefault(); };
  cv.onpointerup = cv.onpointercancel = () => { pinta = false; };
  d.querySelector('#fyB').onclick = () => { cx.clearRect(0, 0, cv.width, cv.height); hay = false; };
  d.querySelector('#fyC').onclick = () => d.close();
  d.querySelector('#fyOk').onclick = () => {
    if (!hay) return toast('Firma primero en el recuadro', 'err');
    const url = cv.toDataURL('image/png'); d.close();
    _firmaTmp = url; try { generar(url); } finally { _firmaTmp = ''; }
  };
}

// Anexo X y XII de las hojas del mes (monitores)
const _docXFirmado = docXFirmado, _docXIIFirmado = docXIIFirmado;
docXFirmado = (gid, mes, R) => firmarAhora('Anexo X · hoja de firma del mes', url => _docXFirmado(gid, mes, Object.assign({}, R, { firma: url })));
docXIIFirmado = (gid, mes, R) => firmarAhora('Anexo XII · ausencias del mes', url => _docXIIFirmado(gid, mes, Object.assign({}, R, { firma: url })));

// Informe trimestral (Anexo XV) y programación: firma el monitor/a al generarlos
const _docAnexoXV = docAnexoXV, _docProg = docProg;
docAnexoXV = (...a) => esMonitor() ? firmarAhora('Anexo XV · informe trimestral', () => _docAnexoXV(...a)) : _docAnexoXV(...a);
docProg = (...a) => esMonitor() ? firmarAhora('Programación del grupo', () => _docProg(...a)) : _docProg(...a);

// La ventana de las hojas del mes ya no lleva recuadro de firma
const _dlgRellenar = dlgRellenar;
dlgRellenar = function () {
  _dlgRellenar();
  const cv = $('firmaCv'); if (cv) { const l = cv.previousElementSibling; if (l && l.tagName === 'LABEL') l.remove(); cv.remove(); }
  const b = $('firmaBorrar'); if (b) b.parentElement.remove();
  const p = document.createElement('p'); p.className = 'small muted'; p.style.marginTop = '8px'; p.textContent = 'Al pulsar cada anexo te pedirá que lo firmes con el dedo en ese momento.';
  const pie = $('dlgIn').querySelector('.pie'); if (pie) pie.before(p);
};

// Borra las firmas guardadas de antes (en el dispositivo y en la nube)
function limpiarFirmas() {
  try { localStorage.removeItem('programas-firma-mia'); Object.keys(localStorage).filter(k => k.startsWith('programas-firma-')).forEach(k => { try { const R = JSON.parse(localStorage.getItem(k)); if (R && R.firma) { delete R.firma; localStorage.setItem(k, JSON.stringify(R)); } } catch (e) { } }); } catch (e) { }
  if (esMonitor()) Object.entries(D.informes || {}).forEach(([gid, i]) => { if (i && i._firma && (D.grupos[gid] || {}).monitor === PERFIL) guardar('informes/' + gid + '/_firma', null); });
}
rFirmaMon = function () {
  limpiarFirmas();
  return '<div class="card"><div class="card-h"><h2>✍️ Firma</h2></div><p class="small muted">Cada documento se firma <b>en el momento</b>: al descargar la hoja del mes, el informe trimestral o la programación, te pedirá tu firma con el dedo. No se guarda ninguna firma.</p></div>';
};

// ─── Instalar «Programas» como app propia ───
(function () {
  const yaInstalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (yaInstalada) return;
  const box = $('instalar'), btn = $('instBtn'), txt = $('instTxt'); if (!box) return;
  let ev = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); ev = e; box.style.display = ''; });
  window.addEventListener('appinstalled', () => { box.style.display = 'none'; toast('App instalada'); });
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) { box.style.display = ''; btn.style.display = 'none'; txt.innerHTML = 'En Safari pulsa <b>Compartir</b> (el cuadrado con la flecha) y después <b>«Añadir a pantalla de inicio»</b>.'; }
  btn.onclick = async () => { if (!ev) return toast('Abre el menú del navegador (⋮) y pulsa «Instalar aplicación»'); ev.prompt(); await ev.userChoice; ev = null; box.style.display = 'none'; };
})();
