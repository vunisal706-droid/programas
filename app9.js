// ─── Asistencia del mes en formato Séneca (días separados por comas, sin espacios) ───
// Nube: informes/<grupo>/_asis/<aaaa-mm> = { doc: [días], alu: { aid: [días] }, por, ts }  (solo ids y números de día, sin nombres)
const asisDe = (gid, mes) => ((((D.informes || {})[gid] || {})._asis || {})[mes]) || null;
const fmtSen = L => (L || []).slice().sort((a, b) => a - b).join(',');
const previstosHastaHoy = (g, mes) => diasPrevistos(g, mes).filter(f => f <= hoyIso()).map(f => +f.slice(8));
PERFILES.sandra.asis = ['Tercero', 'Cuarto', 'Quinto'];   // Sandra pasa la asistencia de estos tres grupos
const puedeAsis = g => !esMon() || g.monitor === PERFIL || ((PERFILES[PERFIL] || {}).asis || []).includes(g.nombre);

function rAsistencia(g, selMes) {
  const gid = grupoSel, mes = mesResumen, A = Object.entries(g.alumnos || {}).sort((a, b) => (a[1].siglas || '').localeCompare(b[1].siglas || ''));
  const X = asisDe(gid, mes), prev = previstosHastaHoy(g, mes), mesN = MESES[+mes.slice(5) - 1];
  const editable = puedeAsis(g), coord = !esMon();
  let h = '<div class="card" style="border-left:5px solid var(--ok)"><div class="card-h"><h2>✅ Asistencia de ' + esc(mesN) + '</h2>' + (selMes || '') + '</div>';
  h += '<p class="small">Días previstos hasta hoy: <b>' + (fmtSen(prev) || '—') + '</b></p>';
  if (editable) h += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:10px 0">' +
    '<button class="btn" data-acc9="todo"' + (prev.length ? '' : ' disabled') + ' style="font-size:1rem;padding:12px 16px">✅ Todos los días previstos: vino el monitor/a y todo el alumnado</button>' +
    '<button class="btn sec" data-acc9="editar">✏️ Editar (alguien faltó)</button></div>';
  if (!X) return h + '<p class="small muted">Todavía no hay asistencia guardada este mes.</p></div>';
  const fila = (nom, L) => { const t = fmtSen(L); return '<tr><td>' + esc(nom) + '</td><td><b style="font-size:1.05rem;letter-spacing:.5px">' + (t || '<span class="muted">ninguno</span>') + '</b></td><td>' + (t ? '<button class="btn sec peq" data-copiar9="' + t + '">📋 Copiar</button>' : '') + '</td></tr>'; };
  h += '<p class="small muted" style="margin-top:6px">Guardado' + (X.por && PERFILES[X.por] ? ' por ' + esc(PERFILES[X.por].nombre) : '') + '. ' + (coord ? 'Copia cada línea y pégala tal cual en Séneca.' : '') + '</p>';
  h += '<div class="tabla"><table><tr><th>' + (coord ? 'En Séneca' : 'Quién') + '</th><th>Días</th><th></th></tr>' +
    fila('Asistencia del empleado/a · ' + (g.docente || 'monitor/a'), X.doc) +
    A.map(([aid, a]) => fila(nombreDe(gid, aid, a), (X.alu || {})[aid])).join('') + '</table></div>';
  if (coord) {
    const todos = A.length && A.every(([aid]) => fmtSen((X.alu || {})[aid]) === fmtSen(X.doc));
    h += todos ? '<div class="aviso verde">Vino todo el alumnado los mismos días que el monitor/a: en «Usos del servicio» pega <b>' + fmtSen(X.doc) + '</b> y pulsa «Aplicar a todos/as los/as alumnos/as de esta página».</div>'
      : '<div class="aviso">Hay alumnos/as con faltas: pega a cada uno su línea en «Usos del servicio».</div>';
  }
  return h + '</div>';
}

function guardarAsis(gid, mes, doc, alu) {
  guardar('informes/' + gid + '/_asis/' + mes, { doc: doc.slice().sort((a, b) => a - b), alu, por: PERFIL, ts: Date.now() });
}
function asisTodo(gid) {
  gid = gid || grupoSel; const g = D.grupos[gid], prev = previstosHastaHoy(g, mesResumen); if (!prev.length) return toast('No hay días previstos todavía este mes', 'err');
  const alu = {}; Object.keys(g.alumnos || {}).forEach(aid => alu[aid] = prev.slice());
  guardarAsis(gid, mesResumen, prev, alu); toast(g.nombre + ': asistencia guardada (' + fmtSen(prev) + ')'); render();
}
function asisEditar(gid) {
  gid = gid || grupoSel; const g = D.grupos[gid], mes = mesResumen, X = asisDe(gid, mes);
  const A = Object.entries(g.alumnos || {}).sort((a, b) => (a[1].siglas || '').localeCompare(b[1].siglas || ''));
  const prev = diasPrevistos(g, mes).map(f => +f.slice(8));
  const dias = [...new Set(prev.concat(X ? X.doc || [] : []).concat(X ? [].concat(...Object.values(X.alu || {})) : []))].sort((a, b) => a - b);
  const hoyD = hoyIso().startsWith(mes) ? +hoyIso().slice(8) : 99;
  const marcado = (L, d) => X ? (L || []).includes(d) : (prev.includes(d) && d <= hoyD);
  const filas = [['doc', '🧑‍🏫 ' + (g.docente || 'Monitor/a'), X ? X.doc : null]].concat(A.map(([aid, a]) => [aid, nombreDe(gid, aid, a), X ? (X.alu || {})[aid] : null]));
  $('dlgIn').innerHTML = '<h2>✏️ Asistencia · ' + esc(g.nombre) + ' · ' + esc(MESES[+mes.slice(5) - 1]) + '</h2><p class="small muted">Quita la marca a quien faltó ese día. Toca el número de un día para marcarlo o quitarlo a todos.</p>' +
    '<div class="tabla"><table><tr><th></th>' + dias.map(d => '<th><button type="button" class="chip" data-col="' + d + '" style="padding:2px 8px">' + d + '</button></th>').join('') + '</tr>' +
    filas.map(([k, nom, L]) => '<tr><td style="white-space:nowrap"><b>' + esc(nom) + '</b></td>' + dias.map(d => '<td class="c"><input type="checkbox" data-as="' + k + '|' + d + '"' + (marcado(L, d) ? ' checked' : '') + ' style="width:20px;height:20px"></td>').join('') + '</tr>').join('') + '</table></div>' +
    '<div class="pie"><button class="btn sec" id="asC">Cancelar</button><button class="btn" id="asOk">Guardar asistencia</button></div>';
  $('dlg').showModal();
  $('dlgIn').onclick = e => { const c = e.target.closest('[data-col]'); if (!c) return; const bx = [...$('dlgIn').querySelectorAll('[data-as$="|' + c.dataset.col + '"]')], v = !bx.every(x => x.checked); bx.forEach(x => x.checked = v); };
  $('asC').onclick = () => $('dlg').close();
  $('asOk').onclick = () => {
    const doc = [], alu = {}; A.forEach(([aid]) => alu[aid] = []);
    $('dlgIn').querySelectorAll('[data-as]').forEach(x => { if (!x.checked) return; const [k, d] = x.dataset.as.split('|'); (k === 'doc' ? doc : alu[k]).push(+d); });
    guardarAsis(gid, mes, doc, alu); $('dlg').close(); toast('Asistencia guardada'); render();
  };
}

