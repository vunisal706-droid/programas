// Programas del cole · ZTS, PROA Andalucía y PROA+ Transfórmate
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const hoyIso = () => iso(new Date());
const fechaCorta = s => { const d = new Date(s + 'T12:00'); return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }); };
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function toast(m, tipo) { const t = $('toast'); t.textContent = m; t.className = tipo || ''; t.style.display = 'block'; clearTimeout(toast._t); toast._t = setTimeout(() => t.style.display = 'none', 2600); }
function cursoAcDe(isoF) { const d = new Date(isoF + 'T12:00'); const y = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; return y + '-' + String(y + 1).slice(2); }
const startY = c => +c.slice(0, 4);
const yDeMes = (c, m) => m >= 9 ? startY(c) : startY(c) + 1;
const PROG = { ZTS: { n: 'Programa ZTS', cls: 'ZTS', e: '🌱' }, PROA: { n: 'PROA Andalucía', cls: 'PROA', e: '🧑‍🏫' }, 'PROA+': { n: 'PROA+ Transfórmate', cls: 'PROAp', e: '🎯' } };
const tagProg = p => '<span class="tag t-' + PROG[p].cls + '">' + esc(PROG[p].n) + '</span>';
const EUROS = { B: 20, A: 23 };

const PERFILES = {
  victor:    { nombre: 'Víctor',          emoji: '👨‍🏫', idea: 'vunisal706', rol: 'Dirección', prog: ['ZTS', 'PROA', 'PROA+'] },
  maria:     { nombre: 'María Rodríguez', emoji: '👩‍🏫', idea: 'mrodrod323', rol: 'Jefatura de estudios', prog: ['ZTS', 'PROA', 'PROA+'] },
  encarna:   { nombre: 'Encarna',         emoji: '👩‍🏫', idea: 'emunrom369', rol: 'Equipo directivo', prog: ['ZTS', 'PROA', 'PROA+'] },
  miriam:    { nombre: 'Miriam',          emoji: '🌱', idea: 'mromrod681', rol: 'Coordinación ZTS', prog: ['ZTS', 'PROA+'] },
  cristina:  { nombre: 'Cristina',        emoji: '🌱', idea: 'cmolmar422', rol: 'Maestra ZTS', prog: ['ZTS', 'PROA+'] },
  sandra:    { nombre: 'Sandra',          emoji: '🧑‍🏫', idea: 'proa.sandra', rol: 'Monitora (Tercero y Quinto)', mon: true, prog: ['PROA'] },
  nuria:     { nombre: 'Nuria',           emoji: '🧑‍🏫', idea: 'proa.nuria',  rol: 'Monitora (Cuarto)', mon: true, prog: ['PROA'] },
  manolo:    { nombre: 'Manolo',          emoji: '🧑‍🏫', idea: 'proa.manolo', rol: 'Profesor del grupo y tutor de 6.º', mon: true, tut: 'Sexto', prog: ['PROA'] },
  beatriz:   { nombre: 'Beatriz',         emoji: '👩‍🏫', idea: 'bgaljim320',   rol: 'Tutora de 3.º', tut: 'Tercero', prog: ['PROA'] },
  silvia:    { nombre: 'Silvia',          emoji: '👩‍🏫', idea: 'storesp740',  rol: 'Tutora de 4.º', tut: 'Cuarto', prog: ['PROA'] },
  alejandra: { nombre: 'Alejandra',       emoji: '👩‍🏫', idea: 'agarjim730', rol: 'Tutora de 5.º', tut: 'Quinto', prog: ['PROA'] }
};
const esMon = () => { const p = PERFILES[PERFIL] || {}; return !!(p.mon || p.tut); };
const esMonitor = () => !!(PERFILES[PERFIL] || {}).mon;
const esTut = () => !!(PERFILES[PERFIL] || {}).tut && !esMonitor();
const miGrupo = g => g.monitor === PERFIL || g.nombre === (PERFILES[PERFIL] || {}).tut;
const DOMINIO = '@capitulaciones.local';

// ─── Firebase (app con nombre propio para no pisar otras sesiones del dominio) ───
const fbApp = firebase.initializeApp({
  apiKey: 'AIzaSyC7NgtJ1lUecZr5LR3jK1wURfzNIakJ1-8',
  authDomain: 'gestorpt-7946b.firebaseapp.com',
  databaseURL: 'https://gestorpt-7946b-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'gestorpt-7946b',
  storageBucket: 'gestorpt-7946b.firebasestorage.app',
  messagingSenderId: '415895342026',
  appId: '1:415895342026:web:c516c24d7dc27cc89d1d33'
}, 'programas');
const db = fbApp.database();
const auth = () => fbApp.auth();

let PERFIL = null, CURSO = cursoAcDe(hoyIso()), BASE = '', ref = null, ultimoLocal = 0;
const VACIO = () => ({ hechos: {}, grupos: {}, sesiones: {}, reuniones: {}, palancas: {}, retos: {}, informes: {}, cotejo: {}, eco: {}, pem: {} });
let D = VACIO();
let seccion = 'panel', filtroPlazo = 'pend', progPlazo = '', grupoSel = null, fechaLista = hoyIso(), mesResumen = null, filtroReu = '';

const errG = e => toast('No se pudo guardar: ' + (e && e.message ? e.message : 'sin conexión'), 'err');
function guardar(ruta, val) { ultimoLocal = Date.now(); setLocal(ruta, val); cachear(); return db.ref(BASE + '/' + ruta).set(val === undefined ? null : val).catch(errG); }
function setLocal(ruta, val) { const p = ruta.split('/'); let o = D; for (let i = 0; i < p.length - 1; i++) { o[p[i]] = o[p[i]] || {}; o = o[p[i]]; } if (val == null) delete o[p[p.length - 1]]; else o[p[p.length - 1]] = val; }
const ckey = () => 'programas-cache-' + CURSO;
function cachear() { try { localStorage.setItem(ckey(), JSON.stringify(D)); } catch (e) { } }

function conectar() {
  if (ref) ref.off();
  BASE = 'programas/cursos/' + CURSO;
  D = VACIO();
  try { const c = JSON.parse(localStorage.getItem(ckey())); if (c) D = Object.assign(VACIO(), c); } catch (e) { }
  render();
  if (esMon()) return conectarMon();
  ref = db.ref(BASE);
  ref.on('value', s => {
    D = Object.assign(VACIO(), s.val() || {});
    cachear();
    if (!conectar._sync) { conectar._sync = true; setTimeout(() => syncReuniones(), 1500); }
    clearTimeout(conectar._t);
    if (Date.now() - ultimoLocal > 800 && !editando()) render();
    else conectar._t = setTimeout(() => { if (!editando()) render(); }, 1500);
  }, e => { console.warn(e); toast('Sin permiso para leer los datos. Revisa las reglas de Firebase.', 'err'); });
}
let refsMon = [];
function conectarMon() {
  refsMon.forEach(r => r.off()); refsMon = [];
  ['grupos', 'sesiones', 'informes', 'reuniones'].forEach(k => {
    const r = db.ref(BASE + '/' + k); refsMon.push(r);
    r.on('value', s => {
      D[k] = s.val() || {}; cachear();
      clearTimeout(conectarMon._t);
      if (Date.now() - ultimoLocal > 800 && !editando()) render();
      else conectarMon._t = setTimeout(() => { if (!editando()) render(); }, 1500);
    }, e => { console.warn(e); toast('Sin permiso para leer los datos. Avisa a dirección.', 'err'); });
  });
}
function editando() { const a = document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && !a.closest('#pantallaAcceso') && a.id !== 'selCurso'; }
db.ref('.info/connected').on('value', s => { $('dot').className = 'dot ' + (s.val() ? 'ok' : 'off'); $('dot').title = s.val() ? 'Conectado' : 'Sin conexión'; });

