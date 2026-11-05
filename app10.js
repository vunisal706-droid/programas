// ─── Plan de Apertura: Aula matinal y Comedor · pasar lista por día y alumno/a ───
// Nube:  apertura/<srv>/alumnos/<aid> = { siglas, curso }   ·   apertura/<srv>/dias/<aaaa-mm-dd> = { _ok: true, <aid>: true }
// Nombres completos («Apellidos, Nombre»): solo en este dispositivo (programas-nombres-apertura-<srv>)
'use strict';
const SRV = { comedor: { n: 'Comedor', e: '🍽️' }, matinal: { n: 'Aula matinal', e: '☀️' } };
let gridX = 0, gridY = 0, modoApt = 'dia', srvSel = 'comedor', fechaApt = hoyIso(), mesApt = hoyIso().slice(0, 7);
PERFILES.sandra.apertura = true;
PERFILES.mercedes = { nombre: 'Mercedes', emoji: '🧑‍🍳', idea: 'proa.mercedes', rol: 'Monitora (Comedor y Aula matinal)', mon: true, apertura: true, soloApt: true, prog: [] };
// Plan de Apertura como opción más en la pantalla de entrada
PROG.APT = { n: 'Plan de Apertura', cls: 'APT', e: '🏫' }; PROG_DESC.APT = 'Usos del comedor y del aula matinal';
['victor', 'maria', 'encarna', 'sandra', 'mercedes'].forEach(k => PERFILES[k].prog.push('APT'));
pintarPerfiles();   // Sandra pasa lista del comedor y del aula matinal
const puedeApt = () => !esMon() || !!(PERFILES[PERFIL] || {}).apertura;

const AKEY = s => 'programas-nombres-apertura-' + s;
const nomsApt = s => { try { return JSON.parse(localStorage.getItem(AKEY(s)) || '{}'); } catch (e) { return {}; } };
const aptDe = s => ((D.apertura || {})[s]) || {};
const FALTA = () => srvSel === 'comedor';   // en el comedor se marca la NO asistencia; se guarda igualmente como usos
const baseDia = f => { const d = (aptDe(srvSel).dias || {})[f] || {}; if (d._ok || !FALTA()) return Object.assign({}, d); const r = {}; aluApt(srvSel).forEach(([aid, a]) => { if (activo(a, f)) r[aid] = true; }); return r; };
const ordApt = n => String(n || '').split(',').map(x => x.trim()).join('\u0001');
const aluApt = s => Object.entries(aptDe(s).alumnos || {}).map(([aid, a]) => [aid, a, nomsApt(s)[aid] || '']).sort((x, y) => ordApt(x[2] || x[1].siglas).localeCompare(ordApt(y[2] || y[1].siglas), 'es', { sensitivity: 'base' }));
const activo = (a, f) => !a.baja || f < a.baja;   // de baja desde esa fecha: deja de salir en la lista
const nomVer = (a, n) => n || a.siglas;   // «Apellidos, Nombre», como en Séneca
// Días de servicio: lunes a viernes con cole
const diaServicio = f => { cargarCalCole(); const w = new Date(f + 'T12:00').getDay(); return w > 0 && w < 6 && !sinCole(f); };
function diasMesApt(mes) { const y = +mes.slice(0, 4), m = +mes.slice(5), n = new Date(y, m, 0).getDate(), r = []; for (let d = 1; d <= n; d++) { const f = mes + '-' + pad(d); if (diaServicio(f)) r.push(f); } return r; }
const mesesCurso = () => { const y = startY(CURSO), r = []; for (let m = 9; m <= 18; m++) { const mm = ((m - 1) % 12) + 1; r.push((m > 12 ? y + 1 : y) + '-' + pad(mm)); } return r; };

