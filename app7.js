// ─── Alumnado desde Séneca: siglas en la nube, nombres completos solo en este dispositivo ───
const PART = ['de', 'del', 'la', 'las', 'los', 'y', 'da', 'di'];
function parseSeneca(txt) {
  return String(txt || '').split('\n').map(l => l.replace(/\t/g, ' ').trim())
    .filter(l => l && l.includes(',') && !/^(alumno|n[úu]mero total)/i.test(l))
    .map(l => { const [ap, no] = l.split(',').map(x => x.trim().replace(/\s+/g, ' ')); return { ap, no }; })
    .filter(x => x.ap && x.no);
}
function siglasDe(no, ap) {
  return (no + ' ' + ap).split(' ').filter(p => p && !PART.includes(p.toLowerCase())).map(p => p[0].toUpperCase() + '.').join('');
}
function dlgPegarLista() {
  const g = D.grupos[grupoSel]; if (!g) return;
  $('dlgIn').innerHTML = '<h2>📋 Pegar lista de Séneca · ' + esc(g.nombre) + '</h2>' +
    '<p class="small muted">Copia de Séneca la lista del alumnado seleccionado («Apellidos, Nombre», uno por línea) y pégala aquí. En la nube solo se guardan las <b>siglas</b>; los nombres completos se quedan <b>solo en este dispositivo</b> y salen en los anexos oficiales.</p>' +
    '<textarea id="plT" rows="10" placeholder="García López, Ana&#10;Pérez Ruiz, Luis&#10;…"></textarea><div id="plV" class="small" style="margin-top:6px"></div>' +
    '<div class="pie"><button class="btn sec" id="plC">Cancelar</button><button class="btn" id="plOk">Añadir al grupo</button></div>';
  if (!$('dlg').open) $('dlg').showModal();
  const ver = () => { const L = parseSeneca($('plT').value); $('plV').innerHTML = L.length ? '<b>' + L.length + '</b> alumnos/as: ' + L.map(x => esc(siglasDe(x.no, x.ap))).join(', ') + avisoTam(L.length) : ''; };
  $('plT').oninput = ver;
  $('plC').onclick = () => $('dlg').close();
  $('plOk').onclick = () => {
    const L = parseSeneca($('plT').value); if (!L.length) return toast('No encuentro nombres con el formato «Apellidos, Nombre»', 'err');
    const r = anadirLista(grupoSel, L); $('dlg').close(); toast(r.nuevos + ' añadidos' + (r.ya ? ', ' + r.ya + ' ya estaban' : '')); render();
  };
}
const normS = s => String(s || '').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/g, '').toUpperCase();
function anadirLista(gid, L) {
  const g = D.grupos[gid], N = nombres(gid), A = Object.entries(g.alumnos || {}), curso = CURSO_G(g) || '';
  let nuevos = 0, ya = 0;
  L.forEach(x => {
    const full = x.no + ' ' + x.ap;
    if (Object.values(N).some(n => n.toLowerCase() === full.toLowerCase())) { ya++; return; }
    let s = siglasDe(x.no, x.ap);
    // Alumno ya creado a mano (con o sin puntos) y sin nombre: se le pone el nombre y se le arreglan las siglas
    const libre = A.find(([aid, a]) => normS(a.siglas) === normS(s) && !N[aid]);
    if (libre) { N[libre[0]] = full; if (libre[1].siglas !== s) guardar('grupos/' + gid + '/alumnos/' + libre[0] + '/siglas', s); ya++; return; }
    const usadas = A.map(([, a]) => a.siglas); let k = 2, base = s; while (usadas.includes(s)) s = base + k++;
    const aid = uid(); N[aid] = full; A.push([aid, { siglas: s }]);
    guardar('grupos/' + gid + '/alumnos/' + aid, { siglas: s, curso: curso, tutor: '' }); nuevos++;
  });
  // Quita duplicados: alumnos sin nombre con las mismas siglas que uno que ya lo tiene
  A.forEach(([aid, a]) => { if (!N[aid] && A.some(([b, x]) => b !== aid && N[b] && normS(x.siglas) === normS(a.siglas))) guardar('grupos/' + gid + '/alumnos/' + aid, null); });
  try { localStorage.setItem(NKEY(gid), JSON.stringify(N)); } catch (e) { }
  return { nuevos, ya };
}
// En el acta de selección: aviso y botón para pegar la lista si falta algún nombre
const _dlgActa = dlgActa;
dlgActa = function () {
  _dlgActa();
  const g = D.grupos[grupoSel], N = nombres(grupoSel), falta = Object.keys(g.alumnos || {}).filter(aid => !N[aid]).length;
  if (!falta) return;
  const d = document.createElement('div'); d.className = 'aviso';
  d.innerHTML = '⚠️ <b>' + falta + '</b> alumno/a' + (falta > 1 ? 's' : '') + ' sin nombre completo en este dispositivo: en el acta saldrían las siglas. Escríbelos abajo o <button class="btn peq" data-acc7="pegar">📋 Pega la lista de Séneca</button>';
  const h = $('dlgIn').querySelector('h2'); h.after(d);
};
// Pegar el alumnado de TODOS los grupos de una vez (una línea con el nombre del grupo y debajo su lista)
const GRUPO_RX = { Tercero: /\b(tercero|3\.?º?)\b/i, Cuarto: /\b(cuarto|4\.?º?)\b/i, Quinto: /\b(quinto|5\.?º?)\b/i, Sexto: /\b(sexto|6\.?º?)\b/i };
function parseTodo(txt) {
  const out = {}; let cur = null;
  String(txt || '').split('\n').map(l => l.replace(/\t/g, ' ').trim()).filter(Boolean).forEach(l => {
    if (!l.includes(',') || /:/.test(l)) { const k = Object.keys(GRUPO_RX).find(k => GRUPO_RX[k].test(l)); if (k) { cur = k; out[k] = out[k] || []; } if (!l.includes(',')) return; }
    if (!cur || /^(alumno|n[úu]mero total)/i.test(l)) return;
    const L = parseSeneca(l); if (L.length) out[cur].push(L[0]);
  });
  return out;
}
function dlgPegarTodo() {
  const G = Object.entries(D.grupos || {});
  if (!G.length) return toast('Crea primero los grupos', 'err');
  $('dlgIn').innerHTML = '<h2>📋 Pegar el alumnado de todos los grupos</h2>' +
    '<p class="small muted">Pega todo de una vez: una línea con el grupo (Tercero, Cuarto, Quinto, Sexto) y debajo su lista de Séneca («Apellidos, Nombre»). En la nube solo van las <b>siglas</b>; los nombres completos se quedan <b>solo en este dispositivo</b>.</p>' +
    '<textarea id="ptT" rows="12" placeholder="Tercero&#10;García López, Ana&#10;Pérez Ruiz, Luis&#10;Cuarto&#10;…"></textarea><div id="ptV" class="small" style="margin-top:6px"></div>' +
    '<div class="pie"><button class="btn sec" id="ptC">Cancelar</button><button class="btn" id="ptOk">Añadir a los grupos</button></div>';
  if (!$('dlg').open) $('dlg').showModal();
  const idDe = nom => (G.find(([, g]) => g.nombre === nom) || [])[0];
  const ver = () => { const P = parseTodo($('ptT').value); $('ptV').innerHTML = Object.entries(P).map(([k, L]) => '<div><b>' + k + '</b>: ' + L.length + ' alumnos/as' + (idDe(k) ? '' : ' <span style="color:#c00">(no existe ese grupo)</span>') + avisoTam(L.length) + '</div>').join(''); };
  $('ptT').oninput = ver;
  $('ptC').onclick = () => $('dlg').close();
  $('ptOk').onclick = () => {
    const P = parseTodo($('ptT').value); let n = 0, y = 0;
    Object.entries(P).forEach(([k, L]) => { const gid = idDe(k); if (gid && L.length) { const r = anadirLista(gid, L); n += r.nuevos; y += r.ya; } });
    if (!n && !y) return toast('No encuentro alumnado. Revisa el formato.', 'err');
    $('dlg').close(); toast(n + ' añadidos' + (y ? ', ' + y + ' ya estaban' : '')); render();
  };
}
function avisoTam(n) {
  if (!n || n >= 8) return '';
  return '<div class="aviso" style="margin-top:6px">⚠️ Este grupo tiene <b>' + n + '</b> alumnos/as: falta' + (8 - n > 1 ? 'n ' : ' ') + (8 - n) + ' para llegar al mínimo de 8.</div>';
}
// Copia de seguridad de los nombres (para pasarlos a otro dispositivo sin subirlos a la nube)
function exportarNombres() {
  const out = {}; Object.keys(localStorage).filter(k => k.startsWith('programas-nombres-')).forEach(k => out[k] = localStorage.getItem(k));
  if (!Object.keys(out).length) return toast('No hay nombres guardados en este dispositivo', 'err');
  const b = new Blob([JSON.stringify(out)], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = 'nombres-proa-' + hoyIso() + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Copia descargada. Guárdala en lugar seguro (no la subas a ningún sitio público).');
}
function importarNombres() {
  const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
  i.onchange = () => { const f = i.files[0]; if (!f) return; f.text().then(t => {
    let n = 0; try { const o = JSON.parse(t); Object.entries(o).forEach(([k, v]) => { if (k.startsWith('programas-nombres-')) { localStorage.setItem(k, v); n++; } }); } catch (e) { return toast('Ese archivo no es una copia de nombres', 'err'); }
    toast(n ? 'Nombres cargados en este dispositivo' : 'El archivo no tenía nombres', n ? '' : 'err'); render();
  }); };
  i.click();
}
// Se añade al bloque de documentos del grupo
const _rDocsGrupo = rDocsGrupo;
rDocsGrupo = function (g, A) {
  const N = nombres(grupoSel), sin = A.filter(([aid]) => !N[aid]).length;
  const extra = '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)"><b>Alumnado con nombre completo</b>' + avisoTam(A.length) +
    '<p class="small muted">' + (A.length ? (A.length - sin) + ' de ' + A.length + ' con nombre en este dispositivo.' : 'Aún no hay alumnado.') + ' En la nube solo van las siglas.</p>' +
    '<button class="btn peq" data-acc7="pegar">📋 Pegar lista de Séneca</button> <button class="btn sec peq" data-acc7="exp">💾 Copia de nombres</button> <button class="btn sec peq" data-acc7="imp">📂 Cargar copia</button></div>';
  return _rDocsGrupo(g, A).replace(/<\/div>$/, extra + '</div>');
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-acc7]'); if (!t) return;
  ({ todo: dlgPegarTodo, pegar: dlgPegarLista, exp: exportarNombres, imp: importarNombres }[t.dataset.acc7] || (() => { }))();
});
