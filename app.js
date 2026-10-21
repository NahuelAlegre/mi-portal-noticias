(function () {
  var datos = window.NOTICIAS || { temas: [] };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };
  var slug = function (s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"); };
  var $ = function (id) { return document.getElementById(id); };
  var HILOS = window.HILOS || {};
  var hoy = datos.fecha || new Date().toISOString().slice(0, 10);
  var dias = function (a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5); };
  var fechaCorta = function (iso) { return new Date(iso + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }); };
  var nombreHilo = function (id) { return (HILOS[id] && HILOS[id].nombre) || id; };

  var fuente = function (x) {
    return x.fuente ? '<a class="fuente" href="' + esc(x.url || "#") + '" target="_blank" rel="noopener">' + esc(x.fuente) + ' <span aria-hidden="true">↗</span></a>' : "";
  };

  var h = new Date().getHours();
  $("saludo").textContent = h < 13 ? "Buen día" : h < 20 ? "Buenas tardes" : "Buenas noches";
  var f = datos.fecha ? new Date(datos.fecha + "T12:00:00") : new Date();
  var fs = f.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("fecha").textContent = fs.charAt(0).toUpperCase() + fs.slice(1);
  if (datos.ejemplo) $("aviso").hidden = false;

  var temas = datos.temas || [];
  var colorDe = {};
  temas.forEach(function (t, i) { colorDe[t.nombre] = "t" + (i % 5); });
  var clase = function (tema) { return colorDe[tema] || "t0"; };
  var total = temas.reduce(function (a, t) { return a + (t.noticias || []).length; }, 0);
  $("intro").textContent = total + " noticias en " + temas.length + " temas. Lo esencial, sin ruido.";

  var nav = "";
  var esencial = datos.esencial || [];
  if (esencial.length) {
    nav += '<a class="nav-esencial" href="#esencial">Lo esencial</a>';
    var e = '<div class="bloque-cab"><h2>Lo esencial del día</h2><span class="cuenta">' + esencial.length + ' claves</span></div><ol class="esencial-lista">';
    esencial.forEach(function (x, i) {
      e += '<li class="' + clase(x.tema) + '"><span class="num" aria-hidden="true">' + (i + 1) + '</span><div>' +
        (x.tema ? '<span class="etiqueta">' + esc(x.tema) + "</span>" : "") +
        "<h3>" + esc(x.titulo) + "</h3>" + (x.resumen ? "<p>" + esc(x.resumen) + "</p>" : "") + fuente(x) + "</div></li>";
    });
    $("esencial").innerHTML = e + "</ol>";
    $("esencial").hidden = false;
  }

  var html = "";
  temas.forEach(function (t) {
    var id = slug(t.nombre), n = (t.noticias || []).length, c = clase(t.nombre);
    nav += '<a class="' + c + '" href="#' + id + '">' + esc(t.nombre) + "<span>" + n + "</span></a>";
    html += '<section id="' + id + '" class="tema ' + c + '"><div class="bloque-cab"><h2>' + esc(t.nombre) +
      '</h2><span class="cuenta">' + n + (n === 1 ? " noticia" : " noticias") + '</span></div><div class="lista">';
    (t.noticias || []).forEach(function (x) {
      html += '<article class="nota"><h3>' + esc(x.titulo) + "</h3>" + (x.resumen ? "<p>" + esc(x.resumen) + "</p>" : "") +
        (x.porQueImporta ? '<p class="importa"><strong>Por qué importa</strong> ' + esc(x.porQueImporta) + "</p>" : "") +
        '<div class="pie-nota">' + fuente(x) + (x.hilo ? '<a class="hilo-chip" href="#hilo-' + esc(x.hilo) + '" data-hilo="' + esc(x.hilo) + '">↳ ' + esc(nombreHilo(x.hilo)) +
          ((window.HILOS || {})[x.hilo] ? " · " + (window.HILOS[x.hilo].entradas || []).length + ((window.HILOS[x.hilo].entradas || []).length === 1 ? " entrada" : " entradas") : "") + "</a>" : "") + "</div></article>";
    });
    html += "</div></section>";
  });
  $("temas").innerHTML = html || (esencial.length ? "" : "<p>No hay noticias cargadas.</p>");

  var seg = datos.seguimiento || [];
  var enSeg = {};
  seg.forEach(function (x) { enSeg[x.hilo] = x; });
  var otros = Object.keys(HILOS).filter(function (id) { return !enSeg[id]; })
    .sort(function (a, b) { return (HILOS[b].actualizado || "").localeCompare(HILOS[a].actualizado || ""); });

  var hiloHTML = function (id, x) {
    var H = HILOS[id] || { entradas: [] }, ent = H.entradas || [];
    var c = clase(H.tema), out = '<li id="hilo-' + esc(id) + '" class="' + c + '">' +
      (H.tema ? '<span class="etiqueta">' + esc(H.tema) + "</span>" : "") + "<h3>" + esc(nombreHilo(id)) + "</h3>";
    var prev = ent.filter(function (e) { return e.fecha < hoy; })[0];
    if (x) {
      if (prev) { var n = dias(prev.fecha, hoy); out += '<p class="hace">Última novedad anterior: hace ' + n + (n === 1 ? " día" : " días") + " (" + fechaCorta(prev.fecha) + ")</p>"; }
      if (x.novedad) out += '<p><span class="nuevo">Novedad</span> ' + esc(x.novedad) + "</p>";
      out += fuente(x);
    } else if (H.actualizado) {
      out += '<p class="hace">Última novedad: ' + fechaCorta(H.actualizado) + " · hace " + dias(H.actualizado, hoy) + " días</p>";
    }
    if (ent.length) {
      out += '<details class="linea"><summary>Ver historia completa · ' + ent.length + (ent.length === 1 ? " entrada" : " entradas") + "</summary><ol>";
      ent.forEach(function (e) {
        out += '<li><time datetime="' + esc(e.fecha) + '">' + fechaCorta(e.fecha) + "</time><strong>" + esc(e.titulo) + "</strong>" +
          (e.resumen ? "<span>" + esc(e.resumen) + "</span>" : "") + fuente(e) + "</li>";
      });
      out += "</ol></details>";
    }
    return out + "</li>";
  };

  var archivados = otros.filter(function (id) { return !HILOS[id].actualizado || dias(HILOS[id].actualizado, hoy) > 30; });
  otros = otros.filter(function (id) { return archivados.indexOf(id) < 0; });

  if (seg.length || otros.length || archivados.length) {
    nav += '<a class="nav-seg" href="#seguimiento">Hilos<span>' + (seg.length + otros.length) + "</span></a>";
    var s = '<div class="bloque-cab"><h2>Seguimiento</h2><span class="cuenta">' + seg.length + " con novedades</span></div>" +
      '<p class="seg-intro">Historias que seguimos en el tiempo. Abrí cada hilo para ver cómo evolucionó.</p>';
    if (seg.length) s += '<ul class="seg-lista">' + seg.map(function (x) { return hiloHTML(x.hilo, x); }).join("") + "</ul>";
    if (otros.length) s += '<h4 class="seg-sub">Otros hilos</h4><ul class="seg-lista dormidos">' + otros.map(function (id) { return hiloHTML(id, null); }).join("") + "</ul>";
    if (archivados.length) s += '<details class="archivo" id="archivo-hilos"><summary>Archivo de hilos · ' + archivados.length +
      '<small>Sin novedades hace más de 30 días</small></summary><ul class="seg-lista dormidos">' + archivados.map(function (id) { return hiloHTML(id, null); }).join("") + "</ul></details>";
    $("seguimiento").innerHTML = s;
    $("seguimiento").hidden = false;
  }

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("a.hilo-chip");
    if (!a) return;
    var el = document.getElementById("hilo-" + a.getAttribute("data-hilo"));
    if (!el) return;
    ev.preventDefault();
    var arch = el.closest(".archivo"); if (arch) arch.open = true;
    var det = el.querySelector("details.linea"); if (det) det.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.remove("resaltado"); void el.offsetWidth; el.classList.add("resaltado");
    history.replaceState(null, "", "#hilo-" + a.getAttribute("data-hilo"));
  });
  $("nav").innerHTML = nav;
})();
