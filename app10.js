// ─── Plan de Apertura: Aula matinal y Comedor · pasar lista por día y alumno/a ───
// Nube:  apertura/<srv>/alumnos/<aid> = { siglas, curso }   ·   apertura/<srv>/dias/<aaaa-mm-dd> = { _ok: true, <aid>: true }
// Nombres completos («Apellidos, Nombre»): solo en este dispositivo (programas-nombres-apertura-<srv>)
'use strict';
const SRV = { comedor: { n: 'Comedor', e: '🍽️' }, matinal: { n: 'Aula matinal', e: '☀️' } };
let srvSel = 'comedor', fechaApt = hoyIso(), mesApt = hoyIso().slice(0, 7);
PERFILES.sandra.apertura = true;   // Sandra pasa lista del comedor y del aula matinal
const puedeApt = () => !esMon() || !!(PERFILES[PERFIL] || {}).apertura;

const AKEY = s => 'programas-nombres-apertura-' + s;
const nomsApt = s => { try { return JSON.parse(localStorage.getItem(AKEY(s)) || '{}'); } catch (e) { return {}; } };
const aptDe = s => ((D.apertura || {})[s]) || {};
const aluApt = s => Object.entries(aptDe(s).alumnos || {}).map(([aid, a]) => [aid, a, nomsApt(s)[aid] || '']).sort((x, y) => (x[2] || x[1].siglas || '').localeCompare(y[2] || y[1].siglas || '', 'es'));
const activo = (a, f) => !a.baja || f < a.baja;   // de baja desde esa fecha: deja de salir en la lista
const nomVer = (a, n) => n ? n.split(',').reverse().map(x => x.trim()).join(' ') : a.siglas;
// Días de servicio: lunes a viernes con cole
const diaServicio = f => { cargarCalCole(); const w = new Date(f + 'T12:00').getDay(); return w > 0 && w < 6 && !sinCole(f); };
function diasMesApt(mes) { const y = +mes.slice(0, 4), m = +mes.slice(5), n = new Date(y, m, 0).getDate(), r = []; for (let d = 1; d <= n; d++) { const f = mes + '-' + pad(d); if (diaServicio(f)) r.push(f); } return r; }
const mesesCurso = () => { const y = startY(CURSO), r = []; for (let m = 9; m <= 18; m++) { const mm = ((m - 1) % 12) + 1; r.push((m > 12 ? y + 1 : y) + '-' + pad(mm)); } return r; };