// Monitores: arriba de sus hojas del mes · Coordinación: arriba de «Sesiones dadas»
const _rHojasMon9 = rHojasMon; rHojasMon = (g, A, selMes) => ((PERFILES[PERFIL] || {}).asis ? '' : rAsistencia(g, selMes)) + _rHojasMon9(g, A, selMes);
const _rSesiones9 = rSesiones; rSesiones = (g, selMes) => rAsistencia(g, selMes) + _rSesiones9(g, selMes);

document.addEventListener('click', e => {
  const c = e.target.closest('[data-copiar9]');
  if (c) { const t = c.dataset.copiar9; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Copiado: ' + t)).catch(() => toast('No se pudo copiar: selecciona y copia ' + t, 'err')); return; }
  const b = e.target.closest('[data-acc9]'); if (!b) return;
  ({ todo: asisTodo, editar: asisEditar }[b.dataset.acc9] || (() => { }))(b.dataset.gid);
});

// Tarjeta con todos los grupos de los que pasa asistencia (Sandra: Tercero, Cuarto y Quinto)
const _rAcomp9 = rAcomp;
rAcomp = function () {
  const html = _rAcomp9(), L = (PERFILES[PERFIL] || {}).asis;
  if (!L || !esMon()) return html;
  mesResumen = mesResumen || hoyIso().slice(0, 7);
  const G = L.map(n => Object.entries(D.grupos || {}).find(([, g]) => g.nombre === n)).filter(Boolean);
  if (!G.length) return html;
  const mes = mesResumen, mesN = MESES[+mes.slice(5) - 1];
  const selM = '<select id="mesAsis9" style="width:auto">' + mesesProg().map(m => '<option value="' + m + '"' + (m === mes ? ' selected' : '') + '>' + MESES[+m.slice(5) - 1] + ' ' + m.slice(0, 4) + '</option>').join('') + '</select>';
  const card = '<div class="card" style="border-left:5px solid var(--ok)"><div class="card-h"><h2>✅ Asistencia de ' + esc(mesN) + ' · tus grupos</h2>' + selM + '</div>' +
    '<p class="small muted">Si viniste tú y todo el alumnado todos los días previstos, pulsa el botón verde de ese grupo. Si alguien faltó, «Editar».</p>' +
    '<div style="display:grid;gap:10px;margin-top:8px">' + G.map(([gid, g]) => {
      const X = asisDe(gid, mes), prev = previstosHastaHoy(g, mes), A = Object.keys(g.alumnos || {});
      const faltas = X ? A.filter(aid => fmtSen((X.alu || {})[aid]) !== fmtSen(X.doc)).length : 0;
      return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 12px;border:2px solid var(--border);border-radius:14px;background:' + (X ? 'var(--ok-soft)' : '#fff') + '">' +
        '<div style="flex:1;min-width:170px"><b style="font-size:1.05rem">' + esc(g.nombre) + '</b><br><span class="small ' + (X ? '' : 'muted') + '">' + (X ? '✔ Guardada: ' + (fmtSen(X.doc) || 'ningún día') + (faltas ? ' · ' + faltas + ' con faltas' : ' · todos vinieron') : 'Sin guardar · previstos: ' + (fmtSen(prev) || '—')) + '</span></div>' +
        '<button class="btn" data-acc9="todo" data-gid="' + gid + '"' + (prev.length ? '' : ' disabled') + '>✅ Todos los días</button>' +
        '<button class="btn sec" data-acc9="editar" data-gid="' + gid + '">✏️ Editar</button></div>';
    }).join('') + '</div></div>';
  // la colocamos justo después de la tarjeta de cabecera
  const fin = html.indexOf('<div class="card"', html.indexOf('PROA Andalucía · Acompañamiento'));
  return fin > 0 ? html.slice(0, fin) + card + html.slice(fin) : card + html;
};

document.addEventListener('change', e => { if (e.target.id === 'mesAsis9') { mesResumen = e.target.value; render(); } });