RENDER.apertura = function () {
  if (!puedeApt()) return '<div class="card"><p>No tienes acceso a esta sección.</p></div>';
  const TODOS = aluApt(srvSel), A = TODOS.filter(([, a]) => activo(a, fechaApt)), ACT = TODOS.filter(([, a]) => !a.baja), BAJ = TODOS.filter(([, a]) => a.baja), dia = (aptDe(srvSel).dias || {})[fechaApt] || {}, pasado = !!dia._ok;
  let h = '<div class="card" style="border-left:5px solid #e08a1e"><div class="card-h"><h2>🏫 Plan de Apertura</h2></div>' +
    '<div class="chips">' + Object.entries(SRV).map(([k, s]) => '<button class="chip' + (k === srvSel ? ' on' : '') + '" data-apt="srv" data-v="' + k + '" style="font-size:.95rem;padding:9px 16px">' + s.e + ' ' + s.n + '</button>').join('') + '</div>';
  h += '<div class="chips">' + [['dia', '📅 Por día'], ['mes', '🗓️ Por mes completo']].map(([k, t]) => '<button class="chip' + (k === modoApt ? ' on' : '') + '" data-apt="modo" data-v="' + k + '">' + t + '</button>').join('') + '</div>';
  if (modoApt === 'mes') { h += rAptGrid(TODOS) + '</div>'; } else {
  // ── Pasar lista del día ──
  h += '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0 10px"><b>📅 Día:</b><input type="date" id="fechaApt" value="' + fechaApt + '" style="width:auto">' +
    (fechaApt !== hoyIso() ? '<button class="btn sec peq" data-apt="hoy">Hoy</button>' : '') + '</div>';
  if (!diaServicio(fechaApt)) h += '<div class="aviso">Ese día no hay servicio (fin de semana o día sin cole).</div>';
  if (window.aptSinPermiso) h += '<div class="aviso" style="border-color:var(--bad)">⛔ La nube no deja leer el Plan de Apertura con este usuario. Avisa a Víctor (hay que dar permiso en Firebase).</div>';
  else if (!A.length) h += '<div class="aviso">Todavía no hay alumnado en ' + SRV[srvSel].n.toLowerCase() + '.' + (esMon() ? ' Avisa a Víctor.' : ' Pégalo abajo desde la lista de Séneca.') + '</div>';
  else {
    const n = A.filter(([aid]) => dia[aid]).length;
    if (FALTA()) h += '<p class="small" style="margin-bottom:8px">' + (pasado ? '✔ Registrado: <b>' + n + '</b> de ' + A.length + ' han comido · <b style="color:var(--bad)">' + (A.length - n) + '</b> no han venido.' : '<span style="color:var(--bad);font-weight:800">Sin registrar todavía.</span>') + ' <b>Marca solo a quien NO ha venido</b>; el resto cuenta como que ha comido.</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px"><button class="btn" data-apt="todos" style="font-size:1rem;padding:12px 16px">' + (pasado ? '✅ Al final han venido todos' : '✅ Hoy han venido todos') + '</button></div>' +
      '<div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">' + A.map(([aid, a, nm]) => {
        const no = pasado && !dia[aid];
        return '<button data-apt="toca" data-v="' + aid + '" style="text-align:left;padding:12px 14px;border-radius:14px;border:2px solid ' + (no ? 'var(--bad)' : 'var(--border)') + ';background:' + (no ? '#fdecec' : '#fff') + ';font-weight:800;font-size:1rem;color:var(--text);min-height:54px">' +
          (no ? '❌ ' : '🍽️ ') + esc(nomVer(a, nm)) + (a.curso ? ' <small class="muted" style="font-weight:700">' + esc(a.curso) + '</small>' : '') + (no ? '<br><small style="color:var(--bad)">No ha venido</small>' : '') + '</button>';
      }).join('') + '</div>';
    else
    h += '<p class="small" style="margin-bottom:8px">' + (pasado ? '✔ Registrado: <b>' + n + '</b> de ' + A.length + ' han venido.' : '<span class="muted">Sin registrar todavía.</span>') + ' Marca a quien ha venido hoy: cada día que viene es un uso del servicio.</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px"><button class="btn" data-apt="todos" style="font-size:1rem;padding:12px 16px">✅ Han venido todos</button>' +
      '<button class="btn sec" data-apt="ninguno">Quitar a todos</button></div>' +
      '<div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">' + A.map(([aid, a, nm]) => {
        const on = !!dia[aid];
        return '<button data-apt="toca" data-v="' + aid + '" style="text-align:left;padding:12px 14px;border-radius:14px;border:2px solid ' + (on ? 'var(--ok)' : 'var(--border)') + ';background:' + (on ? 'var(--ok-soft)' : '#fff') + ';font-weight:800;font-size:1rem;color:var(--text);min-height:54px">' +
          (on ? '✅ ' : '⬜ ') + esc(nomVer(a, nm)) + (a.curso ? ' <small class="muted" style="font-weight:700">' + esc(a.curso) + '</small>' : '') + '</button>';
      }).join('') + '</div>';
  }
  h += '</div>';
  }
  // ── Resumen del mes para Séneca ──
  const dd = aptDe(srvSel).dias || {}, AM = TODOS.filter(([aid, a]) => !a.baja || Object.keys(dd).some(f => f.startsWith(mesApt) && dd[f][aid]));
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

// ── Pasar lista por mes completo: una fila por alumno/a y una casilla por día lectivo ──
function rAptGrid(TODOS) {
  const mes = mesApt, F = diasMesApt(mes), dias = aptDe(srvSel).dias || {};
  const A = TODOS.filter(([, a]) => !a.baja);
  const sel = '<select id="mesApt" style="width:auto">' + mesesCurso().map(m => '<option value="' + m + '"' + (m === mes ? ' selected' : '') + '>' + MESES[+m.slice(5) - 1] + ' ' + m.slice(0, 4) + '</option>').join('') + '</select>';
  let h = '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0 10px"><b>🗓️ Mes:</b>' + sel + '</div>';
  if (!A.length) return h + '<div class="aviso">No hay alumnado en ' + SRV[srvSel].n.toLowerCase() + ' este mes.</div>';
  if (!F.length) return h + '<div class="aviso">Este mes no hay días lectivos.</div>';
  if (FALTA()) { const sinP = F.filter(f => f <= hoyIso() && !(dias[f] || {})._ok);
    h += '<p class="small muted" style="margin-bottom:8px"><b>En el comedor se marcan las faltas:</b> pon ✔ solo el día que un alumno/a <b>NO</b> ha venido. Los días en amarillo están sin pasar; toca el número del día para darlo por pasado (vinieron todos). «Usos» cuenta los días que ha comido. Se guarda solo.</p>' +
      (sinP.length ? '<div class="aviso">Días sin pasar: <b>' + fmtSen(sinP.map(f => +f.slice(8))) + '</b> <button type="button" class="btn sec peq" data-apt="sinpasar">✅ En esos días vinieron todos</button></div>' : ''); }
  else h += '<p class="small muted" style="margin-bottom:8px">Marca los días que ha venido cada alumno/a (cada día es un uso del servicio). Toca el número de un día para marcarlo o quitarlo a todos; «Todo» (al final de cada fila) marca o quita el mes entero de ese alumno/a. Se guarda solo.</p>';
  setTimeout(() => { const g = $('gridApt'); if (g) { g.scrollLeft = gridX; g.scrollTop = gridY; } }, 0);
  h += '<style>#gridApt{max-height:72vh;overflow:auto;border:1px solid var(--border);border-radius:12px}#gridApt th{position:sticky;top:0;background:#eef3fb;z-index:2;box-shadow:0 1px 0 var(--border)}#gridApt th:first-child{left:0;z-index:3}#gridApt tr:nth-child(even) td{background:#f7f9fd}#gridApt td:first-child{background:#fff}</style>' +
    '<div class="tabla" id="gridApt" onscroll="gridX=this.scrollLeft;gridY=this.scrollTop"><table style="font-size:.85rem"><tr><th>Alumno/a</th>' +
    F.map(f => '<th class="c"><button type="button" class="chip" data-apt="col" data-v="' + f + '" style="padding:2px 7px' + (FALTA() && f <= hoyIso() && !(dias[f] || {})._ok ? ';background:#fff3c4;border-color:#e0b100' : '') + '" title="' + esc(fechaCorta(f)) + '">' + +f.slice(8) + '</button><br><small class="muted">' + 'DLMXJVS'[new Date(f + 'T12:00').getDay()] + '</small></th>').join('') + '<th>Usos</th><th></th></tr>' +
    A.map(([aid, a, nm]) => {
      const vale = f => activo(a, f), n = F.filter(f => (dias[f] || {})[aid]).length;
      return '<tr><td style="position:sticky;left:0;z-index:1;min-width:120px;max-width:150px;font-size:.8rem;line-height:1.2"><b>' + esc(nomVer(a, nm)) + '</b>' + (a.baja ? ' <small class="muted">baja ' + +a.baja.slice(8) + '/' + +a.baja.slice(5, 7) + '</small>' : '') + '</td>' +
        F.map(f => '<td class="c" title="' + esc(fechaCorta(f)) + '"><input type="checkbox" data-aptc="' + aid + '|' + f + '"' + ((FALTA() ? (dias[f] || {})._ok && !(dias[f] || {})[aid] : (dias[f] || {})[aid]) ? ' checked' : '') + (vale(f) ? '' : ' disabled') + ' style="width:20px;height:20px"></td>').join('') +
        '<td class="c"><b>' + n + '</b></td><td><button type="button" class="btn sec peq" data-apt="fila" data-v="' + aid + '">Todo</button></td></tr>';
    }).join('') + '</table></div>';
  return h;
}
function marcarMes(cambios) {   // cambios: [[fecha, aid, bool], …]
  const D2 = aptDe(srvSel).dias || {}, porDia = {};
  cambios.forEach(([f, aid, v]) => { (porDia[f] = porDia[f] || baseDia(f))[aid] = v; });
  Object.entries(porDia).forEach(([f, d]) => { d._ok = true; Object.keys(d).forEach(k => { if (!d[k]) delete d[k]; }); guardar('apertura/' + srvSel + '/dias/' + f, d); });
  render();
}

function rAptMes(A) {
  const dias = aptDe(srvSel).dias || {}, mes = mesApt, previstos = diasMesApt(mes).filter(f => f <= hoyIso());
  const pasados = Object.keys(dias).filter(f => f.startsWith(mes) && dias[f]._ok).sort();
  const sinPasar = previstos.filter(f => !pasados.includes(f));
  const usos = aid => pasados.filter(f => dias[f][aid]).map(f => +f.slice(8));
  const sel = '<select id="mesApt" style="width:auto">' + mesesCurso().map(m => '<option value="' + m + '"' + (m === mes ? ' selected' : '') + '>' + MESES[+m.slice(5) - 1] + ' ' + m.slice(0, 4) + '</option>').join('') + '</select>';
  let h = '<div class="card" style="border-left:5px solid var(--ok)"><div class="card-h"><h2>🟢 Para grabar en Séneca · ' + esc(SRV[srvSel].n) + '</h2>' + sel + '</div>';
  h = h.replace('</h2>' + sel, '</h2><span style="display:flex;gap:8px;flex-wrap:wrap">' + sel + '<button class="btn sec" data-apt="pdf">📄 PDF del mes</button></span>');
  h += '<p class="small">Días registrados: <b>' + (fmtSen(pasados.map(f => +f.slice(8))) || '—') + '</b>' + (sinPasar.length ? ' · <span style="color:var(--bad)">sin pasar: ' + fmtSen(sinPasar.map(f => +f.slice(8))) + '</span>' : '') + '</p>';
  if (!pasados.length) return h + '<p class="small muted">Este mes todavía no hay usos registrados.</p></div>';
  const todos = fmtSen(pasados.map(f => +f.slice(8))), iguales = A.every(([aid]) => fmtSen(usos(aid)) === todos);
  if (!esMon()) h += iguales ? '<div class="aviso verde">Todos vinieron todos los días: en «Usos del servicio» pega <b>' + todos + '</b> y pulsa «Aplicar a todos/as los/as alumnos/as de esta página».</div>'
    : '<div class="aviso">Hay alumnos/as que faltaron algún día: usa «Copiar alumnado» y el favorito, o pega a cada uno su línea.</div>';
  h += '<div class="tabla"><table><tr><th>Alumno/a</th><th>Días que vino (formato Séneca)</th><th>N.º de usos</th><th></th></tr>' + A.map(([aid, a, nm]) => {
    const t = fmtSen(usos(aid));
    return '<tr><td>' + esc(nm || a.siglas) + '</td><td><b style="letter-spacing:.5px">' + (t || '<span class="muted">ninguno</span>') + '</b></td><td class="c">' + usos(aid).length + '</td><td>' + (t && !esMon() ? '<button class="btn sec peq" data-copiar9="' + t + '">📋 Copiar</button>' : '') + '</td></tr>';
  }).join('') + '</table></div>';
  if (!esMon()) {
    const txt = A.filter(([aid]) => usos(aid).length).map(([aid, a, nm]) => (nm || a.siglas) + '\t' + fmtSen(usos(aid))).join('\n');
    h += '<div style="margin-top:8px"><b>Del tirón:</b> <button class="btn sec peq" data-copiar9="' + esc(txt) + '" data-msg="Alumnado copiado: pulsa el favorito en Séneca">📋 Copiar alumnado</button> <button class="btn sec peq" data-copiar9="' + todos + '" data-msg="Días copiados">📋 Copiar días del servicio</button></div>' + bloqueMarcAsis();
  }
  return h + '</div>';
}

function pdfUsos() {
  const dd = aptDe(srvSel).dias || {}, mes = mesApt, mesN = MESES[+mes.slice(5) - 1] + ' de ' + mes.slice(0, 4);
  const F = Object.keys(dd).filter(f => f.startsWith(mes) && dd[f]._ok).sort();
  const A = aluApt(srvSel).filter(([aid, a]) => !a.baja || F.some(f => dd[f][aid]));
  const us = aid => F.filter(f => dd[f][aid]).map(f => +f.slice(8));
  let tot = 0;
  const filas = A.map(([aid, a, nm], i) => { const u = us(aid); tot += u.length; return [String(i + 1), esc(nm || a.siglas), esc(a.curso || ''), u.length ? fmtSen(u).replace(/,/g, ', ') : '—', '<b>' + u.length + '</b>']; });
  const cuerpo = '<p><b>Servicio:</b> ' + esc(SRV[srvSel].n) + ' &nbsp;·&nbsp; <b>Mes:</b> ' + esc(mesN) + ' &nbsp;·&nbsp; <b>Días de servicio registrados:</b> ' + F.length + '</p>' +
    tabla(['N.º', 'Alumno/a', 'Curso', 'Días que asistió', 'Usos'], filas) +
    '<p style="margin-top:10px"><b>Total de usos del mes:</b> ' + tot + ' · <b>Alumnado:</b> ' + A.length + '</p>' +
    '<p style="margin-top:30px;text-align:right">En Santa Fe, a</p><p style="margin-top:50px;text-align:right">Fdo.: Víctor Manuel Única Salas<br>Director</p>';
  abrirDoc('Usos del servicio de ' + SRV[srvSel].n.toLowerCase() + ' · ' + mesN, cuerpo, 'APT');
}
function guardarDia(cambios) {
  const base = 'apertura/' + srvSel + '/dias/' + fechaApt, dia = Object.assign(baseDia(fechaApt), cambios, { _ok: true });
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
  $('paT').oninput = () => { const L = leer(); $('paV').innerHTML = L.length ? '<b>' + L.length + '</b> alumnos/as: ' + L.map(x => esc(x.ap + ', ' + x.no)).join(', ') : ''; };
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
    case 'pdf': pdfUsos(); break;
    case 'modo': modoApt = v; render(); break;
    case 'col': if (FALTA()) { const T = aluApt(srvSel).filter(([, a]) => activo(a, v)); marcarMes(T.map(([aid]) => [v, aid, true])); toast('Día pasado: vinieron todos'); break; } { const T = aluApt(srvSel).filter(([, a]) => activo(a, v)), d = (aptDe(srvSel).dias || {})[v] || {}, on = !T.every(([aid]) => d[aid]); marcarMes(T.map(([aid]) => [v, aid, on])); break; }
    case 'fila': { const al = aluApt(srvSel).find(([x]) => x === v); if (!al) break; const F = diasMesApt(mesApt).filter(f => activo(al[1], f) && f <= hoyIso()), dd = aptDe(srvSel).dias || {}, on = FALTA() ? F.some(f => (dd[f] || {})._ok && !(dd[f] || {})[v]) : !F.every(f => (dd[f] || {})[v]); marcarMes(F.map(f => [f, v, on])); break; }
    case 'hoy': fechaApt = hoyIso(); render(); break;
    case 'toca': { const dia = baseDia(fechaApt); guardarDia({ [v]: !dia[v] }); break; }
    case 'sinpasar': { const c = []; diasMesApt(mesApt).filter(f => f <= hoyIso() && !((aptDe(srvSel).dias || {})[f] || {})._ok).forEach(f => aluApt(srvSel).forEach(([aid, a]) => { if (activo(a, f)) c.push([f, aid, true]); })); marcarMes(c); toast('Días pasados'); break; }
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
  if (e.target.dataset && e.target.dataset.aptc) { const [aid, f] = e.target.dataset.aptc.split('|'); marcarMes([[f, aid, FALTA() ? !e.target.checked : e.target.checked]]); return; }
  if (e.target.id === 'fechaApt' && e.target.value) { fechaApt = e.target.value; render(); }
  if (e.target.id === 'mesApt') { mesApt = e.target.value; render(); }
});

