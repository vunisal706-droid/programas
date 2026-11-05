// Programas del cole · Coordinación ZTS: una vez al trimestre (noviembre, febrero y mayo), el 4.º lunes lectivo, de 17:00 a 18:00
'use strict';
const ZTS_MESES = [[11, '1.er trimestre'], [2, '2.º trimestre'], [5, '3.er trimestre']];
const ZTS_ASIST = 'Equipo directivo y profesorado de apoyo ZTS: Miriam N. Romero Rodríguez (coordinadora del programa) y Cristina Molina Martín';
// 4.º lunes lectivo del mes 'aaaa-mm' (si el mes tiene menos, el último lunes lectivo)
function cuartoLunes(mes) {
  const [a, m] = mes.split('-').map(Number), L = [];
  for (let d = new Date(a, m - 1, 1, 12); d.getMonth() === m - 1; d.setDate(d.getDate() + 1))
    if (d.getDay() === 1 && !sinCole(iso(d))) L.push(iso(d));
  return L[3] || L[L.length - 1] || null;
}
// Una sola vez: deja una reunión por trimestre y quita las demás que aún no se han hecho
async function moverZTS() {
  if (esMon() || !PERFIL || !D || !D.reuniones || (D.ajustes || {}).ztsTrim) return;
  cargarCalCole();
  for (let i = 0; i < 50 && !(calCole && calCole.sinCole); i++) await new Promise(r => setTimeout(r, 100));
  if (calCole && calCole.listo && calCole.listo.then) await Promise.race([calCole.listo, new Promise(r => setTimeout(r, 3000))]);
  if (!(calCole && calCole.sinCole)) return;   // sin calendario no se toca nada
  const hoy = hoyIso(), y = startY(CURSO); let quitadas = 0, nuevas = 0;
  // Quitar las ZTS pendientes (futuras y sin acta)
  for (const [k, r] of Object.entries(D.reuniones)) {
    if (!r || r.tipo !== 'zts' || !r.fecha || r.fecha < hoy || r.salaAport) continue;
    guardar('reuniones/' + k, null); publicarCita(k, null); quitadas++;
  }
  // Crear las del trimestre que aún no han pasado
  ZTS_MESES.forEach(([m, t]) => {
    const f = cuartoLunes((m >= 9 ? y : y + 1) + '-' + pad(m)); if (!f || f < hoy) return;
    const k = uid(), r = { tipo: 'zts', fecha: f, hora: '17:00', horaFin: '18:00', mod: 'Presencial', prevista: true, publicar: false, por: PERFIL, asistentes: ZTS_ASIST,
      acuerdos: 'Coordinación ZTS del ' + t + '.\n1. Seguimiento de los desdobles de Lengua y Matemáticas en 2.º y 3.º.\n2. Absentismo: casos del trimestre y llamadas a las familias.\n3. Alumnado recién llegado y plan de acogida.\n4. Seguimiento del Plan de Actuación ZTS.\n5. Acuerdos.' };
    guardar('reuniones/' + k, r); publicarCita(k, r); nuevas++;
  });
  guardar('ajustes/ztsTrim', true);
  if (quitadas || nuevas) { toast('🌱 Coordinación ZTS: ahora una por trimestre (' + nuevas + ' previstas, 4.º lunes lectivo de 17:00 a 18:00)'); render(); }
}
setInterval(() => { if (!moverZTS._ya && PERFIL && !esMon() && D && D.reuniones) { moverZTS._ya = true; moverZTS(); } }, 3000);