RENDER.apertura = function () {
  if (!puedeApt()) return '<div class="card"><p>No tienes acceso a esta sección.</p></div>';
  const TODOS = aluApt(srvSel), A = TODOS.filter(([, a]) => activo(a, fechaApt)), ACT = TODOS.filter(([, a]) => !a.baja), BAJ = TODOS.filter(([, a]) => a.baja), dia = (aptDe(srvSel).dias || {})[fechaApt] || {}, pasado = !!dia._ok;
  let h = '<div class="card" style="border-left:5px solid #e08a1e"><div class="card-h"><h2>🏫 Plan de Apertura</h2></div>' +
    '<div class="chips">' + Object.entries(SRV).map(([k, s]) => '<button class="chip' + (k === srvSel ? ' on' : '') + '" data-apt="srv" data-v="' + k + '" style="font-size:.95rem;padding:9px 16px">' + s.e + ' ' + s.n + '</button>').join('') + '</div>';
  // ── Pasar lista del día ──
  h += '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0 10px"><b>📅 Día:</b><input type="date" id="fechaApt" value="' + fechaApt + '" style="width:auto">' +
    (fechaApt !== hoyIso() ? '<button class="btn sec peq" data-apt="hoy">Hoy</button>' : '') + '</div>';
  if (!diaServicio(fechaApt)) h += '<div class="aviso">Ese día no hay servicio (fin de semana o día sin cole).</div>';
  if (!A.length) h += '<div class="aviso">Todavía no hay alumnado en ' + SRV[srvSel].n.toLowerCase() + '.' + (esMon() ? ' Avisa a Víctor.' : ' Pégalo abajo desde la lista de Séneca.') + '</div>';
  else {
    const n = A.filter(([aid]) => dia[aid]).length;
    h += '<p class="small" style="margin-bottom:8px">' + (pasado ? '✔ Lista pasada: <b>' + n + '</b> de ' + A.length + ' han venido.' : '<span class="muted">Sin pasar todavía.</span>') + ' Toca a cada alumno/a para marcar si ha venido.</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px"><button class="btn" data-apt="todos" style="font-size:1rem;padding:12px 16px">✅ Han venido todos</button>' +
      '<button class="btn sec" data-apt="ninguno">Quitar a todos</button></div>' +
      '<div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">' + A.map(([aid, a, nm]) => {
        const on = !!dia[aid];
        return '<button data-apt="toca" data-v="' + aid + '" style="text-align:left;padding:12px 14px;border-radius:14px;border:2px solid ' + (on ? 'var(--ok)' : 'var(--border)') + ';background:' + (on ? 'var(--ok-soft)' : '#fff') + ';font-weight:800;font-size:1rem;color:var(--text);min-height:54px">' +
          (on ? '✅ ' : '⬜ ') + esc(nomVer(a, nm)) + (a.curso ? ' <small class="muted" style="font-weight:700">' + esc(a.curso) + '</small>' : '') + '</button>';
      }).join('') + '</div>';
  }
  h += '</div>';
  // ── Resumen del mes para Séneca ──
  const AM = TODOS.filter(([, a]) => !a.baja || a.baja > mesApt + '-01');
  if (AM.length) h += rAptMes(AM);
  // ── Alumnado ──
  h += '<div class="card"><div class="card-h"><h2>👧 Alumnado de ' + esc(SRV[srvSel].n.toLowerCase()) + ' (' + ACT.length + ')</h2></div>';
  if (!esMon()) h += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px"><button class="btn" data-apt="pegar">📋 Pegar lista de Séneca</button><button class="btn sec" data-apt="nuevo">➕ Añadir a mano</button></div>';
  h += '<p class="small muted">En la nube solo van las siglas; los nombres completos se quedan en este dispositivo. Para tenerlos en otro móvil (el de Sandra): «Copia de nombres» aquí y «Cargar nombres» allí.</p>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:8px 0"><button class="btn sec peq" data-apt="exp">💾 Copia de nombres</button><button class="btn sec peq" data-apt="imp">📂 Cargar nombres</button></div>';
  if (ACT.length && !esMon()) h += '<div class="tabla"><table><tr><th>Alumno/a</th><th>Siglas</th><th>Curso</th><th></th></tr>' + ACT.map(([aid, a, nm]) => '<tr><td>' + esc(nm || '—') + '</td><td>' + esc(a.siglas) + '</td><td>' + esc(a.curso || '') + '</td><td><button class="btn sec peq" data-apt="baja" data-v="' + aid + '">🚪 Dar de baja</button></td></tr>').join('') + '</table></div>';
  if (BAJ.length && !esMon()) h += '<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:800">🚪 Dados de baja (' + BAJ.length + ')</summary><p class="small muted" style="margin:6px 0">Ya no salen al pasar lista. Sus días de antes de la baja se mantienen para Séneca.</p><div class="tabla"><table><tr><th>Alumno/a</th><th>Baja desde</th><th></th></tr>' + BAJ.map(([aid, a, nm]) => '<tr><td>' + esc(nm || a.siglas) + '</td><td>' + esc(fechaCorta(a.baja)) + '</td><td style="white-space:nowrap"><button class="btn sec peq" data-apt="alta" data-v="' + aid + '">↩️ Volver a dar de alta</button> <button class="btn sec peq" data-apt="borrar" data-v="' + aid + '">🗑️ Borrar del todo</button></td></tr>').join('') + '</table></div></details>';
  return h + '</div>';
};

