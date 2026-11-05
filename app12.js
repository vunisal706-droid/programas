// ─── Enviar los nombres del alumnado a las monitoras (por WhatsApp o Gmail) sin subirlos a la nube ───
(function () {
  const MON = () => Object.entries(PERFILES).filter(([, p]) => p.mon);
  const nomsGrupo = gid => { try { return JSON.parse(localStorage.getItem('programas-nombres-' + gid) || '{}'); } catch (e) { return {}; } };

  // Qué lleva el archivo de cada persona: sus grupos (y comedor y aula matinal si los lleva), solo alumnado en activo
  function paquete(perfil) {
    const p = PERFILES[perfil] || {}, out = { tipo: 'programas-nombres', v: 1, curso: CURSO, para: perfil, fecha: hoyIso(), grupos: {}, apertura: {} };
    let n = 0, sin = 0, bajas = 0;
    Object.entries(D.grupos || {}).filter(([, g]) => g.monitor === perfil || (p.tut && g.nombre === p.tut)).forEach(([gid, g]) => {
      const N = nomsGrupo(gid), r = {};
      Object.entries(g.alumnos || {}).forEach(([aid, a]) => { if (a.baja) { bajas++; return; } if (N[aid]) { r[aid] = N[aid]; n++; } else sin++; });
      out.grupos[gid] = { nombre: g.nombre, nombres: r };
    });
    if (p.apertura && typeof SRV !== 'undefined') Object.keys(SRV).forEach(s => {
      const N = nomsApt(s), r = {};
      Object.entries(aptDe(s).alumnos || {}).forEach(([aid, a]) => { if (a.baja) { bajas++; return; } if (N[aid]) { r[aid] = N[aid]; n++; } else sin++; });
      out.apertura[s] = r;
    });
    return { out, n, sin, bajas };
  }

  // ── Coordinación: botón y ventana para enviar ──
  const _rAcomp12 = rAcomp;
  rAcomp = function () {
    let h = _rAcomp12();
    if (!esMon() && Object.keys(D.grupos || {}).length) h = h.replace('<button class="btn sec" data-acc7="todo">', '<button class="btn sec" data-env="abrir">📤 Enviar nombres a las monitoras</button> <button class="btn sec" data-acc7="todo">');
    h = (esMon() ? tarjetaCargar() : tarjetaYo()) + h;
    return h;
  };
  if (RENDER.apertura) { const _ra = RENDER.apertura; RENDER.apertura = function () { const h = _ra(); return !puedeApt() ? h : (esMon() ? tarjetaCargar() : tarjetaYo()) + h; }; }

  function paqueteYo() {
    const claves = {}; let n = 0;
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('programas-nombres-')) { claves[k] = localStorage.getItem(k); try { n += Object.keys(JSON.parse(claves[k])).length; } catch (e) { } } }
    return { out: { tipo: 'programas-nombres', v: 1, curso: CURSO, para: 'yo', de: PERFIL, fecha: hoyIso(), claves }, n };
  }
  function tarjetaYo() {
    const { total, sin } = faltan();
    return '<div class="card" style="border-left:5px solid ' + (sin ? '#e08a1e' : '#22a06b') + '"><div class="card-h"><div><h2>📲 Nombres en tus otros dispositivos</h2><p class="small muted">' +
      (sin ? '<b>En este dispositivo faltan ' + sin + ' de ' + total + ' nombres.</b> Desde el dispositivo donde los tienes, pulsa «Enviármelos» y aquí «Cargar nombres».' : 'Aquí tienes todos los nombres. Para llevarlos a tu móvil u otro ordenador: «Enviármelos» aquí y «Cargar nombres» allí.') +
      '</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sec" data-env="yo">📤 Enviármelos</button><button class="btn' + (sin ? '' : ' sec') + '" data-env="cargar">📥 Cargar nombres</button></div></div></div>';
  }
  async function enviarYo() {
    const { out, n } = paqueteYo(); if (!n) return toast('En este dispositivo no hay nombres. Hazlo desde donde los tengas.', 'err');
    const nombre = 'nombres-alumnado-todos.json', file = new File([JSON.stringify(out)], nombre, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Nombres del alumnado · Programas' }); toast('Enviado. En el otro dispositivo: «📥 Cargar nombres»'); return; } catch (e) { if (e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    toast('Descargado «' + nombre + '» (' + n + ' nombres). Mándatelo por WhatsApp o Gmail y en el otro dispositivo pulsa «📥 Cargar nombres».');
  }
  function dlgEnviar() {
    const filas = MON().map(([k, p]) => { const { n, sin, bajas } = paquete(k);
      return '<label style="display:flex;gap:10px;align-items:center;margin:6px 0;padding:8px 10px;border:1px solid var(--border);border-radius:12px;font-weight:700"><input type="radio" name="envP" value="' + k + '" style="width:18px;height:18px"' + (k === 'sandra' ? ' checked' : '') + '> ' + esc(p.emoji + ' ' + p.nombre) +
        ' <span class="small muted" style="font-weight:400">· ' + n + ' nombres' + (sin ? ' · <span style="color:#b45309">⚠️ ' + sin + ' sin nombre</span>' : '') + (bajas ? ' · ' + bajas + ' de baja (no van)' : '') + '</span></label>'; }).join('');
    $('dlgIn').innerHTML = '<h2>📤 Enviar nombres a una monitora</h2><p class="small muted">Se crea un archivo con los nombres completos de <b>su</b> alumnado (sus grupos' + (PERFILES.sandra && PERFILES.sandra.apertura ? ' y, a Sandra, el comedor y el aula matinal' : '') + '). <b>El alumnado dado de baja no va.</b> Los nombres no se suben a la nube: viajan solo en el archivo.</p>' + filas +
      '<p class="small muted">En el móvil se abre la ventana de compartir para elegir <b>WhatsApp</b> o <b>Gmail</b>. Ella solo tiene que pulsar «📥 Cargar nombres» en la app y elegir el archivo.</p>' +
      '<div class="pie"><button class="btn sec" id="envC">Cancelar</button><button class="btn sec" id="envG">✉️ Gmail</button><button class="btn sec" id="envW">💬 WhatsApp</button><button class="btn" id="envOk">📲 Compartir</button></div>';
    $('dlg').showModal();
    $('envC').onclick = () => $('dlg').close();
    const preparar = () => { const k = (document.querySelector('[name=envP]:checked') || {}).value; if (!k) { toast('Elige a quién se lo mandas', 'err'); return null; }
      const { out, n } = paquete(k); if (!n) { toast('No hay nombres para ' + PERFILES[k].nombre + ' en este dispositivo', 'err'); return null; }
      const nombre = 'nombres-alumnado-' + k + '.json', file = new File([JSON.stringify(out)], nombre, { type: 'application/json' });
      const txt = 'Hola, ' + PERFILES[k].nombre + '. Te mando la lista de tu alumnado para la app Programas. Descarga el archivo «' + nombre + '», abre la app, entra con tu usuario y pulsa «📥 Cargar nombres». Elige este archivo y ya te salen los nombres. (No lo reenvíes: lleva datos del alumnado.)';
      return { k, file, nombre, txt };
    };
    const bajar = x => { const a = document.createElement('a'); a.href = URL.createObjectURL(x.file); a.download = x.nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000); };
    $('envOk').onclick = async () => { const x = preparar(); if (!x) return;
      if (navigator.canShare && navigator.canShare({ files: [x.file] })) { try { await navigator.share({ files: [x.file], title: 'Nombres del alumnado · Programas', text: x.txt }); $('dlg').close(); toast('Enviado'); return; } catch (e) { if (e.name === 'AbortError') return; } }
      bajar(x); toast('Este navegador no comparte archivos: se ha descargado. Usa WhatsApp o Gmail y adjúntalo.', 'err'); };
    $('envW').onclick = () => { const x = preparar(); if (!x) return; bajar(x); window.open('https://wa.me/?text=' + encodeURIComponent(x.txt), '_blank'); toast('Archivo descargado: adjúntalo en el chat de WhatsApp (📎)'); };
    $('envG').onclick = () => { const x = preparar(); if (!x) return; bajar(x); window.open('https://mail.google.com/mail/?view=cm&fs=1&su=' + encodeURIComponent('Nombres del alumnado · app Programas') + '&body=' + encodeURIComponent(x.txt), '_blank'); toast('Archivo descargado: adjúntalo en el correo (📎)'); };
  }
  document.addEventListener('click', e => { const t = e.target.closest('[data-env]'); if (!t) return; if (t.dataset.env === 'abrir') dlgEnviar(); else if (t.dataset.env === 'yo') enviarYo(); else if (t.dataset.env === 'cargar') cargar(); });

  // ── Monitoras: cargar el archivo recibido ──
  function faltan() {
    let total = 0, sin = 0;
    Object.entries(D.grupos || {}).filter(([, g]) => !esMon() || miGrupo(g)).forEach(([gid, g]) => { const N = nomsGrupo(gid); Object.entries(g.alumnos || {}).forEach(([aid, a]) => { if (a.baja) return; total++; if (!N[aid]) sin++; }); });
    if ((!esMon() || (PERFILES[PERFIL] || {}).apertura) && typeof SRV !== 'undefined') Object.keys(SRV).forEach(s => { const N = nomsApt(s); Object.entries(aptDe(s).alumnos || {}).forEach(([aid, a]) => { if (a.baja) return; total++; if (!N[aid]) sin++; }); });
    return { total, sin };
  }
  function tarjetaCargar() {
    const { total, sin } = faltan();
    return '<div class="card" style="border-left:5px solid ' + (sin ? '#e08a1e' : '#22a06b') + '"><div class="card-h"><div><h2>📥 Nombres de tu alumnado</h2><p class="small muted">' +
      (sin ? '<b>Faltan ' + sin + ' de ' + total + ' nombres.</b> Carga el archivo que te ha mandado coordinación por WhatsApp o Gmail.' : 'Tienes todos los nombres. Si te mandan uno nuevo (altas o bajas), cárgalo otra vez.') +
      '</p></div><button class="btn' + (sin ? '' : ' sec') + '" data-env="cargar">📥 Cargar nombres</button></div></div>';
  }
  function cargar() {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json,text/plain,*/*';
    i.onchange = () => { const f = i.files[0]; if (!f) return; f.text().then(t => {
      let o; try { o = JSON.parse(t); } catch (e) { return toast('Ese archivo no es el de los nombres', 'err'); }
      if (o.tipo !== 'programas-nombres') { // copia antigua de «Copia de nombres»
        let n = 0; Object.entries(o).forEach(([k, v]) => { if (k.startsWith('programas-nombres-')) { localStorage.setItem(k, v); n++; } });
        toast(n ? 'Nombres cargados' : 'Ese archivo no es el de los nombres', n ? '' : 'err'); return render(); }
      if (o.claves) { let n = 0; Object.entries(o.claves).forEach(([k, v]) => { if (k.startsWith('programas-nombres-')) { localStorage.setItem(k, v); try { n += Object.keys(JSON.parse(v)).length; } catch (e) { } } }); toast('✅ ' + n + ' nombres cargados en este dispositivo'); return render(); }
      if (o.para && PERFIL && o.para !== PERFIL && esMon() && !confirm('Este archivo es para ' + ((PERFILES[o.para] || {}).nombre || o.para) + '. ¿Cargarlo igualmente?')) return;
      let n = 0, quitados = 0; const grupos = [];
      Object.entries(o.grupos || {}).forEach(([gid, x]) => { const antes = Object.keys(nomsGrupo(gid)).length; localStorage.setItem('programas-nombres-' + gid, JSON.stringify(x.nombres || {})); const ahora = Object.keys(x.nombres || {}).length; n += ahora; quitados += Math.max(0, antes - ahora); grupos.push(x.nombre); });
      Object.entries(o.apertura || {}).forEach(([s, N]) => { const antes = Object.keys(nomsApt(s)).length; localStorage.setItem(AKEY(s), JSON.stringify(N || {})); n += Object.keys(N || {}).length; quitados += Math.max(0, antes - Object.keys(N || {}).length); grupos.push(SRV[s] ? SRV[s].n : s); });
      toast('✅ ' + n + ' nombres cargados' + (grupos.length ? ' (' + grupos.join(', ') + ')' : '') + (quitados ? ' · ' + quitados + ' de baja quitados' : ''));
      render();
    }); };
    i.click();
  }
})();
