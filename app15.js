// ─── Anexos X y XII de las monitoras en la nube: la coordinación los ve y descarga sin que se los envíen ───
// Nube: informes/<grupo>/_hoja/<aaaa-mm> = { dias: { fecha: { dada, aus: [ids], obs, fx, fxii } }, por, ts }
// Solo ids del alumnado (sin nombres): los nombres completos los pone el dispositivo de quien genera el PDF.
'use strict';
(function () {
  const hojaNube = (gid, mes) => ((((D.informes || {})[gid] || {})._hoja || {})[mes]) || null;
  const SKEY = (gid, mes) => 'programas-hoja-subida-' + gid + '-' + mes;

  // ── Monitoras: subir la hoja del mes (días, faltas y firmas de cada sesión) ──
  function subirHoja(gid, mes) {
    if (!esMonitor() || !gid || !mes || !rellenoMon(gid, mes)) return;
    const H = hojaConFirmas(gid, mes), dias = {};
    Object.keys(H.dias || {}).sort().forEach(f => { const x = H.dias[f]; if (!x || !x.dada) return;
      dias[f] = { dada: true, aus: (x.aus || []).slice(), obs: x.obs || '', fx: x.fx || '', fxii: x.fxii || '' }; });
    const json = JSON.stringify(dias);
    try { if (localStorage.getItem(SKEY(gid, mes)) === json && hojaNube(gid, mes)) return; } catch (e) { }
    guardar('informes/' + gid + '/_hoja/' + mes, Object.keys(dias).length ? { dias, por: PERFIL, ts: Date.now() } : null);
    try { localStorage.setItem(SKEY(gid, mes), json); } catch (e) { }
  }
  let tSub = null;
  const subirLuego = () => { clearTimeout(tSub); tSub = setTimeout(() => subirHoja(grupoSel, mesResumen), 800); };

  const _firmarSesion15 = firmarSesion;
  firmarSesion = function (gid, mes, f, alAcabar) { return _firmarSesion15(gid, mes, f, () => { alAcabar(); subirHoja(gid, mes); }); };
  const _enviar15 = enviarAnexosMon;
  enviarAnexosMon = function (btn) { subirHoja(grupoSel, mesResumen); return _enviar15(btn); };
  ['change', 'click'].forEach(ev => document.addEventListener(ev, e => { if (esMonitor() && e.target.closest && e.target.closest('#dlgIn') && $('firmasDias')) subirLuego(); }));
  // Al abrir la app, sube lo que ya estuviera firmado en este dispositivo
  const arranque = setInterval(() => {
    if (!PERFIL || !D || !D.grupos) return; clearInterval(arranque);
    if (!esMonitor()) return;
    Object.entries(D.grupos).filter(([, g]) => g.monitor === PERFIL).forEach(([gid]) => mesesProg().forEach(m => { if (rellenoMon(gid, m)) subirHoja(gid, m); }));
  }, 3000);

  // ── Coordinación: ver y descargar los anexos de todos los grupos ──
  const ordenados = () => Object.entries(D.grupos || {}).sort((a, b) => ordGrupo(a[1]) - ordGrupo(b[1]) || (a[1].nombre || '').localeCompare(b[1].nombre || ''));
  const R15 = (gid, mes) => { const h = hojaNube(gid, mes); return h ? { dias: JSON.parse(JSON.stringify(h.dias || {})), firma: '' } : null; };
  const nomPdf = (g, mes) => (g.nombre + ' - Anexos X y XII - ' + MESES[+mes.slice(5) - 1] + ' ' + mes.slice(0, 4)).replace(/[\\/:*?"<>|]/g, '') + '.pdf';
  const pdfDe = (gid, mes) => { const R = R15(gid, mes); return window.anexosAPdf([() => _docXFirmado(gid, mes, R), () => _docXIIFirmado(gid, mes, R)]); };
  const bajar = (blob, nombre) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000); };

  function tarjeta() {
    const mes = mesResumen, mesN = MESES[+mes.slice(5) - 1], G = ordenados();
    let hay = 0;
    const filas = G.map(([gid, g]) => {
      const h = hojaNube(gid, mes);
      if (!h) return '<div class="item"><div class="cuerpo"><div class="tt">' + esc(g.nombre) + '</div><div class="dd muted">Aún no hay hoja de ' + esc(mesN) + '</div></div></div>';
      hay++;
      const F = Object.keys(h.dias || {}), ok = F.filter(f => h.dias[f].fx && h.dias[f].fxii).length;
      return '<div class="item"><div class="cuerpo"><div class="tt">' + esc(g.nombre) + '</div><div class="dd">' + F.length + ' sesiones · ' +
        (ok === F.length ? '<span style="color:var(--ok)">✔ todas firmadas</span>' : '<span style="color:#b45309">⚠️ ' + (F.length - ok) + ' sin firmar</span>') +
        ' · actualizada el ' + esc(new Date(h.ts || 0).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })) + '</div></div>' +
        '<button class="btn sec peq" data-h15="x|' + gid + '">Anexo X</button> <button class="btn sec peq" data-h15="xii|' + gid + '">Anexo XII</button> <button class="btn peq" data-h15="pdf|' + gid + '">⬇️ PDF</button></div>';
    }).join('');
    return '<div class="card" style="border-left:5px solid #25d366"><div class="card-h"><h2>📥 Anexos X y XII de las monitoras · ' + esc(mesN) + '</h2>' +
      (hay > 1 ? '<button class="btn" data-h15="zip|">⬇️ Todos (.zip)</button>' : '') + '</div>' +
      '<p class="small">Llegan solos cuando la monitora firma cada sesión en su móvil; ya no hace falta que te los mande. Los nombres del alumnado salen de este dispositivo.</p>' + filas + '</div>';
  }
  const _rAcomp15 = rAcomp;
  rAcomp = function () {
    const h = _rAcomp15();
    if (esMon() || !grupoSel || !mesResumen) return h;
    const m = '<div class="card" style="border-left:5px solid var(--ok)"><div class="card-h"><h2>📤 Para subir a Séneca';
    return h.includes(m) ? h.replace(m, tarjeta() + m) : h + tarjeta();
  };
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-h15]'); if (!b) return;
    const [q, gid] = b.dataset.h15.split('|'), mes = mesResumen;
    if (q === 'x') return _docXFirmado(gid, mes, R15(gid, mes));
    if (q === 'xii') return _docXIIFirmado(gid, mes, R15(gid, mes));
    const t0 = b.textContent; b.disabled = true; b.textContent = '⏳ Preparando…';
    try {
      if (q === 'pdf') { const bl = await pdfDe(gid, mes); if (!bl) throw new Error('sin documento'); bajar(bl, nomPdf(D.grupos[gid], mes)); }
      else {
        await cargarScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
        const zip = new JSZip();
        for (const [g2, g] of ordenados()) { if (!hojaNube(g2, mes)) continue; b.textContent = '⏳ ' + g.nombre + '…'; const bl = await pdfDe(g2, mes); if (bl) zip.file(nomPdf(g, mes), bl); }
        bajar(await zip.generateAsync({ type: 'blob' }), 'PROA - Anexos X y XII - ' + MESES[+mes.slice(5) - 1] + ' ' + mes.slice(0, 4) + '.zip');
      }
      toast('✅ Descargado');
    } catch (er) { console.warn(er); toast('No se ha podido preparar el PDF', 'err'); }
    b.disabled = false; b.textContent = t0;
  });
})();