function rAptMes(A) {
  const dias = aptDe(srvSel).dias || {}, mes = mesApt, previstos = diasMesApt(mes).filter(f => f <= hoyIso());
  const pasados = Object.keys(dias).filter(f => f.startsWith(mes) && dias[f]._ok).sort();
  const sinPasar = previstos.filter(f => !pasados.includes(f));
  const usos = aid => pasados.filter(f => dias[f][aid]).map(f => +f.slice(8));
  const sel = '<select id="mesApt" style="width:auto">' + mesesCurso().map(m => '<option value="' + m + '"' + (m === mes ? ' selected' : '') + '>' + MESES[+m.slice(5) - 1] + ' ' + m.slice(0, 4) + '</option>').join('') + '</select>';
  let h = '<div class="card" style="border-left:5px solid var(--ok)"><div class="card-h"><h2>🟢 Para grabar en Séneca · ' + esc(SRV[srvSel].n) + '</h2>' + sel + '</div>';
  h += '<p class="small">Días con lista pasada: <b>' + (fmtSen(pasados.map(f => +f.slice(8))) || '—') + '</b>' + (sinPasar.length ? ' · <span style="color:var(--bad)">sin pasar: ' + fmtSen(sinPasar.map(f => +f.slice(8))) + '</span>' : '') + '</p>';
  if (!pasados.length) return h + '<p class="small muted">Este mes todavía no se ha pasado lista.</p></div>';
  const todos = fmtSen(pasados.map(f => +f.slice(8))), iguales = A.every(([aid]) => fmtSen(usos(aid)) === todos);
  if (!esMon()) h += iguales ? '<div class="aviso verde">Todos vinieron todos los días: en «Usos del servicio» pega <b>' + todos + '</b> y pulsa «Aplicar a todos/as los/as alumnos/as de esta página».</div>'
    : '<div class="aviso">Hay alumnos/as que faltaron algún día: usa «Copiar alumnado» y el favorito, o pega a cada uno su línea.</div>';
  h += '<div class="tabla"><table><tr><th>Alumno/a</th><th>Días (formato Séneca)</th><th>Usos</th><th></th></tr>' + A.map(([aid, a, nm]) => {
    const t = fmtSen(usos(aid));
    return '<tr><td>' + esc(nm || a.siglas) + '</td><td><b style="letter-spacing:.5px">' + (t || '<span class="muted">ninguno</span>') + '</b></td><td class="c">' + usos(aid).length + '</td><td>' + (t && !esMon() ? '<button class="btn sec peq" data-copiar9="' + t + '">📋 Copiar</button>' : '') + '</td></tr>';
  }).join('') + '</table></div>';
  if (!esMon()) {
    const txt = A.filter(([aid]) => usos(aid).length).map(([aid, a, nm]) => (nm || a.siglas) + '\t' + fmtSen(usos(aid))).join('\n');
    h += '<div style="margin-top:8px"><b>Del tirón:</b> <button class="btn sec peq" data-copiar9="' + esc(txt) + '" data-msg="Alumnado copiado: pulsa el favorito en Séneca">📋 Copiar alumnado</button> <button class="btn sec peq" data-copiar9="' + todos + '" data-msg="Días copiados">📋 Copiar días del servicio</button></div>' + bloqueMarcAsis();
  }
  return h + '</div>';
}