// Datos: los monitores con acceso también escuchan «apertura»
const _conectarMon10 = conectarMon;
conectarMon = function () {
  if ((PERFILES[PERFIL] || {}).soloApt) { refsMon.forEach(r => r.off()); refsMon = []; } else _conectarMon10();
  if (!puedeApt()) return;
  const r = db.ref(BASE + '/apertura'); refsMon.push(r);
  r.on('value', s => { window.aptSinPermiso = false; D.apertura = s.val() || {}; cachear(); if (!editando()) render(); }, e => { console.warn(e); window.aptSinPermiso = true; render(); toast('Sin permiso para el Plan de Apertura. Avisa a dirección.', 'err'); });
};
// Pestaña visible para Sandra
const _abrir10 = abrir;
abrir = function (p) {
  _abrir10(p); document.body.classList.toggle('apt', !!(PERFILES[p] || {}).apertura); document.body.classList.toggle('soloapt', !!(PERFILES[p] || {}).soloApt);
  if ((PERFILES[p] || {}).soloApt && progAcc !== 'APT') { progAcc = 'APT'; }
  if (progAcc === 'APT' && puedeApt()) { if (esMon()) $('tituloApp').innerHTML = 'Plan de Apertura<small>Usos del servicio · ' + esc(PERFILES[p].nombre) + '</small>'; irA('apertura'); }
};