// ─── Acceso ───
let perfilSel = null;
let progAcc = null; try { progAcc = localStorage.getItem('programas-prog-acc'); } catch (e) { }
const CATS = { ed: '🏫 Equipo directivo', zts: '🌱 ZTS', mon: '🧑‍🏫 Monitoras', tut: '👩‍🏫 Tutoras' };
const catsDe = p => p.mon || p.tut ? [p.mon && 'mon', p.tut && 'tut'].filter(Boolean) : [/ZTS/.test(p.rol) ? 'zts' : 'ed'];
let catAcc = null; try { catAcc = localStorage.getItem('programas-cat-acc'); } catch (e) { }
const PROG_DESC = { ZTS: 'Zona de Transformación Social', PROA: 'Acompañamiento escolar de tarde', 'PROA+': 'Plan de mejora con fondos europeos' };
function pintarPerfiles() {
  const acc = document.querySelector('.acc'); if (progAcc) acc.dataset.prog = progAcc; else delete acc.dataset.prog;
  $('listaProg').innerHTML = Object.entries(PROG).map(([k, p]) => '<button class="op prog' + (progAcc === k ? ' on' : '') + '" data-pa="' + k + '" aria-pressed="' + (progAcc === k) + '"><span class="e">' + p.e + '</span><span><b>' + esc(p.n) + '</b><small>' + esc(PROG_DESC[k] || '') + '</small></span></button>').join('');
  const enProg = Object.entries(PERFILES).filter(([, p]) => progAcc && p.prog.includes(progAcc));
  const cats = Object.keys(CATS).filter(c => enProg.some(([, p]) => catsDe(p).includes(c)));
  if (catAcc && !cats.includes(catAcc)) catAcc = null;
  if (cats.length === 1) catAcc = cats[0];
  const n = c => enProg.filter(([, p]) => catsDe(p).includes(c)).length;
  $('listaCat').innerHTML = progAcc ? cats.map(c => { const [e, ...t] = CATS[c].split(' '); return '<button class="op cat' + (catAcc === c ? ' on' : '') + '" data-cat="' + c + '" aria-pressed="' + (catAcc === c) + '"><span class="e">' + e + '</span><span><b>' + esc(t.join(' ')) + '</b><small>' + n(c) + (n(c) === 1 ? ' persona' : ' personas') + '</small></span></button>'; }).join('') : '';
  const L = enProg.filter(([, p]) => catsDe(p).includes(catAcc));
  $('listaPerfiles').innerHTML = progAcc && catAcc ? L.map(([k, p]) => '<button class="op per' + (perfilSel === k ? ' on' : '') + '" data-p="' + k + '" aria-pressed="' + (perfilSel === k) + '"><span class="e">' + p.emoji + '</span><span><b>' + esc(p.nombre) + '</b><small>' + esc(p.rol) + '</small></span></button>').join('') : '';
  const paso = (id, hecho, activo) => { const el = $(id); el.className = 'paso' + (activo ? (hecho ? '' : ' toca') : ' espera'); };
  paso('pasoProg', !!progAcc, true); paso('pasoCat', !!catAcc, !!progAcc); paso('pasoPer', !!perfilSel, !!(progAcc && catAcc));
  $('accDatos').style.display = progAcc && catAcc && perfilSel ? '' : 'none';
}
$('listaCat').onclick = e => { const b = e.target.closest('[data-cat]'); if (!b) return; catAcc = b.dataset.cat; try { localStorage.setItem('programas-cat-acc', catAcc); } catch (x) { } if (perfilSel && !catsDe(PERFILES[perfilSel]).includes(catAcc)) perfilSel = null; pintarPerfiles(); };
$('listaProg').onclick = e => { const b = e.target.closest('[data-pa]'); if (!b) return; progAcc = b.dataset.pa; try { localStorage.setItem('programas-prog-acc', progAcc); } catch (x) { } if (perfilSel && !PERFILES[perfilSel].prog.includes(progAcc)) perfilSel = null; pintarPerfiles(); };
pintarPerfiles();
if (false) $('listaPerfiles').innerHTML = Object.entries(PERFILES).map(([k, p]) => '<button class="perfil-btn" data-p="' + k + '"><span class="e">' + p.emoji + '</span><span><b>' + esc(p.nombre) + '</b><small>' + esc(p.rol) + '</small></span></button>').join('');
$('listaPerfiles').onclick = e => { const b = e.target.closest('[data-p]'); if (!b) return; perfilSel = b.dataset.p; pintarPerfiles(); $('accIdea').focus(); };
$('accIdea').onkeydown = e => { if (e.key === 'Enter') entrar(); };
$('accEntrar').onclick = entrar;
function accError(m) { const d = $('accError'); d.textContent = m; d.style.display = 'block'; $('accEntrar').disabled = false; $('accEntrar').textContent = 'Entrar'; }
async function entrar() {
  $('accError').style.display = 'none';
  const idea = ($('accIdea').value || '').trim().toLowerCase();
  if (!perfilSel) return accError('Selecciona primero tu perfil.');
  if (!idea) return accError('Escribe tu usuario.');
  if (PERFILES[perfilSel].idea !== idea) return accError('Ese usuario no corresponde al perfil seleccionado.');
  $('accEntrar').disabled = true; $('accEntrar').textContent = 'Comprobando…';
  try { await auth().setPersistence($('accRecordar').checked ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION); } catch (e) { }
  try { await auth().signInWithEmailAndPassword(idea + DOMINIO, idea); abrir(perfilSel); }
  catch (e) {
    if (e.code === 'auth/network-request-failed') return accError('Sin conexión. Inténtalo de nuevo.');
    if (e.code === 'auth/too-many-requests') return accError('Demasiados intentos. Espera unos minutos.');
    accError('El usuario no es correcto o la cuenta no está dada de alta.');
  }
}
function abrir(p) {
  PERFIL = p; try { localStorage.setItem('programas-perfil', p); } catch (e) { }
  $('pantallaAcceso').style.display = 'none';
  $('perfilPill').textContent = PERFILES[p].emoji + ' ' + PERFILES[p].nombre.split(' ')[0];
  document.body.classList.toggle('mon', esMon());
  if (esMon()) { $('tituloApp').innerHTML = 'PROA Andalucía<small>' + (esTut() ? 'Tutoría' : 'Acompañamiento') + ' · ' + esc(PERFILES[p].nombre) + '</small>'; seccion = 'acomp'; irA('acomp'); }
  pintarCursos(); conectar(); novedades();
}
$('perfilPill').onclick = async () => {
  if (!confirm('¿Cerrar sesión y cambiar de perfil?')) return;
  try { await auth().signOut(); } catch (e) { }
  try { localStorage.removeItem('programas-perfil'); } catch (e) { }
  location.reload();
};
(function () { let h = false; auth().onAuthStateChanged(u => { if (h) return; h = true; let g = null; try { g = localStorage.getItem('programas-perfil'); } catch (e) { } if (u && g && PERFILES[g]) abrir(g); }); })();
function pintarCursos() {
  const i = startY(cursoAcDe(hoyIso()));
  $('selCurso').innerHTML = [i - 1, i, i + 1].map(y => { const c = y + '-' + String(y + 1).slice(2); return '<option value="' + c + '"' + (c === CURSO ? ' selected' : '') + '>' + y + '/' + String(y + 1).slice(2) + '</option>'; }).join('');
  $('selCurso').onchange = () => { CURSO = $('selCurso').value; conectar(); };
}
function novedades() { const K = esMon() ? 'programas-nov-mon-v13' : 'programas-nov-v29'; const dlgId = esMon() ? 'novMon' : 'novedades'; try { if (localStorage.getItem(K)) return; localStorage.setItem(K, 1); } catch (e) { } setTimeout(() => { try { $(dlgId).showModal(); } catch (e) { } }, 500); }

// ─── Navegación ───
$('nav').onclick = e => { const b = e.target.closest('button'); if (b) irA(b.dataset.s); };
$('tituloApp').onclick = () => irA('panel');
function irA(s) {
  seccion = s;
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.s === s));
  document.querySelectorAll('main > section').forEach(x => x.classList.toggle('oculto', x.id !== 'sec-' + s));
  render(); window.scrollTo(0, 0);
}
const RENDER = {};
function render() {
  const f = Object.assign({ panel: rPanel, plazos: rPlazos, acomp: rAcomp, reuniones: rReuniones, palancas: rPalancas }, RENDER)[seccion];
  if (!f) return;
  const el = $('sec-' + seccion), abiertos = [...el.querySelectorAll('details[open] > summary')].map(x => x.textContent.split(' ')[0]), y = window.scrollY;
  el.innerHTML = f();
  if (abiertos.length) { el.querySelectorAll('details > summary').forEach(x => { if (abiertos.includes(x.textContent.split(' ')[0])) x.parentNode.open = true; }); window.scrollTo(0, y); }
}