function guardarDia(cambios) {
  const base = 'apertura/' + srvSel + '/dias/' + fechaApt, dia = Object.assign({}, (aptDe(srvSel).dias || {})[fechaApt] || {}, cambios, { _ok: true });
  Object.keys(dia).forEach(k => { if (!dia[k]) delete dia[k]; });
  guardar(base, dia); render();
}
function dlgPegarApt() {
  $('dlgIn').innerHTML = '<h2>📋 Pegar lista de Séneca · ' + esc(SRV[srvSel].n) + '</h2>' +
    '<p class="small muted">Copia de Séneca los usuarios del servicio («Apellidos, Nombre», uno por línea; si la línea trae el curso, se recoge) y pégalos aquí. En la nube solo van las siglas.</p>' +
    '<textarea id="paT" rows="10" placeholder="García López, Ana&#10;Pérez Ruiz, Luis&#10;…"></textarea><div id="paV" class="small" style="margin-top:6px"></div>' +
    '<div class="pie"><button class="btn sec" id="paC">Cancelar</button><button class="btn" id="paOk">Añadir</button></div>';
  $('dlg').showModal();
  const leer = () => String($('paT').value || '').split('\n').map(l => l.trim()).filter(l => l.includes(',') && !/^(alumno|n[úu]mero total)/i.test(l)).map(l => {
    const cel = l.split('\t').map(x => x.trim()), nom = cel.find(x => x.includes(',')) || '';
    const cur = (cel.filter(x => x !== nom).join(' ').match(/\b[1-6]\s*º?\.?\s*(de\s*)?(E\.?\s*P\.?|Prim\w*|Inf\w*)|\b[3-5]\s*años/i) || [])[0] || '';
    const [ap, rest] = nom.split(','); const no = (rest || '').replace(/\b\d.*$/, '').trim().replace(/\s+/g, ' ');
    return { ap: ap.trim().replace(/\s+/g, ' '), no, curso: cur.trim() };
  }).filter(x => x.ap && x.no);
  $('paT').oninput = () => { const L = leer(); $('paV').innerHTML = L.length ? '<b>' + L.length + '</b> alumnos/as: ' + L.map(x => esc(x.no + ' ' + x.ap)).join(', ') : ''; };
  $('paC').onclick = () => $('dlg').close();
  $('paOk').onclick = () => {
    const L = leer(); if (!L.length) return toast('No encuentro nombres con el formato «Apellidos, Nombre»', 'err');
    const N = nomsApt(srvSel), A = Object.entries(aptDe(srvSel).alumnos || {}); let nuevos = 0, ya = 0;
    L.forEach(x => {
      const full = x.ap + ', ' + x.no;
      if (Object.values(N).some(n => normS(n) === normS(full))) { ya++; return; }
      let s = siglasDe(x.no, x.ap); const base = s; let k = 2; while (A.some(([, a]) => a.siglas === s)) s = base + k++;
      const aid = uid(); N[aid] = full; A.push([aid, { siglas: s }]);
      guardar('apertura/' + srvSel + '/alumnos/' + aid, { siglas: s, curso: x.curso }); nuevos++;
    });
    try { localStorage.setItem(AKEY(srvSel), JSON.stringify(N)); } catch (e) { }
    $('dlg').close(); toast(nuevos + ' añadidos' + (ya ? ', ' + ya + ' ya estaban' : '')); render();
  };
}
function dlgNuevoApt() {
  $('dlgIn').innerHTML = '<h2>➕ Añadir a ' + esc(SRV[srvSel].n.toLowerCase()) + '</h2><label>Apellidos</label><input id="naAp"><label>Nombre</label><input id="naNo"><label>Curso</label><input id="naCu" placeholder="Ej.: 2.º">' +
    '<div class="pie"><button class="btn sec" id="naC">Cancelar</button><button class="btn" id="naOk">Añadir</button></div>';
  $('dlg').showModal(); $('naC').onclick = () => $('dlg').close();
  $('naOk').onclick = () => {
    const ap = $('naAp').value.trim(), no = $('naNo').value.trim(); if (!ap || !no) return toast('Escribe apellidos y nombre', 'err');
    const N = nomsApt(srvSel), aid = uid(); N[aid] = ap + ', ' + no; try { localStorage.setItem(AKEY(srvSel), JSON.stringify(N)); } catch (e) { }
    guardar('apertura/' + srvSel + '/alumnos/' + aid, { siglas: siglasDe(no, ap), curso: $('naCu').value.trim() }); $('dlg').close(); render();
  };
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-apt]'); if (!b || seccion !== 'apertura') return;
  const v = b.dataset.v, A = aluApt(srvSel);
  switch (b.dataset.apt) {
    case 'srv': srvSel = v; render(); break;
    case 'hoy': fechaApt = hoyIso(); render(); break;
    case 'toca': { const dia = (aptDe(srvSel).dias || {})[fechaApt] || {}; guardarDia({ [v]: !dia[v] }); break; }
    case 'todos': { const c = {}; A.forEach(([aid]) => c[aid] = true); guardarDia(c); toast('Han venido todos'); break; }
    case 'ninguno': { const c = {}; A.forEach(([aid]) => c[aid] = false); guardarDia(c); break; }
    case 'pegar': dlgPegarApt(); break;
    case 'nuevo': dlgNuevoApt(); break;
    case 'exp': exportarNombres(); break;
    case 'imp': importarNombres(); break;
    case 'baja': { const f = prompt('¿Desde qué día deja el servicio? (ya no saldrá al pasar lista)', hoyIso()); if (!f || !/^\d{4}-\d{2}-\d{2}$/.test(f.trim())) { if (f) toast('Escribe la fecha así: ' + hoyIso(), 'err'); break; }
      guardar('apertura/' + srvSel + '/alumnos/' + v + '/baja', f.trim()); toast('Dado/a de baja'); render(); break; }
    case 'alta': guardar('apertura/' + srvSel + '/alumnos/' + v + '/baja', null); toast('De nuevo en la lista'); render(); break;
    case 'borrar': if (confirm('¿Borrar del todo a este alumno/a? Se pierden también sus días guardados (también los de meses pasados).')) {
      guardar('apertura/' + srvSel + '/alumnos/' + v, null);
      Object.entries(aptDe(srvSel).dias || {}).forEach(([f, d]) => { if (d[v]) guardar('apertura/' + srvSel + '/dias/' + f + '/' + v, null); });
      const N = nomsApt(srvSel); delete N[v]; try { localStorage.setItem(AKEY(srvSel), JSON.stringify(N)); } catch (x) { } render();
    } break;
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'fechaApt' && e.target.value) { fechaApt = e.target.value; render(); }
  if (e.target.id === 'mesApt') { mesApt = e.target.value; render(); }
});

// Datos: los monitores con acceso también escuchan «apertura»
const _conectarMon10 = conectarMon;
conectarMon = function () {
  _conectarMon10();
  if (!puedeApt()) return;
  const r = db.ref(BASE + '/apertura'); refsMon.push(r);
  r.on('value', s => { D.apertura = s.val() || {}; cachear(); if (!editando()) render(); }, e => { console.warn(e); toast('Sin permiso para el Plan de Apertura. Avisa a dirección.', 'err'); });
};
// Pestaña visible para Sandra
const _abrir10 = abrir;
abrir = function (p) { _abrir10(p); document.body.classList.toggle('apt', !!(PERFILES[p] || {}).apertura); };
