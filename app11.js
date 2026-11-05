// ─── Acompañamiento: descargar de golpe los documentos de todos los cursos (PDF para enviar a firmar) ───
(function () {
  const LIBS = ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
  const DOCS = [
    { k: 'acta', t: 'Acta de selección (Anexo XVI)', def: true },
    { k: 'prog', t: 'Programación del grupo', def: true },
    { k: 'aut', t: 'Autorizaciones de las familias (Anexo VI)', def: false }
  ];
  const ordenados = () => Object.entries(D.grupos || {}).sort((a, b) => ordGrupo(a[1]) - ordGrupo(b[1]) || (a[1].nombre || '').localeCompare(b[1].nombre || ''));
  const limpio = t => String(t).replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim();

  // Botón en la cabecera del Acompañamiento (solo coordinación)
  const _rAcomp = rAcomp;
  rAcomp = function () {
    const h = _rAcomp();
    if (esMon() || !Object.keys(D.grupos || {}).length) return h;
    return h.replace('<button class="btn sec" data-acc7="todo">', '<button class="btn" data-lote="abrir">📦 Documentos de todos los cursos</button> <button class="btn sec" data-acc7="todo">');
  };
  document.addEventListener('click', e => { const t = e.target.closest('[data-lote]'); if (t && t.dataset.lote === 'abrir') dlgLote(); });

  function avisosGrupo(gid, g) {
    const A = Object.keys(g.alumnos || {}), N = nombres(gid), sin = A.filter(aid => !N[aid]).length, av = [];
    if (!A.length) av.push('sin alumnado');
    else if (sin) av.push(sin + ' sin nombre completo en este dispositivo');
    if (!(g.acta && g.acta.fecha)) av.push('acta sin fecha');
    return av;
  }
  function dlgLote() {
    const G = ordenados();
    $('dlgIn').innerHTML = '<h2>📦 Documentos de todos los cursos</h2><p class="small muted">Se generan sin firmas, en PDF y separados por cursos, listos para enviarlos a firmar.</p>' +
      '<label>Cursos</label>' + G.map(([gid, g]) => { const av = avisosGrupo(gid, g);
        return '<label style="display:flex;gap:8px;align-items:center;margin:4px 0;font-weight:600"><input type="checkbox" data-lg="' + gid + '" checked style="width:18px;height:18px"> ' + esc(g.nombre) +
          (av.length ? ' <span class="small" style="color:#b45309;font-weight:400">⚠️ ' + esc(av.join(' · ')) + '</span>' : ' <span class="small muted" style="font-weight:400">✓ listo</span>') + '</label>'; }).join('') +
      '<label style="margin-top:10px">Documentos</label>' + DOCS.map(d => '<label style="display:flex;gap:8px;align-items:center;margin:4px 0;font-weight:600"><input type="checkbox" data-ld="' + d.k + '"' + (d.def ? ' checked' : '') + ' style="width:18px;height:18px"> ' + esc(d.t) + '</label>').join('') +
      '<label style="margin-top:10px">Cómo los quieres</label>' +
      '<label style="display:flex;gap:8px;align-items:center;margin:4px 0;font-weight:600"><input type="radio" name="lfmt" value="curso" checked style="width:18px;height:18px"> Un PDF por curso (todos sus documentos juntos)</label>' +
      '<label style="display:flex;gap:8px;align-items:center;margin:4px 0;font-weight:600"><input type="radio" name="lfmt" value="doc" style="width:18px;height:18px"> Un PDF por documento (en una carpeta por curso)</label>' +
      '<p class="small muted">Los nombres completos salen de este dispositivo. Si a un curso le faltan, rellénalos antes en su «Acta de selección».</p>' +
      '<p class="small" id="loteEst" style="font-weight:700"></p>' +
      '<div class="pie"><button class="btn sec" id="loteC">Cancelar</button><button class="btn" id="loteOk">⬇️ Descargar</button></div>';
    $('dlg').showModal();
    let cancel = false;
    $('loteC').onclick = () => { cancel = true; $('dlg').close(); };
    $('loteOk').onclick = async () => {
      const gids = [...document.querySelectorAll('[data-lg]:checked')].map(i => i.dataset.lg), docs = [...document.querySelectorAll('[data-ld]:checked')].map(i => i.dataset.ld);
      const fmt = (document.querySelector('[name=lfmt]:checked') || {}).value || 'curso';
      if (!gids.length || !docs.length) return toast('Elige al menos un curso y un documento', 'err');
      $('loteOk').disabled = true;
      try { await generarLote(gids, docs, fmt, t => { $('loteEst').textContent = t; }, () => cancel); if (!cancel) { $('dlg').close(); toast('✅ Documentos descargados'); } }
      catch (err) { console.error(err); if (!cancel) { $('loteEst').textContent = '❌ ' + (err.message || err); $('loteOk').disabled = false; } }
    };
  }

  // Ejecuta una función que llama a abrirAnexo y recoge el documento en un marco oculto en vez de abrir una ventana
  async function capturar(fn) {
    const fr = document.createElement('iframe');
    fr.style.cssText = 'position:fixed;left:-10000px;top:0;width:840px;height:1200px;border:0;background:#fff';
    document.body.appendChild(fr);
    const abrir = window.open; let usado = false;
    window.open = () => { usado = true; return fr.contentWindow; };
    try { fn(); } finally { window.open = abrir; }
    if (!usado) { fr.remove(); return null; }
    const d = fr.contentDocument;
    const bar = d.querySelector('.bar'); if (bar) bar.remove();
    d.body.style.background = '#fff';
    await Promise.race([d.fonts ? d.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 3000))]);
    await Promise.all([...d.images].map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; setTimeout(r, 4000); })));
    await new Promise(r => setTimeout(r, 150));
    return fr;
  }

  // Convierte las hojas (.pag) del marco en páginas A4 del PDF, con los logos en todas las hojas
  async function hojasAPdf(fr, pdf, primera) {
    const d = fr.contentDocument, S = 2, mm = 210;
    let nueva = !primera;
    for (const pag of d.querySelectorAll('.pag')) {
      pag.style.margin = '0'; pag.style.boxShadow = 'none';
      const cv = await html2canvas(pag, { scale: S, backgroundColor: '#ffffff', useCORS: true, logging: false });
      const pxmm = cv.width / mm, altoPag = 297 * pxmm, mTop = 12 * pxmm, mBot = 12 * pxmm, x0 = Math.round(16 * pxmm), x1 = Math.round(194 * pxmm);
      const ctx = cv.getContext('2d'), datos = ctx.getImageData(0, 0, cv.width, cv.height).data;
      const filaBlanca = y => { const o = y * cv.width * 4; for (let x = x0; x < x1; x += 2) { const i = o + x * 4; if (datos[i] < 238 || datos[i + 1] < 238 || datos[i + 2] < 238) return false; } return true; };
      const vacioDesde = y => { for (let yy = y; yy < cv.height; yy += 2) if (!filaBlanca(yy)) return false; return true; };
      const corte = (desde, max) => { if (max >= cv.height) return cv.height; for (let y = Math.floor(max); y > desde + (max - desde) * .7; y--) if (filaBlanca(y)) return y; return Math.floor(max); };
      // logos de la cabecera para repetirlos en las hojas siguientes
      const lg = pag.querySelector('.logos'), rp = pag.getBoundingClientRect();
      let logo = null;
      if (lg) { const r = lg.getBoundingClientRect(), ly = (r.top - rp.top) * S, lh = (r.height + 14) * S; logo = { y: ly, h: lh }; }
      let y = 0, n = 0;
      while (y < cv.height && !(n > 0 && vacioDesde(y))) {
        const top = n === 0 ? 0 : mTop + (logo ? logo.h : 0);
        const max = n === 0 ? altoPag - mBot : y + (altoPag - top - mBot);
        const fin = corte(y, max), h = fin - y; if (h <= 0) break;
        if (nueva) pdf.addPage(); nueva = true;
        const pc = document.createElement('canvas'); pc.width = cv.width; pc.height = Math.round(altoPag);
        const g = pc.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, pc.width, pc.height);
        if (n > 0 && logo) g.drawImage(cv, 0, logo.y, cv.width, logo.h, 0, mTop, cv.width, logo.h);
        g.drawImage(cv, 0, y, cv.width, h, 0, top, cv.width, h);
        pdf.addImage(pc.toDataURL('image/jpeg', .9), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        y = fin; n++;
      }
    }
  }

  function documentosDe(gid, k) {
    const g = D.grupos[gid];
    if (k === 'acta') {
      const C = Object.assign({}, COMISION_DEF, D.comision || {}); if (!C.eoe) C.eoe = COMISION_DEF.eoe;
      if (!/Sáez Guerrero/.test(C.ciclos || '')) C.ciclos = (C.ciclos || '') + '; María Noelia Sáez Guerrero (Equipo de Orientación)';
      const a = g.acta || {}; let sup = ''; try { sup = localStorage.getItem(NKEY(gid) + '-sup') || ''; } catch (e) { }
      return () => docActa(gid, C, a.fecha || '', a.hora || '', sup);
    }
    if (k === 'prog') return () => _docProg(gid, Object.assign(progPorDefecto(g), g.prog || {}));
    if (k === 'aut') return () => { const ant = grupoSel; grupoSel = gid; try { docAutorizaciones(); } finally { grupoSel = ant; } };
  }
  const NOMBRE_DOC = { acta: 'Acta de selección del alumnado', prog: 'Programación', aut: 'Autorizaciones familiares (Anexo VI)' };

  async function generarLote(gids, docs, fmt, estado, cancelado) {
    estado('⏳ Preparando…');
    for (const s of LIBS) await cargarScript(s);
    const { jsPDF } = window.jspdf, zip = new JSZip(), salidas = [];
    const total = gids.length * docs.length; let hecho = 0;
    for (const gid of gids) {
      const g = D.grupos[gid], curso = limpio(g.nombre || 'Grupo');
      let pdfCurso = fmt === 'curso' ? new jsPDF({ unit: 'mm', format: 'a4', compress: true }) : null, primera = true;
      for (const k of docs) {
        if (cancelado()) return;
        hecho++; estado('⏳ ' + curso + ' · ' + NOMBRE_DOC[k] + ' (' + hecho + ' de ' + total + ')');
        const fr = await capturar(documentosDe(gid, k)); if (!fr) continue;
        try {
          if (fmt === 'curso') { await hojasAPdf(fr, pdfCurso, primera); primera = false; }
          else { const p = new jsPDF({ unit: 'mm', format: 'a4', compress: true }); await hojasAPdf(fr, p, true); salidas.push([curso + '/' + curso + ' - ' + NOMBRE_DOC[k] + '.pdf', p.output('blob')]); }
        } finally { fr.remove(); }
      }
      if (pdfCurso && !primera) salidas.push([curso + ' - Documentos para firmar.pdf', pdfCurso.output('blob')]);
    }
    if (cancelado() || !salidas.length) return;
    const bajar = (blob, nombre) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000); };
    if (salidas.length === 1) return bajar(salidas[0][1], salidas[0][0].split('/').pop());
    estado('⏳ Juntando en un .zip…');
    salidas.forEach(([n, b]) => zip.file(n, b));
    bajar(await zip.generateAsync({ type: 'blob' }), 'PROA Acompañamiento - documentos para firmar ' + CURSO + '.zip');
  }
  // Para otras partes de la app: convertir en PDF lo que abre abrirAnexo
  window.anexosAPdf = async function (fns) {
    for (const s of LIBS.slice(0, 2)) await cargarScript(s);
    const { jsPDF } = window.jspdf, pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true }); let primera = true;
    for (const fn of fns) { const fr = await capturar(fn); if (!fr) continue; try { await hojasAPdf(fr, pdf, primera); primera = false; } finally { fr.remove(); } }
    return primera ? null : pdf.output('blob');
  };
})();