// ─── Plazos ───
function plazos() {
  const hoy = hoyIso();
  return PLAZOS.map(p => {
    const y = yDeMes(CURSO, p.m);
    const ini = p.s ? y + '-' + pad(p.m) + '-' + pad(p.s) : null;
    const dim = new Date(y, p.m, 0).getDate();
    const fin = p.s ? y + '-' + pad(p.m) + '-' + pad(Math.min(p.e || p.s, dim)) : null;
    const hecho = !!D.hechos[p.id];
    let st = 'gris';
    if (hecho) st = 'ok';
    else if (fin && fin < hoy) st = 'bad';
    else if (fin && (new Date(fin) - new Date(hoy)) / 864e5 <= 14) st = 'warn';
    return Object.assign({}, p, { ini, fin, hecho, st, orden: fin || (y + '-' + pad(p.m) + '-99') });
  }).sort((a, b) => a.orden < b.orden ? -1 : 1);
}
const ST_TXT = { ok: 'Hecho', bad: 'Vencido', warn: 'Próximo', gris: 'Más adelante' };
function itemPlazo(p) {
  const f = p.fin ? new Date(p.fin + 'T12:00') : null;
  return '<div class="item"><input type="checkbox" class="chk" data-hecho="' + esc(p.id) + '"' + (p.hecho ? ' checked' : '') + ' aria-label="Marcar como hecho">' +
    '<div class="fecha">' + (f ? f.getDate() + ' ' + MESES[f.getMonth()].slice(0, 3) : esc(MESES[p.m - 1].slice(0, 3))) + '<br><span class="small muted">' + esc(p.f || '') + '</span></div>' +
    '<div class="cuerpo"><div class="tt"' + (p.hecho ? ' style="text-decoration:line-through;opacity:.6"' : '') + '>' + esc(p.t) + '</div>' +
    (p.d ? '<div class="dd">' + esc(p.d) + '</div>' : '') + (p.r ? '<div class="ruta">Séneca: ' + esc(p.r) + '</div>' : '') +
    '<div style="margin-top:4px">' + tagProg(p.p) + ' <span class="tag st-' + p.st + '">' + ST_TXT[p.st] + '</span> ' + p.u.map(([n, h]) => '<a href="' + esc(h) + '" target="_blank" rel="noopener">' + esc(n) + ' ↗</a>').join('') + '</div></div></div>';
}
function rPlazos() {
  const L = plazos().filter(p => (!progPlazo || p.p === progPlazo) && (filtroPlazo === 'todos' || (filtroPlazo === 'pend' ? !p.hecho : p.hecho)));
  const chip = (v, t, cur, attr) => '<button class="chip' + (cur === v ? ' on' : '') + '" ' + attr + '="' + v + '">' + t + '</button>';
  return '<div class="card"><div class="card-h"><h2>📅 Plazos de los programas</h2><span class="muted small">' + L.length + ' tareas</span></div>' +
    '<div class="chips">' + chip('', 'Todos', progPlazo, 'data-prog') + chip('ZTS', '🌱 ZTS', progPlazo, 'data-prog') + chip('PROA', '🧑‍🏫 PROA Andalucía', progPlazo, 'data-prog') + chip('PROA+', '🎯 PROA+', progPlazo, 'data-prog') + '</div>' +
    '<div class="chips">' + chip('pend', 'Pendientes', filtroPlazo, 'data-fp') + chip('hechos', 'Hechos', filtroPlazo, 'data-fp') + chip('todos', 'Todo', filtroPlazo, 'data-fp') + '</div>' +
    (L.map(itemPlazo).join('') || '<p class="muted">No hay tareas con este filtro.</p>') + '</div>';
}

// ─── Panel ───
function rPanel() {
  const P = plazos(), hoy = hoyIso();
  const tarjeta = (p, extra) => {
    const L = P.filter(x => x.p === p), venc = L.filter(x => x.st === 'bad'), prox = L.filter(x => !x.hecho && x.st !== 'bad').slice(0, 3);
    const hechos = L.filter(x => x.hecho).length;
    return '<div class="card prog ' + PROG[p].cls + '"><div class="card-h"><h2>' + PROG[p].e + ' ' + PROG[p].n + '</h2><span class="tag st-' + (venc.length ? 'bad' : 'ok') + '">' + (venc.length ? venc.length + ' vencida' + (venc.length > 1 ? 's' : '') : 'Al día') + '</span></div>' +
      '<div class="barra" title="Tareas hechas"><i style="width:' + Math.round(100 * hechos / Math.max(1, L.length)) + '%"></i></div><p class="small muted" style="margin:4px 0 6px">' + hechos + ' de ' + L.length + ' tareas hechas</p>' +
      (extra || '') + venc.map(itemPlazo).join('') + prox.map(itemPlazo).join('') + '</div>';
  };
  // Acompañamiento
  const mes = hoy.slice(0, 7), G = Object.entries(D.grupos || {});
  let ses = 0, horas = 0;
  G.forEach(([g]) => Object.entries((D.sesiones || {})[g] || {}).forEach(([f, s]) => { if (f.startsWith(mes) && s.impartida) { ses++; horas += +s.horas || 0; } }));
  const quinc = quincenasPendientes();
  const extraPROA = '<div class="kpis"><div class="kpi"><b>' + G.length + '</b><span>grupos</span></div><div class="kpi"><b>' + ses + '</b><span>sesiones este mes</span></div><div class="kpi"><b>' + horas + ' h</b><span>impartidas este mes</span></div></div>' +
    (quinc.length ? '<div class="aviso">🤝 Reunión quincenal pendiente: ' + quinc.map(esc).join(', ') + '</div>' : '') +
    (G.length ? '' : '<div class="aviso">Crea los grupos en <b>Acompañamiento</b> para pasar lista y llevar las horas.</div>');
  const PAL = D.palancas || {}, enM = PALANCAS.filter(p => (PAL[p.c] || {}).estado === 'marcha').length, hechas = PALANCAS.filter(p => (PAL[p.c] || {}).estado === 'hecha').length;
  const comis = Object.values(D.reuniones || {}).filter(r => r.tipo === 'comision').length;
  const extraPP = '<div class="kpis"><div class="kpi"><b>' + enM + '/10</b><span>palancas en marcha</span></div><div class="kpi"><b>' + hechas + '</b><span>completadas</span></div><div class="kpi"><b>' + comis + '/2</b><span>comisiones de seguimiento</span></div>' + (typeof ecoTot === 'function' && ecoDot() ? '<div class="kpi"><b>' + Math.round(100 * ecoTot().total / ecoDot()) + ' %</b><span>dotación gastada</span></div>' : '') + '</div>';
  return '<div class="card"><h2>Hola, ' + esc(PERFILES[PERFIL] ? PERFILES[PERFIL].nombre.split(' ')[0] : '') + ' 👋</h2><p class="muted small">Curso ' + CURSO.replace('-', '/') + ' · Lo vencido y lo de las próximas semanas de cada programa.</p></div>' +
    '<div class="grid">' + tarjeta('PROA', extraPROA) + tarjeta('PROA+', extraPP) + tarjeta('ZTS', '') + '</div>';
}

