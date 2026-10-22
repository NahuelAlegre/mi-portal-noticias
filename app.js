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
  var fuente = function (x) {
    return x.fuente ? '<a class="fuente" href="' + esc(x.url || "#") + '" target="_blank" rel="noopener">' + esc(x.fuente) + ' <span aria-hidden="true">↗</span></a>' : "";
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
      var extra = (x.porQueImporta ? '<div class="importa"><h4 class="rotulo">Por qué importa</h4><p>' + esc(x.porQueImporta) + "</p></div>" : "") +
        (ents.length ? '<h4 class="rotulo">Antes en este hilo</h4>' + linea(ents) : "");
      html += '<article class="nota" id="' + id + '"' + (extra ? ' data-extra="1"' : "") + "><h3>" +
        (numDe[id] ? '<span class="badge" aria-label="Esencial ' + numDe[id] + '">' + numDe[id] + "</span>" : "") + esc(x.titulo) + "</h3>" +
        (x.resumen ? '<p class="bajada">' + esc(x.resumen) + "</p>" : "") +
        '<div class="meta">' + fuente(x) +
        (x.hilo ? (x.fuente ? '<span class="sep" aria-hidden="true">·</span>' : "") + '<button type="button" class="hilo-n" title="' + esc(H ? H.nombre : x.hilo) + '">↳ ' +
          esc(H ? H.nombre : x.hilo) + (H ? " · " + (H.entradas || []).length : "") + "</button>" : "") +
        '<button type="button" class="ampliar" aria-expanded="false" aria-controls="' + id + '-x">Ampliar ▾</button></div>' +
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
      est = '<span class="est"><a href="#' + notaDeHilo[id] + '" data-ir="' + notaDeHilo[id] + '">hoy · ver nota ↑</a></span>';
      ent = ent.filter(function (e) { return e.fecha !== hoy; });
    } else if (seg[id]) {
      est = '<span class="est nov">novedad hoy</span>';
      cuerpo = '<p class="novedad"><b>Novedad</b>' + esc(seg[id].novedad) + " " + fuente(seg[id]) + "</p>";
    } else {
      var d = H.actualizado ? dias(H.actualizado, hoy) : null;
      est = '<span class="est">' + (d === null ? "" : d <= 0 ? "hoy" : d === 1 ? "ayer" : "hace " + d + " días") + "</span>";
    }
    return '<details class="hilo ' + c + '" id="hilo-' + esc(id) + '"><summary><span class="dot" aria-hidden="true"></span><span class="nom">' + esc(H.nombre || id) +
      "</span>" + est + '<span class="n-ent">' + plural((H.entradas || []).length, "entrada", "entradas") + "</span></summary>" +
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
    b.textContent = abrir ? "Cerrar ▴" : "Ampliar ▾";
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

  var guardado = "todo";
  try { guardado = localStorage.getItem("filtro") || "todo"; } catch (err) {}
  aplicar(guardado);
  window.addEventListener("resize", revisar);
  window.addEventListener("load", revisar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(revisar);
})();
