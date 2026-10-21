(function () {
  var datos = window.NOTICIAS || { temas: [] };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };
  var slug = function (s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"); };
  var $ = function (id) { return document.getElementById(id); };
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
        fuente(x) + "</article>";
    });
    html += "</div></section>";
  });
  $("temas").innerHTML = html || (esencial.length ? "" : "<p>No hay noticias cargadas.</p>");

  var seg = datos.seguimiento || [];
  if (seg.length) {
    nav += '<a class="nav-seg" href="#seguimiento">Seguimiento<span>' + seg.length + "</span></a>";
    var s = '<div class="bloque-cab"><h2>Seguimiento</h2><span class="cuenta">' + seg.length + ' en curso</span></div><p class="seg-intro">Historias que siguen abiertas y qué cambió desde ayer.</p><ul class="seg-lista">';
    seg.forEach(function (x) {
      s += '<li class="' + clase(x.tema) + '">' + (x.tema ? '<span class="etiqueta">' + esc(x.tema) + "</span>" : "") +
        "<h3>" + esc(x.historia) + "</h3>" + (x.novedad ? '<p><span class="nuevo">Novedad</span> ' + esc(x.novedad) + "</p>" : "") + fuente(x) + "</li>";
    });
    $("seguimiento").innerHTML = s + "</ul>";
    $("seguimiento").hidden = false;
  }
  $("nav").innerHTML = nav;
})();