// ─── Acompañamiento (PROA Andalucía) ───
const ACT = { AE: 'Acompañamiento Escolar', ALI: 'Acompañamiento Lingüístico', AED: 'Acompañamiento Escolar Domiciliario' };
function rangoProg() { const y = startY(CURSO); return { ini: y + '-10-13', fin: (y + 1) + '-05-31' }; }
function rAcomp() {
  const G = Object.entries(D.grupos || {}).filter(([, g]) => !esMon() || miGrupo(g)).sort((a, b) => ordGrupo(a[1]) - ordGrupo(b[1]) || (a[1].nombre || '').localeCompare(b[1].nombre || ''));
  if (grupoSel && (!D.grupos[grupoSel] || !G.some(x => x[0] === grupoSel))) grupoSel = null;
  if (!grupoSel && G.length) grupoSel = G[0][0];
  let h = '<div class="card"><div class="card-h"><h2>🧑‍🏫 PROA Andalucía · Acompañamiento</h2>' + (esMon() ? '' : '<div><button class="btn sec" data-acc7="todo">📋 Pegar alumnado de todos</button> <button class="btn" data-acc="nuevoGrupo">＋ Nuevo grupo</button></div>') + '</div>' +
    (esTut() ? '<div class="aviso verde"><b>Cómo se usa:</b> aquí ves el grupo de Acompañamiento de tu clase, su <b>programación</b> y las <b>reuniones quincenales</b>. Cuando haya reunión, pulsa «Entrar en la reunión telemática», escribe en los puntos del orden del día lo que veas necesario y habla por el chat con la monitora.</div>' : '') + (esMonitor() ? '<div class="aviso verde"><b>Cómo se usa:</b> de arriba abajo: 1) <b>Hojas del mes</b>: marca las sesiones y quién falta y descarga el Anexo X y el XII firmados. 2) <b>Reuniones quincenales</b>: toca la fecha para entrar. 3) <b>Programación</b> del trimestre para preparar las sesiones. 4) Al final de cada trimestre, el <b>informe de cada alumno/a</b>. 5) <b>Firma</b>: cada documento se firma con el dedo en el momento. Arriba tienes la <b>asistencia del mes</b>.</div>' : '') +
    (G.length ? '<div class="chips">' + G.map(([id, g]) => '<button class="chip' + (id === grupoSel ? ' on' : '') + '" data-grupo="' + id + '">' + esc(g.nombre) + '</button>').join('') + '</div>' :
      (esMon() ? '<p class="muted">Todavía no tienes ningún grupo asignado. Avisa a dirección.</p>' : '<p class="muted">Aún no hay grupos.</p><button class="btn" data-acc="gruposSeneca">⚡ Crear los 4 grupos como están en Séneca</button> <span class="small muted">Tercero (L y X), Cuarto, Quinto y Sexto (M y J), de 16:00 a 18:00</span>')) +
    '<p class="small muted">Recuerda: 2 sesiones de 2 h a la semana (o 4 de 1 h), nunca el viernes por la tarde. No se recuperan sesiones ni se cobran las no impartidas. Del 13 de octubre al 31 de mayo.</p></div>';
  if (!grupoSel) return h;
  const g = D.grupos[grupoSel], A = Object.entries(g.alumnos || {}).sort((a, b) => (a[1].siglas || '').localeCompare(b[1].siglas || ''));
  // Datos del grupo
  h += '<div class="card"><div class="card-h"><div><h2>' + esc(g.nombre) + '</h2><p class="small muted">' + esc(ACT[g.act] || '') + ' · ' + (g.mod === 'A' ? 'Mentor/a (modalidad A)' : 'Profesorado (modalidad B)') + ' · ' + esc(g.docente || 'sin docente') + ' · ' + esc(g.horario || '') + '</p></div>' +
    (esMon() ? '' : '<div><button class="btn sec peq" data-acc="editarGrupo">✏️ Editar grupo</button> <button class="btn sec peq" data-acc="nuevoAlumno">＋ Alumno/a</button></div>') + '</div>' +
    (A.length ? '<div class="tabla"><table><tr><th>Alumno/a</th><th>Curso</th><th>Tutor/a</th><th></th></tr>' +
      A.map(([aid, a]) => { return '<tr><td><b>' + esc(a.siglas) + '</b></td><td>' + esc(a.curso || '') + '</td><td>' + esc(a.tutor || '') + '</td><td>' + (esMon() ? '' : '<button class="btn sec peq" data-alumno="' + aid + '">✏️</button>') + '</td></tr>'; }).join('') + '</table></div>' :
      '<p class="muted">Añade el alumnado del grupo (solo siglas).</p>') + '</div>';
  // Mes de trabajo
  const meses = mesesProg();
  if (!mesResumen || !meses.includes(mesResumen)) mesResumen = meses.includes(hoyIso().slice(0, 7)) ? hoyIso().slice(0, 7) : meses[0];
  const selMes = '<select id="mesResumen" style="width:auto">' + meses.map(m => '<option value="' + m + '"' + (m === mesResumen ? ' selected' : '') + '>' + MESES[+m.slice(5) - 1] + ' ' + m.slice(0, 4) + '</option>').join('') + '</select>';
  const triSel = +(($('triInf') || {}).value || trimestreActual());
  if (esMonitor()) { h += rHojasMon(g, A, selMes); h += rReunionesEquipo(g); h += rProgEquipo(g); h += rInformeXV(A, triSel); h += rFirmaMon(); }
  else if (esTut()) { h += rReunionesEquipo(g); h += rProgEquipo(g); }
  else { h += rSesiones(g, selMes); h += rSubir(g); h += rDocsGrupo(g, A); h += rInformesCoord(g); h += rCotejo(grupoSel); }
  return h;
}
function ordGrupo(g) { const i = ['Tercero', 'Cuarto', 'Quinto', 'Sexto'].findIndex(n => (g.nombre || '').startsWith(n)); return i < 0 ? 9 : i; }
function mesesProg() { const y = startY(CURSO), r = []; for (let m = 10; m <= 17; m++) { const mm = ((m - 1) % 12) + 1, yy = m > 12 ? y + 1 : y; r.push(yy + '-' + pad(mm)); } return r; }
function trimestreActual() { const h = hoyIso(), y = startY(CURSO); if (h < (y + 1) + '-01-07') return 1; if (h < (y + 1) + '-04-01') return 2; return 3; }
function asistAlumno(g, aid) { const r = { P: 0, F: 0, J: 0 }; Object.values((D.sesiones || {})[g] || {}).forEach(s => { if (s.impartida && s.asist && s.asist[aid]) r[s.asist[aid]]++; }); r.total = r.P + r.F + r.J; r.pct = r.total ? Math.round(100 * r.P / r.total) : 0; return r; }
function resumenMes(g, mes) {
  const R = { imp: 0, noImp: 0, horas: 0, al: {} }, gr = D.grupos[g] || {};
  Object.entries((D.sesiones || {})[g] || {}).forEach(([f, s]) => {
    if (!f.startsWith(mes)) return;
    if (s.impartida) { R.imp++; R.horas += +s.horas || 0; Object.entries(s.asist || {}).forEach(([a, v]) => { R.al[a] = R.al[a] || { P: 0, F: 0, J: 0 }; R.al[a][v]++; }); }
    else R.noImp++;
  });
  R.euros = R.horas * EUROS[gr.mod || 'B'];
  return R;
}
function quincenasPendientes() {
  const hoy = new Date(hoyIso() + 'T12:00'), rg = rangoProg();
  if (hoyIso() < rg.ini || hoyIso() > rg.fin) return [];
  return Object.entries(D.grupos || {}).filter(([g]) => {
    const ult = Object.values(D.reuniones || {}).filter(r => r.tipo === 'quincenal' && r.grupo === g && !r.prevista && r.fecha <= hoyIso()).map(r => r.fecha).sort().pop();
    const desde = ult || D.grupos[g].inicio || (startY(CURSO) + '-10-26');
    return (hoy - new Date(desde + 'T12:00')) / 864e5 > 15;
  }).map(([, g]) => g.nombre);
}


