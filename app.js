(function () {
  var datos = window.NOTICIAS || { temas: [] };
  var HILOS = window.HILOS || {};
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };
  var hoy = datos.fecha || new Date().toISOString().slice(0, 10);
  var dias = function (a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5); };
  var fechaCorta = function (iso) { return new Date(iso + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" }).replace(".", ""); };
  var plural = function (n, s, p) { return n + " " + (n === 1 ? s : p); };
  var corto = function (nombre) {
    var p = String(nombre).trim().split(/\s+/);
    return nombre.length > 14 && p.length > 1 ? p.map(function (w) { return w.charAt(0).toUpperCase(); }).join("") : nombre;
  };
  var GLOSARIO = window.GLOSARIO || {};
  var ICONOS = {
    "flecha-diag": '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    "flecha-arriba": '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    "historial": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    "chevron": '<path d="m6 9 6 6 6-6"/>',
    "diana": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    "persona": '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    "ley": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    "organizacion": '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
    "lugar": '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    "sol": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    "luna": '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    "concepto": '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
  };
  var ico = function (nombre, cls) {
    return '<svg class="ico' + (cls ? " " + cls : "") + '" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONOS[nombre] || "") + "</svg>";
  };
  var TIPOS = { persona: "Persona", ley: "Ley / norma", organizacion: "Organización", lugar: "Lugar", concepto: "Concepto" };
  var dominio = function (u) { var m = /^https?:\/\/([^\/?#:]+)/i.exec(u || ""); return m ? m[1].replace(/^www\./i, "") : ""; };
  var fuente = function (x) {
    if (!x.fuente) return "";
    var d = dominio(x.url);
    return '<a class="fuente" href="' + esc(x.url || "#") + '" target="_blank" rel="noopener">' +
      (d ? '<img class="fav" src="https://www.google.com/s2/favicons?domain=' + encodeURIComponent(d) + '&amp;sz=32" width="14" height="14" loading="lazy" alt="" onerror="this.remove()">' : "") +
      esc(x.fuente) + ico("flecha-diag", "ico-11") + "</a>";
  };

  // Glosario: marca la primera aparición de cada término (título → resumen → porQueImporta)
  var marcar = function (textos, ids) {
    var rangos = textos.map(function () { return []; }), faltan = [];
    ids.slice(0, 4).forEach(function (id) {
      var g = GLOSARIO[id]; if (!g) return;
      var terms = [g.nombre].concat(g.alias || []).filter(Boolean)
        .sort(function (a, b) { return b.length - a.length; });
      for (var ti = 0; ti < textos.length; ti++) {
        var low = (textos[ti] || "").toLowerCase();
        for (var k = 0; k < terms.length; k++) {
          var q = terms[k].toLowerCase(), from = 0, i;
          while ((i = low.indexOf(q, from)) >= 0) {
            var fin = i + q.length;
            var choca = rangos[ti].some(function (r) { return i < r[1] && fin > r[0]; });
            if (!choca) { rangos[ti].push([i, fin, id]); return; }
            from = i + 1;
          }
        }
      }
      faltan.push(id);
    });
    var html = textos.map(function (t, ti) {
      t = t || ""; var rs = rangos[ti].sort(function (a, b) { return a[0] - b[0]; }), out = "", pos = 0;
      rs.forEach(function (r) {
        out += esc(t.slice(pos, r[0])) + '<span class="term" tabindex="0" data-g="' + esc(r[2]) + '">' + esc(t.slice(r[0], r[1])) + "</span>";
        pos = r[1];
      });
      return out + esc(t.slice(pos));
    });
    return { html: html, faltan: faltan };
  };

  // Fecha y hora de actualización
  var f = new Date(hoy + "T12:00:00");
  var fs = f.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  var txtFecha = fs.charAt(0).toUpperCase() + fs.slice(1);
  if (datos.actualizado) {
    var act = new Date(datos.actualizado);
    if (!isNaN(act)) txtFecha += " · act. " + act.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });
  }
  $("fecha").textContent = txtFecha;
  if (datos.ejemplo) $("aviso").hidden = false;

  var temas = (datos.temas || []).slice(0, 3);
  var colorDe = {};
  temas.forEach(function (t, i) { colorDe[t.nombre] = "t" + (i % 5); });
  var clase = function (tema) { return colorDe[tema] || "t0"; };
  var total = temas.reduce(function (a, t) { return a + (t.noticias || []).length; }, 0);

  // Ubicar las notas de Lo esencial: primero por url, después por título
  var esencial = (datos.esencial || []).slice(0, 3);
  var numDe = {}, idEsencial = [], notaDeHilo = {};
  var todas = [];
  temas.forEach(function (t, ti) { (t.noticias || []).forEach(function (x, ni) { todas.push({ x: x, id: "nota-" + ti + "-" + ni }); }); });
  esencial.forEach(function (e, i) {
    var m = todas.filter(function (n) { return e.url && n.x.url === e.url; })[0] ||
            todas.filter(function (n) { return e.titulo && n.x.titulo === e.titulo; })[0];
    if (m && !numDe[m.id]) numDe[m.id] = i + 1;
    idEsencial.push(m ? m.id : null);
  });
  todas.forEach(function (n) { if (n.x.hilo && !notaDeHilo[n.x.hilo]) notaDeHilo[n.x.hilo] = n.id; });

  var linea = function (ents) {
    return '<ol class="tl">' + ents.map(function (e) {
      return '<li><time datetime="' + esc(e.fecha) + '">' + esc(fechaCorta(e.fecha)) + "</time><div><strong>" + esc(e.titulo) + "</strong>" +
        (e.resumen ? "<span>" + esc(e.resumen) + "</span>" : "") + fuente(e) + "</div></li>";
    }).join("") + "</ol>";
  };

  // Lo esencial
  if (esencial.length && total) {
    var e = '<p class="rotulo" id="esencial-rot">Lo esencial</p><ol>';
    esencial.forEach(function (x, i) {
      var c = clase(x.tema), dest = idEsencial[i];
      e += '<li class="' + c + '"><a href="' + (dest ? "#" + dest : esc(x.url || "#")) + '"' + (dest ? ' data-ir="' + dest + '"' : ' target="_blank" rel="noopener"') +
        '><span class="num" aria-hidden="true">' + (i + 1) + '</span><span>' + (x.tema ? '<span class="etq">' + esc(x.tema) + "</span>" : "") +
        "<h2>" + esc(x.titulo) + "</h2></span></a></li>";
    });
    $("esencial").innerHTML = e + "</ol>";
    $("esencial").hidden = false;
  }

  // Columnas por tema
  var html = "";
  temas.forEach(function (t, ti) {
    var ns = t.noticias || [], c = clase(t.nombre);
    html += '<section class="col ' + c + '" data-tema="' + ti + '" aria-labelledby="tema-' + ti + '"><div class="col-cab"><h2 class="rotulo" id="tema-' + ti + '">' +
      esc(t.nombre) + "</h2><span>" + ns.length + "</span></div>";
    if (!ns.length) html += '<p class="nada">Hoy, nada relevante.</p>';
    ns.forEach(function (x, ni) {
      var id = "nota-" + ti + "-" + ni, H = x.hilo && HILOS[x.hilo];
      var ents = H ? (H.entradas || []).filter(function (en) { return en.fecha !== hoy && en.url !== x.url; }) : [];
      var mk = marcar([x.titulo, x.resumen, x.porQueImporta], x.glosario || []);
      var extra = (x.porQueImporta ? '<div class="importa" title="Por qué importa">' + ico("diana") + "<p>" + mk.html[2] + "</p></div>" : "") +
        (ents.length ? '<div class="antes" title="Antes en este hilo">' + linea(ents) + "</div>" : "") +
        (mk.faltan.length ? '<p class="terminos">' + mk.faltan.map(function (g) {
          return '<span class="term" tabindex="0" data-g="' + esc(g) + '">' + esc(GLOSARIO[g].nombre) + "</span>"; }).join(" · ") + "</p>" : "");
      var nEnt = H ? (H.entradas || []).length : 0;
      html += '<article class="nota" id="' + id + '"' + (extra ? ' data-extra="1"' : "") + "><h3>" +
        (numDe[id] ? '<span class="badge" aria-label="Esencial ' + numDe[id] + '">' + numDe[id] + "</span>" : "") + mk.html[0] + "</h3>" +
        (x.resumen ? '<p class="bajada">' + mk.html[1] + "</p>" : "") +
        '<div class="meta">' + fuente(x) +
        (x.hilo ? (function () { var lbl = (H ? H.nombre : x.hilo) + (H ? " · " + plural(nEnt, "entrada", "entradas") : "");
          return '<button type="button" class="hilo-n" data-pop="' + esc(lbl) + '" aria-label="' + esc(lbl) + '">' + ico("historial") + (H ? "<span>" + nEnt + "</span>" : "") + "</button>"; })() : "") +
        '<button type="button" class="ampliar" aria-expanded="false" aria-controls="' + id + '-x" aria-label="Ampliar" title="Ampliar">' + ico("chevron") + "</button></div>" +
        '<div class="extra" id="' + id + '-x" hidden>' + extra + "</div></article>";
    });
    html += "</section>";
  });
  $("temas").innerHTML = html;
  $("temas").style.setProperty("--n", Math.max(1, temas.length));
  if (!total) { $("vacio").hidden = false; $("temas").hidden = true; }

  // Hilos abiertos
  var seg = {};
  (datos.seguimiento || []).forEach(function (x) { seg[x.hilo] = x; });
  var ids = Object.keys(HILOS).sort(function (a, b) { return (HILOS[b].actualizado || "").localeCompare(HILOS[a].actualizado || ""); });
  var archivados = ids.filter(function (id) { return !HILOS[id].actualizado || dias(HILOS[id].actualizado, hoy) > 30; });
  var activos = ids.filter(function (id) { return archivados.indexOf(id) < 0; });
  var fila = function (id) {
    var H = HILOS[id], ent = H.entradas || [], c = clase(H.tema), est, cuerpo = "";
    if (notaDeHilo[id]) {
      est = '<span class="est"><a href="#' + notaDeHilo[id] + '" data-ir="' + notaDeHilo[id] + '" title="Ver la nota de hoy">hoy' + ico("flecha-arriba", "ico-11") + '</a></span>';
      ent = ent.filter(function (e) { return e.fecha !== hoy; });
    } else if (seg[id]) {
      est = '<span class="est nov">novedad hoy</span>';
      cuerpo = '<p class="novedad"><b>Novedad</b>' + esc(seg[id].novedad) + " " + fuente(seg[id]) + "</p>";
    } else {
      var d = H.actualizado ? dias(H.actualizado, hoy) : null;
      est = '<span class="est">' + (d === null ? "" : d <= 0 ? "hoy" : d === 1 ? "ayer" : "hace " + d + " días") + "</span>";
    }
    return '<details class="hilo ' + c + '" id="hilo-' + esc(id) + '"><summary><span class="dot" aria-hidden="true"></span><span class="nom">' + esc(H.nombre || id) +
      "</span>" + est + (function () { var t = plural((H.entradas || []).length, "entrada", "entradas");
        return '<span class="n-ent" title="' + t + '" aria-label="' + t + '">' + ico("historial") + "<span>" + (H.entradas || []).length + "</span></span>"; })() + "</summary>" +
      '<div class="hilo-cuerpo">' + cuerpo + (ent.length ? linea(ent) : "") + "</div></details>";
  };
  if (ids.length) {
    var s = '<div class="col-cab"><h2 class="rotulo" id="hilos-rot">Hilos abiertos</h2><span>' + activos.length + "</span></div>";
    if (activos.length) s += '<div class="hilos-lista">' + activos.map(fila).join("") + "</div>";
    if (archivados.length) s += '<details class="archivo"><summary>Archivo · ' + plural(archivados.length, "hilo", "hilos") +
      ' sin novedades hace más de 30 días</summary><div class="hilos-lista">' + archivados.map(fila).join("") + "</div></details>";
    $("hilos").innerHTML = s;
    $("hilos").hidden = false;
  }

  // Filtros
  var nav = '<button type="button" data-f="todo">Todo</button>';
  temas.forEach(function (t, ti) {
    nav += '<button type="button" class="' + clase(t.nombre) + '" data-f="tema-' + ti + '" title="' + esc(t.nombre) + '"><i aria-hidden="true"></i>' +
      esc(corto(t.nombre)) + " <small>" + (t.noticias || []).length + "</small></button>";
  });
  if (ids.length) nav += '<button type="button" data-f="hilos">Hilos <small>' + activos.length + "</small></button>";
  $("filtros").innerHTML = nav;

  var aplicar = function (fl) {
    if (!document.querySelector('.filtros [data-f="' + fl + '"]')) fl = "todo";
    document.body.setAttribute("data-filtro", fl);
    [].forEach.call(document.querySelectorAll(".filtros button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-f") === fl ? "true" : "false"); });
    var tm = $("temas"), solo = fl.indexOf("tema-") === 0;
    tm.classList.toggle("solo", solo);
    if (solo) tm.hidden = false; else if (!total) tm.hidden = true;
    [].forEach.call(tm.querySelectorAll(".col"), function (col) {
      if (solo && "tema-" + col.getAttribute("data-tema") !== fl) col.setAttribute("data-oculta", ""); else col.removeAttribute("data-oculta");
    });
    try { localStorage.setItem("filtro", fl); } catch (err) {}
    revisar();
  };

  // Ampliar: solo si hay algo extra o la bajada está recortada
  var revisar = function () {
    [].forEach.call(document.querySelectorAll(".nota"), function (n) {
      if (n.classList.contains("abierta")) return;
      var p = n.querySelector(".bajada"), b = n.querySelector(".ampliar");
      if (!p && !n.hasAttribute("data-extra")) { b.hidden = true; return; }
      if (n.offsetParent === null) return;
      b.hidden = !n.hasAttribute("data-extra") && !(p && p.scrollHeight > p.clientHeight + 1);
    });
  };
  var toggle = function (n, abrir) {
    abrir = abrir == null ? !n.classList.contains("abierta") : abrir;
    n.classList.toggle("abierta", abrir);
    n.querySelector(".extra").hidden = !abrir;
    var b = n.querySelector(".ampliar");
    b.hidden = false;
    b.setAttribute("aria-expanded", abrir ? "true" : "false");
    b.setAttribute("aria-label", abrir ? "Reducir" : "Ampliar");
    b.setAttribute("title", abrir ? "Reducir" : "Ampliar");
    if (!abrir) revisar();
  };
  var ir = function (id) {
    var el = $(id); if (!el) return;
    if (document.body.getAttribute("data-filtro") !== "todo") aplicar("todo");
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.remove("resaltada"); void el.offsetWidth; el.classList.add("resaltada");
    history.replaceState(null, "", "#" + id);
  };

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest ? ev.target : ev.target.parentNode;
    var a = t.closest("[data-ir]");
    if (a) { ev.preventDefault(); ir(a.getAttribute("data-ir")); return; }
    var fb = t.closest(".filtros button");
    if (fb) { aplicar(fb.getAttribute("data-f")); window.scrollTo(0, 0); return; }
    var b = t.closest(".ampliar, .hilo-n");
    if (b) { var n = b.closest(".nota"); toggle(n, b.classList.contains("hilo-n") ? true : null); }
  });
  document.addEventListener("animationend", function (ev) { ev.target.classList.remove("resaltada"); });

  // Ficha emergente (glosario y [data-pop])
  var pop = $("pop");
  if (!pop) { pop = document.createElement("div"); pop.id = "pop"; pop.className = "pop"; pop.setAttribute("role", "tooltip"); pop.hidden = true; document.body.appendChild(pop); }
  var actual = null;
  var mostrar = function (el) {
    var html;
    if (el.hasAttribute("data-g")) {
      var g = GLOSARIO[el.getAttribute("data-g")]; if (!g) return;
      html = '<div class="pop-cab">' + ico(TIPOS[g.tipo] ? g.tipo : "concepto") + "<strong>" + esc(g.nombre) + "</strong><small>" + esc(TIPOS[g.tipo] || "") + "</small></div>" +
        (g.texto ? "<p>" + esc(g.texto) + "</p>" : "");
    } else html = "<p>" + esc(el.getAttribute("data-pop")) + "</p>";
    var tema = el.closest(".t0,.t1,.t2,.t3,.t4"), tc = tema && /\bt\d\b/.exec(tema.className);
    pop.className = "pop" + (tc ? " " + tc[0] : "");
    pop.innerHTML = html; pop.hidden = false; actual = el;
    var r = el.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight, M = 12;
    var top = r.bottom + 8;
    if (top + h > innerHeight - M) top = Math.max(M, r.top - 8 - h);
    var left = Math.min(Math.max(M, r.left), document.documentElement.clientWidth - M - w);
    pop.style.top = top + "px"; pop.style.left = Math.max(M, left) + "px";
  };
  var ocultar = function () { pop.hidden = true; actual = null; };
  var objetivo = function (t) { return t && t.closest ? t.closest(".term,[data-pop]") : null; };
  document.addEventListener("mouseover", function (ev) { var el = objetivo(ev.target); if (el && el !== actual) mostrar(el); });
  document.addEventListener("mouseout", function (ev) { var el = objetivo(ev.target); if (el && !el.contains(ev.relatedTarget)) ocultar(); });
  document.addEventListener("focusin", function (ev) { var el = objetivo(ev.target); if (el) mostrar(el); });
  document.addEventListener("focusout", function (ev) { if (objetivo(ev.target)) ocultar(); });
  window.addEventListener("scroll", function () { if (!pop.hidden) ocultar(); }, { passive: true });

  // Tema claro/oscuro: automático salvo elección guardada
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
  var temaActual = function () { var t = document.documentElement.getAttribute("data-theme"); return t || (mq && mq.matches ? "dark" : "light"); };
  var pintarBtn = function () {
    var b = $("tema-btn"); if (!b) return;
    var osc = temaActual() === "dark", lbl = osc ? "Modo claro" : "Modo oscuro";
    b.innerHTML = ico(osc ? "sol" : "luna"); b.title = lbl; b.setAttribute("aria-label", lbl);
  };
  if ($("tema-btn")) $("tema-btn").addEventListener("click", function () {
    var t = temaActual() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("tema", t); } catch (err) {}
    pintarBtn();
  });
  if (mq) { var cb = function () { pintarBtn(); }; if (mq.addEventListener) mq.addEventListener("change", cb); else if (mq.addListener) mq.addListener(cb); }
  pintarBtn();

  var guardado = "todo";
  try { guardado = localStorage.getItem("filtro") || "todo"; } catch (err) {}
  aplicar(guardado);
  window.addEventListener("resize", revisar);
  window.addEventListener("load", revisar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(revisar);
})();
