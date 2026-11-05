// Programas del cole · Coordinación ZTS: el 4.º lunes lectivo de cada mes, de 17:00 a 18:00
'use strict';
const ZTS_ASIST = 'Equipo directivo y profesorado de apoyo ZTS: Miriam N. Romero Rodríguez (coordinadora del programa) y Cristina Molina Martín';
// 4.º lunes lectivo del mes 'aaaa-mm' (si el mes tiene menos, el último lunes lectivo)
function cuartoLunes(mes) {
  const [a, m] = mes.split('-').map(Number), L = [];
  for (let d = new Date(a, m - 1, 1, 12); d.getMonth() === m - 1; d.setDate(d.getDate() + 1))
    if (d.getDay() === 1 && !sinCole(iso(d))) L.push(iso(d));
  return L[3] || L[L.length - 1] || null;
}
// Una sola vez por curso: mueve las reuniones ZTS que aún no se han hecho
async function moverZTS() {
  if (esMon() || !PERFIL || !D || !D.reuniones || (D.ajustes || {}).zts4lunes) return;
  cargarCalCole();
  for (let i = 0; i < 50 && !(calCole && calCole.sinCole); i++) await new Promise(r => setTimeout(r, 100));
  if (calCole && calCole.listo && calCole.listo.then) await Promise.race([calCole.listo, new Promise(r => setTimeout(r, 3000))]);
  if (!(calCole && calCole.sinCole)) return;   // sin calendario no se mueve nada
  const hoy = hoyIso(); let n = 0;
  for (const [k, r] of Object.entries(D.reuniones)) {
    if (!r || r.tipo !== 'zts' || !r.fecha || r.fecha < hoy || r.salaAport) continue;
    const f = cuartoLunes(r.fecha.slice(0, 7)); if (!f || f < hoy) continue;
    const nr = Object.assign({}, r, { fecha: f, hora: '17:00', horaFin: '18:00', asistentes: ZTS_ASIST });
    guardar('reuniones/' + k, nr); publicarCita(k, nr); n++;
  }
  guardar('ajustes/zts4lunes', true);
  if (n) { toast('🌱 Coordinación ZTS: ' + n + ' reuniones pasadas al 4.º lunes lectivo de cada mes, de 17:00 a 18:00'); render(); }
}
setInterval(() => { if (!moverZTS._ya && PERFIL && !esMon() && D && D.reuniones) { moverZTS._ya = true; moverZTS(); } }, 3000);