// ─── Lista de cotejo de la documentación (Delegación) ───
const FIRMA_S = ['Firmado por Séneca por todas las personas que deben firmar', 'Se ha indicado la fecha de firma'];
const FIRMA_M = ['Firmado a mano por todas las personas que deben firmar', 'Nombre y apellidos legibles a pie de firma', 'Sello del centro'];
const COTEJO = {
  sel: { n: 'Anexo XVI · Acta de selección del alumnado', per: 'una', items: ['Sigue el modelo del Anexo XVI de las Instrucciones', 'Logos oficiales del FSE+ en la cabecera', 'Incluye el texto «se constituye la Comisión de Selección del alumnado participante en el Programa de Refuerzo, Orientación y Apoyo (PROA Andalucía), cofinanciado por el Fondo Social Europeo Plus, cuya composición es la siguiente»', 'Menciona a todos los miembros de la Comisión: jefatura de estudios, coordinación del programa, coordinadores de ciclo (incluido el del equipo de orientación) y orientador/a de referencia del EOE', 'Enumera a todo el alumnado propuesto con nombre, apellidos y curso', 'Visto bueno de la dirección'], firma: true },
  prog: { n: 'Programación del grupo', per: 'una', items: ['Logos oficiales del FSE+ en la cabecera', 'Competencias a trabajar', 'Objetivos a alcanzar', 'Actividades tipo', 'Aprendizajes instrumentales básicos: comprensión lectora, expresión oral o escrita, cálculo y resolución de problemas', 'Actividades con las TIC en la vida diaria', 'Actividades de coeducación, normas de convivencia, mediación y resolución pacífica de conflictos', 'Actividades motivadoras y funcionales con transferencia (visitas a espacios de la comunidad: comercios, cines, talleres de la zona…)'] },
  x: { n: 'Anexo X · Hoja de firma del docente o mentor/a', per: 'mes', items: ['Sigue el modelo del Anexo X', 'Logos oficiales del FSE+ en la cabecera', 'Nombre y código del centro (18008853)', 'Nombre del grupo igual que en Séneca', 'Nombre del docente o mentor/a responsable', 'Mes del documento (un Anexo X por mes y por persona)', 'Modalidad: A (mentor) o B (profesorado)', 'Fechas y horario de las sesiones correctos', 'Todas las sesiones impartidas están firmadas', 'Firma de la dirección', 'Días firmados = días grabados en «Usos del servicio» de Séneca'], firma: true },
  xv: { n: 'Anexo XV · Informe de evaluación del alumnado', per: 'trimestre', items: ['Sigue el modelo del Anexo XV', 'Logos oficiales del FSE+ en la cabecera', 'Curso académico', 'Nombre y nivel de cada alumno/a', 'Trimestre evaluado', 'Nombre y apellidos del docente o mentor/a que lo cumplimenta', 'Contenidos trabajados y grado de adquisición', 'Valoración global', 'Propuestas de mejora', 'Firmado el Anexo XV de cada alumno/a (no solo el último); sin firmas pegadas como imagen'], firma: true }
};
function periodos(per) { if (per === 'una') return [['u', 'Único']]; if (per === 'trimestre') return [1, 2, 3].map(t => ['t' + t, t + '.º trimestre']); return mesesProg().map(m => [m, MESES[+m.slice(5) - 1] + ' ' + m.slice(0, 4)]); }
let cotSel = 'x', cotPer = null;
function cotTotal(d, v) { return COTEJO[d].items.length + (COTEJO[d].firma ? (v.modo === 'mano' ? FIRMA_M : FIRMA_S).length : 0); }
function rCotejo(g) {
  const C = COTEJO[cotSel], per = periodos(C.per);
  if (!cotPer || !per.some(p => p[0] === cotPer)) cotPer = C.per === 'mes' ? (per.find(p => p[0] === hoyIso().slice(0, 7)) || per[0])[0] : C.per === 'trimestre' ? 't' + trimestreActual() : 'u';
  const V = (((D.cotejo || {})[g] || {})[cotSel] || {})[cotPer] || {};
  const items = C.items.concat(C.firma ? (V.modo === 'mano' ? FIRMA_M : FIRMA_S) : []);
  const ok = items.filter((_, i) => V['i' + i]).length;
  const estado = d => { const P = periodos(COTEJO[d].per); let n = 0; P.forEach(([k]) => { const v = (((D.cotejo || {})[g] || {})[d] || {})[k] || {}; if (Object.keys(v).filter(x => x[0] === 'i' && v[x]).length >= cotTotal(d, v)) n++; }); return n + '/' + P.length; };
  return '<div class="card"><div class="card-h"><h2>📋 Documentación · lista de cotejo</h2><span class="tag st-' + (ok === items.length ? 'ok' : 'warn') + '">' + ok + '/' + items.length + '</span></div>' +
    '<div class="chips">' + Object.entries(COTEJO).map(([k, c]) => '<button class="chip' + (k === cotSel ? ' on' : '') + '" data-cot="' + k + '">' + esc(c.n.split(' · ')[0]) + ' (' + estado(k) + ')</button>').join('') + '</div>' +
    '<h3>' + esc(C.n) + '</h3>' +
    '<div class="g2" style="margin-bottom:6px">' + (per.length > 1 ? '<div><label>Periodo</label><select id="cotPer">' + per.map(([k, t]) => '<option value="' + k + '"' + (k === cotPer ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></div>' : '') +
    (C.firma ? '<div><label>Firma</label><select id="cotModo"><option value="seneca">Solo por Séneca</option><option value="mano"' + (V.modo === 'mano' ? ' selected' : '') + '>A mano (con sello)</option></select></div>' : '') + '</div>' +
    items.map((t, i) => '<label style="display:flex;gap:10px;align-items:flex-start;font-size:.92rem;color:var(--text);font-weight:600;margin:6px 0"><input type="checkbox" class="chk" data-cotit="' + i + '"' + (V['i' + i] ? ' checked' : '') + ' style="width:22px;height:22px">' + esc(t) + '</label>').join('') +
    (cotSel === 'x' ? '<p class="small muted">Si atiende el grupo más de una persona, cada una hace su propio Anexo X aunque sea por un solo día. Nunca días de dos meses en el mismo anexo.</p>' : '') +
    (cotSel === 'sel' ? '<p class="small muted">Comisión de Selección en Primaria: jefatura de estudios, coordinación del programa, coordinadores de cada ciclo (incluido el del equipo de orientación) y orientador/a de referencia del EOE.</p>' : '') +
    '</div>';
}

// ─── Reuniones ───
const TIPOS = { quincenal: '🤝 Quincenal acompañante – tutor/a (PROA Andalucía)', familia: '👪 Cita con familia', comision: '🎯 Comisión de seguimiento PROA+', zts: '🌱 Coordinación ZTS', otra: '📝 Otra' };
function rReuniones() {
  const hoy = hoyIso(), todas = Object.entries(D.reuniones || {});
  const R = todas.filter(([, r]) => !filtroReu || r.tipo === filtroReu).sort((a, b) => {
    const fa = a[1].fecha || '', fb = b[1].fecha || '', pa = fa >= hoy, pb = fb >= hoy;
    return pa !== pb ? (pa ? -1 : 1) : pa ? fa.localeCompare(fb) : fb.localeCompare(fa);
  });
  const q = quincenasPendientes();
  return '<div class="card"><div class="card-h"><h2>🤝 Reuniones</h2><button class="btn" data-acc="nuevaReu">＋ Nueva reunión</button></div>' +
    (q.length ? '<div class="aviso">Hace más de 15 días sin reunión quincenal: ' + q.map(esc).join(', ') + '</div>' : '') +
    (!todas.some(([, r]) => r.prevista) ? '<div class="aviso verde">¿Empezamos con las reuniones del curso ya previstas (quincenales de cada grupo, reunión con familias, coordinación ZTS y comisiones del PROA+), con su orden del día? Luego las editas o borras. <button class="btn peq" data-acc="reuPrevistas" style="margin-left:6px">📅 Cargar reuniones previstas</button></div>' : '') +
    '<div class="chips"><button class="chip' + (!filtroReu ? ' on' : '') + '" data-freu="">Todas</button>' + Object.entries(TIPOS).map(([k, t]) => '<button class="chip' + (filtroReu === k ? ' on' : '') + '" data-freu="' + k + '">' + t.split(' (')[0] + '</button>').join('') + '</div>' +
    (R.map(([id, r]) => '<div class="item"><div class="fecha">' + (r.fecha ? fechaCorta(r.fecha) : '') + '</div><div class="cuerpo"><div class="tt">' + esc(TIPOS[r.tipo] || r.tipo) + (r.grupo && D.grupos[r.grupo] ? ' · ' + esc(D.grupos[r.grupo].nombre) : '') + (r.hora ? ' · ' + esc(r.hora) : '') + (r.prevista ? ' <span class="tag st-warn">Prevista</span>' : '') + '</div>' +
      '<div class="dd">' + esc(r.asistentes || '') + '</div>' + (r.acuerdos ? '<div class="dd" style="white-space:pre-line;color:var(--text)">' + esc(r.acuerdos) + '</div>' : '') +
      '<div style="margin-top:6px"><button class="btn sec peq" data-reu="' + id + '">✏️ Editar</button> <button class="btn sec peq" data-sala="' + id + '">🎥 Reunión telemática' + (r.sala ? (r.salaAport ? ' ✔' : ' · abierta') : '') + '</button> <button class="btn sec peq" data-acta="' + id + '">📄 Acta</button>' + (r.tipo === 'familia' ? ' <button class="btn sec peq" data-fampdf="' + id + '">💌 PDF para las familias</button>' : '') + '</div></div></div>').join('') || '<p class="muted">Aún no hay reuniones registradas.</p>') +
    '<p class="small muted" style="margin-top:8px">El registro de reuniones quincenales y de citas con familias se guarda con la documentación del PROA Andalucía. Las comisiones de seguimiento del PROA+ llevan acta (modelo nº 12), al menos dos al año.</p></div>';
}
function dlgReunion(id) {
  const r = id ? D.reuniones[id] : { tipo: 'quincenal', fecha: hoyIso() };
  $('dlgIn').innerHTML = '<h2>' + (id ? 'Editar reunión' : 'Nueva reunión') + '</h2>' +
    '<label>Tipo</label><select id="rTipo">' + Object.entries(TIPOS).map(([k, t]) => '<option value="' + k + '"' + (r.tipo === k ? ' selected' : '') + '>' + t + '</option>').join('') + '</select>' +
    '<div class="g2"><div><label>Fecha</label><input type="date" id="rFecha" value="' + esc(r.fecha || '') + '"></div><div><label>Hora</label><input type="time" id="rHora" value="' + esc(r.hora || '') + '"></div><div><label>Modalidad</label><select id="rMod">' + ['Telemática', 'Presencial'].map(x => '<option' + (r.mod === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></div></div>' +
    '<label>Grupo de acompañamiento (si procede)</label><select id="rGrupo"><option value="">—</option>' + Object.entries(D.grupos || {}).map(([g, x]) => '<option value="' + g + '"' + (r.grupo === g ? ' selected' : '') + '>' + esc(x.nombre) + '</option>').join('') + '</select>' +
    '<label>Asistentes</label><input id="rAsis" value="' + esc(r.asistentes || '') + '" placeholder="Nombres y cargos">' +
    '<label>Alumnado tratado (siglas)</label><input id="rAlum" value="' + esc(r.alumnos || '') + '">' +
    '<label>Temas y acuerdos</label><textarea id="rAcu" rows="5">' + esc(r.acuerdos || '') + '</textarea>' +
    '<label style="display:flex;gap:8px;align-items:center;font-weight:700;color:var(--text);margin-top:10px"><input type="checkbox" id="rCel" style="width:20px;height:20px"' + (r.prevista ? '' : ' checked') + '> Ya se ha celebrado (si no, queda como «prevista»)</label>' +
    '<p class="small muted" style="margin-top:10px">📅 Sale en la Agenda y en el Tablón (solo fecha, hora y tipo).</p>' +
    '<div class="pie">' + (id ? '<button class="btn rojo" id="rBorrar">Borrar</button>' : '') + '<button class="btn sec" id="rCancel">Cancelar</button><button class="btn" id="rOk">Guardar</button></div>';
  $('dlg').showModal();
  $('rCancel').onclick = () => $('dlg').close();
  if (id) $('rBorrar').onclick = () => { if (confirm('¿Borrar la reunión?')) { guardar('reuniones/' + id, null); publicarCita(id, null); $('dlg').close(); render(); } };
  $('rOk').onclick = () => {
    const v = { tipo: $('rTipo').value, fecha: $('rFecha').value, hora: $('rHora').value || '', prevista: !$('rCel').checked || null, mod: $('rMod').value, grupo: $('rGrupo').value, asistentes: $('rAsis').value.trim(), alumnos: $('rAlum').value.trim(), acuerdos: $('rAcu').value.trim(), por: PERFIL };
    if (!v.fecha) return toast('Pon la fecha', 'err');
    const rid = id || uid(), ant = (D.reuniones || {})[rid] || {};
    ['sala', 'salaAport', 'salaPart'].forEach(k => { if (ant[k]) v[k] = ant[k]; });
    guardar('reuniones/' + rid, v); $('dlg').close(); render(); toast('Reunión guardada');
    (async () => {
      try {
        if (v.tipo === 'quincenal' && !v.sala) await crearSala(rid, v);
        else if (v.sala && !v.salaAport) { const P = puntosReunion(v); await db.ref('programas_salas/' + v.sala).update({ puntos: P.map(p => p.t), hints: P.map(p => p.hint) }); }
      } catch (e) { console.warn(e); }
      publicarCita(rid, v);
    })();
  };
}
// Copia pública (solo fecha, hora y tipo) para el calendario del profesorado y el Tablón
const TIT_CITA = { quincenal: 'PROA Andalucía · Reunión quincenal acompañante–tutor/a', comision: 'PROA+ · Comisión de seguimiento', zts: 'ZTS · Reunión de coordinación', familia: 'PROA · Cita con familia', otra: 'Programas · Reunión' };
function publicarCita(id, r) {
  const g = r && r.grupo && D.grupos[r.grupo];
  db.ref('programas_publico/citas/' + id).set(r ? { fecha: r.fecha, hora: r.hora || '', titulo: (TIT_CITA[r.tipo] || 'Reunión') + (g ? ' (' + g.nombre + ')' : ''), detalle: (r.mod || '') + ' · Programas del cole', enlace: r.tipo === 'quincenal' && r.sala && !r.salaAport ? urlSala(r.sala) : null, fijo: ['quincenal', 'comision', 'zts'].includes(r.tipo) || null } : null)
    .catch(e => toast('La reunión se ha guardado, pero no ha podido salir en el calendario: falta el permiso «programas_publico» en Firebase.', 'err'));
}
// Reuniones previstas del curso (editables) para no partir de cero
async function cargarReunionesPrevistas() {
  try { cargarCalCole(); for (let i = 0; i < 30 && !(window.CalendarioCole); i++) await new Promise(r => setTimeout(r, 100)); if (window.CalendarioCole && window.CalendarioCole.listo) await Promise.race([window.CalendarioCole.listo, new Promise(r => setTimeout(r, 2500))]); calCole = window.CalendarioCole || calCole; } catch (e) { }
  const y = startY(CURSO), G = Object.entries(D.grupos || {}), out = [];
  const add = r => out.push(Object.assign({ prevista: true, publicar: false, mod: 'Telemática', por: PERFIL }, r));
  const sinC = f => typeof sinCole === 'function' && sinCole(f);
  // Quincenales acompañante – tutor/a: lunes alternos desde el 9 de noviembre hasta final de mayo
  for (let d = new Date(y, 10, 9, 12); d <= new Date(y + 1, 4, 31, 12); d.setDate(d.getDate() + 14)) {
    let f = iso(d); if (sinC(f)) { const e = new Date(d); e.setDate(e.getDate() + 1); f = iso(e); }
    G.forEach(([gid, g]) => add({ tipo: 'quincenal', fecha: f, hora: '17:00', grupo: gid, asistentes: (g.docente || 'Monitor/a') + ' y tutor/a de ' + (CURSO_G(g) || g.nombre) + '; coordinación del PROA',
      acuerdos: '1. Asistencia y puntualidad de la quincena.\n2. Tareas y contenidos de clase que conviene reforzar en el Acompañamiento.\n3. Evolución de cada alumno/a: lectura, cálculo, resolución de problemas y hábitos de trabajo.\n4. Comunicación con las familias (faltas, justificantes, citas).\n5. Acuerdos para la próxima quincena.' }));
  }
  // Reunión informativa con las familias de cada grupo
  G.forEach(([gid, g]) => add({ tipo: 'familia', fecha: y + '-11-05', hora: '16:00', mod: 'Presencial', grupo: gid, asistentes: 'Familias del alumnado de ' + g.nombre + ', ' + (g.docente || 'monitor/a') + ' y coordinación del PROA',
    acuerdos: '1. Presentación del Acompañamiento Escolar (PROA Andalucía), cofinanciado por el FSE+.\n2. Días y horario: ' + (g.horario || '') + '. Asistencia, puntualidad y recogida.\n3. Firma de la autorización familiar (Anexo VI) y teléfonos de contacto.\n4. Justificación de faltas (Anexo XIII) y bajas (Anexo VIII).\n5. Ruegos y preguntas.' }));
  // Coordinación ZTS: primer lunes lectivo de cada mes
  for (let m = 10; m <= 17; m++) {
    const mm = ((m - 1) % 12), yy = m > 11 ? y + 1 : y; let d = new Date(yy, mm, 1, 12);
    while (d.getDay() !== 1 || sinC(iso(d))) d.setDate(d.getDate() + 1);
    if (iso(d) < hoyIso()) continue;
    add({ tipo: 'zts', fecha: iso(d), hora: '13:00', mod: 'Presencial', asistentes: 'Equipo directivo y profesorado ZTS (Miriam N. Romero y Cristina Molina)',
      acuerdos: '1. Seguimiento de los desdobles de Lengua y Matemáticas en 2.º y 3.º.\n2. Absentismo: casos del mes y llamadas a las familias.\n3. Alumnado recién llegado y plan de acogida.\n4. Seguimiento del Plan de Actuación ZTS.\n5. Acuerdos.' });
  }
  // Comisiones de seguimiento del PROA+ (mínimo dos al año)
  [[y + '-12-14', '1.ª', 'de la 1.ª evaluación'], [(y + 1) + '-05-17', '2.ª', 'de la 2.ª evaluación y previsión de la 3.ª']].forEach(([f, n, ev]) => add({ tipo: 'comision', fecha: f, hora: '13:00', mod: 'Presencial', asistentes: 'Equipo directivo, coordinación del PROA+ y tutores/as del alumnado participante',
    acuerdos: n + ' comisión de seguimiento del PROA+ Transfórmate (modelo nº 12).\n1. Seguimiento del PEM y de las 10 actividades palanca.\n2. Datos de los indicadores ' + ev + '.\n3. Ejecución económica de la dotación.\n4. Dificultades y propuestas de mejora.\n5. Acuerdos.' }));
  out.forEach(r => { const k = uid(); guardar('reuniones/' + k, r); publicarCita(k, r); });
  setTimeout(() => syncReuniones(), 2500);
  toast(out.length + ' reuniones previstas cargadas. Edítalas o bórralas cuando quieras.'); render();
}
function acta(id) {
  const r = D.reuniones[id], g = r.grupo && D.grupos[r.grupo];
  const prog = r.tipo === 'comision' ? 'PROA+ Transfórmate' : r.tipo === 'zts' ? 'Programa de Atención Socioeducativa en ZTS' : 'PROA Andalucía';
  const w = window.open('', '_blank');
  if (!w) return toast('Permite las ventanas emergentes para ver el acta', 'err');
  w.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Acta</title><style>@page{size:A4;margin:0}@media print{body{padding:14mm 16mm!important;margin:0!important;max-width:none!important;-webkit-box-decoration-break:clone;box-decoration-break:clone}}body{font-family:Arial,sans-serif;max-width:760px;margin:30px auto;padding:0 20px;color:#111;line-height:1.5}h1{font-size:18px;text-align:center}table{width:100%;border-collapse:collapse}td{border:1px solid #999;padding:6px 8px;vertical-align:top}td:first-child{width:28%;font-weight:bold;background:#f3f5f9}.cab{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.cab img{height:50px}.fse{font-size:12px;text-align:center;margin-top:30px;color:#333}@media print{button{display:none}}</style></head><body>' +
    (r.tipo === 'comision' ? '<div class="cab"><img src="' + location.href.replace(/[^/]*$/, '') + 'img/junta.jpg"><img src="' + location.href.replace(/[^/]*$/, '') + 'img/colegio.png"></div>' : '<img src="' + (typeof LOGO_FSE === 'string' && LOGO_FSE.startsWith('data:') ? LOGO_FSE : location.href.replace(/[^/]*$/, '') + 'img/logos-fse-proa.png') + '" alt="Logos FSE+" style="width:100%;height:auto;display:block;margin-bottom:10px">') +
    '<h1>ACTA DE REUNIÓN · ' + esc(prog.toUpperCase()) + '</h1><p style="text-align:center">CEIP Capitulaciones (18008853) · Santa Fe (Granada) · Curso ' + CURSO.replace('-', '/') + '</p><table>' +
    '<tr><td>Tipo de reunión</td><td>' + esc((TIPOS[r.tipo] || '').replace(/^\S+\s/, '')) + '</td></tr><tr><td>Fecha</td><td>' + esc(r.fecha ? new Date(r.fecha + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '') + '</td></tr><tr><td>Modalidad</td><td>' + esc(r.mod || '') + '</td></tr>' +
    (g ? '<tr><td>Grupo</td><td>' + esc(g.nombre) + ' · ' + esc(ACT[g.act] || '') + ' · ' + esc(g.docente || '') + '</td></tr>' : '') +
    '<tr><td>Asistentes</td><td>' + esc(r.asistentes || '') + '</td></tr>' + (r.alumnos ? '<tr><td>Alumnado</td><td>' + esc(r.alumnos) + '</td></tr>' : '') +
    '<tr><td>Temas y acuerdos</td><td style="white-space:pre-line">' + esc(r.acuerdos || '') + '</td></tr></table>' +
    '<p style="margin-top:40px">En Santa Fe, a ' + esc(r.fecha ? new Date(r.fecha + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '') + '.</p><p style="margin-top:50px">Fdo.: ______________________ &nbsp;&nbsp;&nbsp;&nbsp; Fdo.: ______________________</p>' +
    '<p class="fse">Programa cofinanciado por el Fondo Social Europeo Plus (FSE+). Consejería de Educación de la Junta de Andalucía.</p>' +
    '<p style="text-align:center"><button onclick="print()">Imprimir o guardar en PDF</button></p></body></html>');
  w.document.close();
}

// ─── Palancas PROA+ ───
const EST = { '': ['Pendiente', 'gris'], marcha: ['En marcha', 'warn'], hecha: ['Completada', 'ok'] };
function rPalancas() {
  const PAL = D.palancas || {}, RT = D.retos || {};
  let h = '<div class="card"><div class="card-h"><h2>🎯 PROA+ Transfórmate · Plan de actividades palanca 2026/27</h2><a class="btn sec peq" href="https://www.juntadeandalucia.es/educacion/web/proa-plus/index.html" target="_blank" rel="noopener" style="text-decoration:none">🧰 Herramienta de la Junta ↗</a></div>' +
    '<p class="small muted">7 obligatorias de la Adenda y 3 de libre elección (opciones A, B y C de Séneca). Firma de la Adenda en Séneca hasta el 30/11.</p></div>';
  h += '<div class="card"><h2>📈 Retos e indicadores</h2><div class="tabla"><table><tr><th>Reto</th><th>Indicador</th><th>Meta</th><th>Inicial</th><th>1.ª ev.</th><th>2.ª ev.</th><th>3.ª ev.</th></tr>' +
    RETOS.map(r => { const v = RT[r.id] || {}; return '<tr><td><b>' + r.n + '. ' + esc(r.t) + '</b></td><td class="small">' + esc(r.ind) + '</td><td class="small">' + esc(r.meta) + '</td>' + ['ini', 't1', 't2', 't3'].map(k => '<td><input data-reto="' + r.id + '" data-k="' + k + '" value="' + esc(v[k] || '') + '" style="min-width:64px;padding:6px"></td>').join('') + '</tr>'; }).join('') +
    '</table></div><p class="small muted">Ajustad las metas con los datos de la evaluación inicial. Estos datos sirven para la RdC1 y la memoria.</p>' +
    '<div class="pie" style="justify-content:flex-start"><button class="btn peq" data-acc="traerDatos">📥 Traer datos de Evaluación y del Registro de Lectura</button></div>' + (typeof rDatosOtras === 'function' ? rDatosOtras() : '') + '</div>';
  h += PALANCAS.map(p => {
    const v = PAL[p.c] || {}, e = EST[v.estado || ''], ev = Object.entries(v.evid || {}).sort((a, b) => (a[1].fecha || '').localeCompare(b[1].fecha || ''));
    return '<div class="card pal"><div class="card-h"><div><h3>' + p.n + '. ' + esc(p.c) + ' · ' + esc(p.t) + '</h3><p class="small muted">' + esc(p.bloque) + ' · ' + esc(p.tipo) + ' · Reto: ' + esc(p.reto) + '</p></div>' +
      '<select data-estado="' + p.c + '" style="width:auto"><option value="">⏳ Pendiente</option><option value="marcha"' + (v.estado === 'marcha' ? ' selected' : '') + '>🚀 En marcha</option><option value="hecha"' + (v.estado === 'hecha' ? ' selected' : '') + '>✅ Completada</option></select></div>' +
      '<p><b>Objetivo:</b> ' + esc(p.obj) + '</p>' +
      '<details><summary>Actuaciones previstas e indicadores</summary><ul style="margin:6px 0 6px 20px">' + p.acc.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul><p class="small"><b>Indicadores:</b> ' + esc(p.ind) + '</p></details>' + (p.c === 'A413' && typeof rLecturaA413 === 'function' ? rLecturaA413() : '') +
      '<div style="margin-top:8px"><b class="small">Actuaciones realizadas y evidencias (' + ev.length + ')</b>' +
      ev.map(([eid, x]) => '<div class="item"><div class="fecha">' + (x.fecha ? fechaCorta(x.fecha) : '') + '</div><div class="cuerpo"><div>' + esc(x.texto) + '</div>' + (x.part ? '<div class="dd">Participantes: ' + esc(x.part) + '</div>' : '') + '</div><button class="btn sec peq" data-delev="' + p.c + '|' + eid + '" aria-label="Borrar">🗑️</button></div>').join('') +
      '<div style="margin-top:6px"><button class="btn sec peq" data-nuevaev="' + p.c + '">＋ Añadir actuación</button> <button class="btn sec peq" data-ficha="' + p.c + '">📄 Ficha</button></div></div></div>';
  }).join('');
  return h + (typeof rPEM === 'function' ? rPEM() : '');
}
function dlgEvidencia(c) {
  $('dlgIn').innerHTML = '<h2>Nueva actuación · ' + esc(c) + '</h2><label>Fecha</label><input type="date" id="eF" value="' + hoyIso() + '"><label>Qué se ha hecho</label><textarea id="eT" placeholder="Ej.: Taller de matemáticas con familias de 2.º (OAOA)"></textarea><label>Participantes (nº alumnado, familias, docentes)</label><input id="eP">' +
    '<div class="pie"><button class="btn sec" id="eC">Cancelar</button><button class="btn" id="eOk">Guardar</button></div>';
  $('dlg').showModal();
  $('eC').onclick = () => $('dlg').close();
  $('eOk').onclick = () => {
    const t = $('eT').value.trim(); if (!t) return toast('Describe la actuación', 'err');
    guardar('palancas/' + c + '/evid/' + uid(), { fecha: $('eF').value, texto: t, part: $('eP').value.trim(), por: PERFIL });
    if (!(D.palancas[c] || {}).estado) guardar('palancas/' + c + '/estado', 'marcha');
    $('dlg').close(); render(); toast('Actuación guardada');
  };
}

// ─── Diálogos de grupos y alumnado ───
function dlgGrupo(id) {
  const g = id ? D.grupos[id] : { act: 'AE', mod: 'B', horasSesion: 2 };
  $('dlgIn').innerHTML = '<h2>' + (id ? 'Editar grupo' : 'Nuevo grupo') + '</h2>' +
    '<label>Nombre del grupo</label><input id="gN" value="' + esc(g.nombre || '') + '" placeholder="Ej.: AE 3.º-4.º">' +
    '<div class="g2"><div><label>Actuación</label><select id="gA">' + Object.entries(ACT).map(([k, t]) => '<option value="' + k + '"' + (g.act === k ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
    '<div><label>Modalidad</label><select id="gM"><option value="B"' + (g.mod !== 'A' ? ' selected' : '') + '>B · Profesorado del centro (20 €/h)</option><option value="A"' + (g.mod === 'A' ? ' selected' : '') + '>A · Mentor/a de empresa (23 €/h)</option></select></div></div>' +
    '<div class="g2"><div><label>Docente o mentor/a (nombre y apellidos)</label><input id="gD" value="' + esc(g.docente || '') + '"></div><div><label>Acceso a la app</label><select id="gMon"><option value="">— Nadie —</option>' + Object.entries(PERFILES).filter(([, p]) => p.mon).map(([k, p]) => '<option value="' + k + '"' + (g.monitor === k ? ' selected' : '') + '>' + esc(p.nombre) + '</option>').join('') + '</select></div></div>' +
    '<div class="g2"><div><label>Hora de inicio habitual</label><input type="time" id="gHi" value="' + esc(g.hi || '16:00') + '"></div><div><label>Hora de fin habitual</label><input type="time" id="gHf" value="' + esc(g.hf || '18:00') + '"></div></div>' +
    '<label>Días de sesión (como en Séneca)</label><div style="display:flex;gap:12px;flex-wrap:wrap">' + ['L', 'M', 'X', 'J'].map((d, i) => '<label style="display:flex;gap:4px;align-items:center;color:var(--text);margin:0"><input type="checkbox" class="gDia" value="' + (i + 1) + '"' + ((g.dias || []).includes(i + 1) ? ' checked' : '') + ' style="width:20px;height:20px">' + d + '</label>').join('') + '</div>' +
    '<div class="g2"><div><label>Días y horario</label><input id="gH" value="' + esc(g.horario || '') + '" placeholder="Lunes y miércoles 16:00–18:00"></div><div><label>Horas por sesión</label><input type="number" id="gS" min="1" max="3" step="0.5" value="' + (g.horasSesion || 2) + '"></div></div>' +
    '<div class="pie">' + (id ? '<button class="btn rojo" id="gB">Borrar grupo</button>' : '') + '<button class="btn sec" id="gC">Cancelar</button><button class="btn" id="gOk">Guardar</button></div>';
  $('dlg').showModal();
  $('gC').onclick = () => $('dlg').close();
  if (id) $('gB').onclick = () => { if (confirm('¿Borrar el grupo con su alumnado y su asistencia?')) { guardar('grupos/' + id, null); guardar('sesiones/' + id, null); guardar('informes/' + id, null); grupoSel = null; $('dlg').close(); render(); } };
  $('gOk').onclick = () => {
    const n = $('gN').value.trim(); if (!n) return toast('Pon un nombre al grupo', 'err');
    const nid = id || uid();
    const v = Object.assign({}, g, { nombre: n, act: $('gA').value, mod: $('gM').value, docente: $('gD').value.trim(), monitor: $('gMon').value || null, hi: $('gHi').value, hf: $('gHf').value, horario: $('gH').value.trim(), dias: [...document.querySelectorAll('.gDia:checked')].map(x => +x.value), horasSesion: +$('gS').value || 2 });
    guardar('grupos/' + nid, v); grupoSel = nid; $('dlg').close(); render();
  };
}
function dlgAlumno(aid) {
  const a = aid ? D.grupos[grupoSel].alumnos[aid] : {};
  $('dlgIn').innerHTML = '<h2>' + (aid ? 'Editar alumno/a' : 'Nuevo alumno/a') + '</h2><p class="small muted">Solo siglas (por ejemplo, J.G.M.).</p>' +
    '<div class="g2"><div><label>Siglas</label><input id="aS" value="' + esc(a.siglas || '') + '"></div><div><label>Curso</label><select id="aC">' + ['3.º', '4.º', '5.º', '6.º', '1.º', '2.º'].map(c => '<option' + (a.curso === c ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></div></div>' +
    '<label>Tutor/a</label><input id="aT" value="' + esc(a.tutor || '') + '">' +
    '<div class="pie">' + (aid ? '<button class="btn rojo" id="aB">Quitar del grupo</button>' : '') + '<button class="btn sec" id="aCa">Cancelar</button><button class="btn" id="aOk">Guardar</button></div>';
  $('dlg').showModal();
  $('aCa').onclick = () => $('dlg').close();
  if (aid) $('aB').onclick = () => { if (confirm('¿Quitar del grupo?')) { guardar('grupos/' + grupoSel + '/alumnos/' + aid, null); $('dlg').close(); render(); } };
  $('aOk').onclick = () => {
    const s = $('aS').value.trim().toUpperCase(); if (!s) return toast('Pon las siglas', 'err');
    guardar('grupos/' + grupoSel + '/alumnos/' + (aid || uid()), { siglas: s, curso: $('aC').value, tutor: $('aT').value.trim() });
    $('dlg').close(); render();
  };
}
async function copiar(t) { try { await navigator.clipboard.writeText(t); toast('Copiado'); } catch (e) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Copiado'); } }

// ─── Eventos ───
document.addEventListener('click', e => {
  const t = e.target.closest('[data-prog],[data-fp],[data-grupo],[data-acc],[data-alumno],[data-asis] button,[data-freu],[data-reu],[data-acta],[data-nuevaev],[data-delev],[data-cot]');
  if (!t) return;
  const d = t.dataset;
  if ('prog' in d) { progPlazo = d.prog; render(); }
  else if ('fp' in d) { filtroPlazo = d.fp; render(); }
  else if ('grupo' in d) { grupoSel = d.grupo; render(); }
  else if ('alumno' in d) dlgAlumno(d.alumno);
  else if ('freu' in d) { filtroReu = d.freu; render(); }
  else if ('reu' in d) dlgReunion(d.reu);
  else if ('acta' in d) acta(d.acta);
  else if ('cot' in d) { cotSel = d.cot; cotPer = null; render(); }
  else if ('nuevaev' in d) dlgEvidencia(d.nuevaev);
  else if ('delev' in d) { const [c, eid] = d.delev.split('|'); if (confirm('¿Borrar la actuación?')) { guardar('palancas/' + c + '/evid/' + eid, null); render(); } }
  else if (t.closest('[data-asis]')) {
    const aid = t.closest('[data-asis]').dataset.asis, cur = ((D.sesiones[grupoSel] || {})[fechaLista] || {}).asist || {};
    guardar('sesiones/' + grupoSel + '/' + fechaLista + '/asist/' + aid, cur[aid] === t.dataset.v ? null : t.dataset.v); render();
  }
  else if ('acc' in d) {
    const a = d.acc;
    if (a === 'nuevoGrupo') dlgGrupo();
    else if (a === 'editarGrupo') dlgGrupo(grupoSel);
    else if (a === 'nuevoAlumno') dlgAlumno();
    else if (a === 'nuevaReu') dlgReunion();
    else if (a === 'todosP') { const al = D.grupos[grupoSel].alumnos || {}; const o = {}; Object.keys(al).forEach(k => o[k] = 'P'); guardar('sesiones/' + grupoSel + '/' + fechaLista + '/asist', o); render(); }
    else if (a === 'anexoX') docAnexoX(grupoSel, mesResumen);
    else if (a === 'gruposSeneca') crearGruposSeneca();
    else if (a === 'reuPrevistas') cargarReunionesPrevistas();
    else if (a === 'traerDatos') traerDatos(t);
    else if (a === 'anexoXII') docAnexoXII(grupoSel, mesResumen);
    else if (a === 'anexoXV') docAnexoXV(grupoSel, +$('triInf').value);
    else if (a === 'copiarResumen') {
      const g = D.grupos[grupoSel], R = resumenMes(grupoSel, mesResumen), al = g.alumnos || {};
      const ses = Object.entries(D.sesiones[grupoSel] || {}).filter(([f]) => f.startsWith(mesResumen)).sort();
      copiar('PROA Andalucía · ' + g.nombre + ' · ' + MESES[+mesResumen.slice(5) - 1] + ' ' + mesResumen.slice(0, 4) + '\nDocente: ' + (g.docente || '') + '\nSesiones impartidas: ' + R.imp + ' · Horas: ' + R.horas + ' · Importe: ' + R.euros + ' €\n\n' +
        ses.map(([f, s]) => fechaCorta(f) + ': ' + (s.impartida ? s.horas + ' h · ' + Object.entries(s.asist || {}).map(([k, v]) => (al[k] ? al[k].siglas : '?') + ' ' + v).join(', ') : 'NO impartida (' + ({ noAlumnado: 'sin alumnado', noDocente: 'ausencia del docente', festivo: 'festivo u otra causa' }[s.motivo] || '') + ')')).join('\n'));
    }
    else if (a === 'copiarInforme') {
      const tri = +$('triInf').value, g = D.grupos[grupoSel], al = g.alumnos || {};
      copiar('Informe de evolución · ' + tri + '.º trimestre · PROA Andalucía · ' + g.nombre + '\n\n' + Object.entries(al).map(([aid, a]) => { const i = (((D.informes || {})[grupoSel] || {})[aid] || {})['t' + tri] || {}, r = asistAlumno(grupoSel, aid); return a.siglas + ' (' + (a.curso || '') + ', tutor/a ' + (a.tutor || '—') + ')\nAsistencia: ' + (r.total ? r.pct + ' %' : '—') + ' · Evolución: ' + (i.evol || '—') + ' · Hábitos: ' + (i.hab || '—') + '\nContenidos y grado de adquisición: ' + (i.cont || '—') + '\nValoración global: ' + (i.texto || '—') + '\nPropuestas de mejora: ' + (i.mejora || '—'); }).join('\n\n'));
    }
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.hecho) { guardar('hechos/' + t.dataset.hecho, t.checked ? { por: PERFIL, fecha: hoyIso() } : null); setTimeout(render, 250); }
  else if (t.id === 'fechaLista') { fechaLista = t.value || hoyIso(); render(); }
  else if (t.id === 'mesResumen') { mesResumen = t.value; render(); }
  else if (t.id === 'triInf') render();
  else if (t.id === 'sesObs') guardar('sesiones/' + grupoSel + '/' + fechaLista + '/obs', t.value.trim() || null);
  else if (t.id === 'sesImp' || t.id === 'sesHoras' || t.id === 'sesHi' || t.id === 'sesHf') {
    const v = $('sesImp').value, ruta = 'sesiones/' + grupoSel + '/' + fechaLista;
    const prev = (D.sesiones[grupoSel] || {})[fechaLista] || {};
    if (!v) guardar(ruta, null);
    else if (v === 'si') {
      const hi = $('sesHi').value, hf = $('sesHf').value;
      if ((t.id === 'sesHi' || t.id === 'sesHf') && hi && hf) { const m = (+hf.slice(0, 2) * 60 + +hf.slice(3)) - (+hi.slice(0, 2) * 60 + +hi.slice(3)); if (m > 0) $('sesHoras').value = Math.round(m / 30) / 2; }
      guardar(ruta, { impartida: true, hi, hf, horas: +$('sesHoras').value || 0, obs: ($('sesObs') && $('sesObs').value.trim()) || prev.obs || null, asist: prev.asist || {} });
    }
    else guardar(ruta, { impartida: false, motivo: v, horas: 0 });
    render();
  }
  else if (t.dataset.inf) guardar('informes/' + grupoSel + '/' + t.dataset.inf + '/t' + $('triInf').value + '/' + t.dataset.k, t.value || null);
  else if (t.dataset.cotit) { guardar('cotejo/' + grupoSel + '/' + cotSel + '/' + cotPer + '/i' + t.dataset.cotit, t.checked || null); setTimeout(render, 200); }
  else if (t.id === 'cotPer') { cotPer = t.value; render(); }
  else if (t.id === 'cotModo') { guardar('cotejo/' + grupoSel + '/' + cotSel + '/' + cotPer + '/modo', t.value === 'mano' ? 'mano' : null); render(); }
  else if (t.dataset.reto) guardar('retos/' + t.dataset.reto + '/' + t.dataset.k, t.value.trim() || null);
  else if (t.dataset.estado) { guardar('palancas/' + t.dataset.estado + '/estado', t.value || null); render(); }
});
