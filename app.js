(function () {
  var datos = window.NOTICIAS || { temas: [] };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };
  var slug = function (s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"); };
  var $ = function (id) { return document.getElementById(id); };

  var h = new Date().getHours();
  $("saludo").textContent = h < 13 ? "Buen día" : h < 20 ? "Buenas tardes" : "Buenas noches";
  var f = datos.fecha ? new Date(datos.fecha + "T12:00:00") : new Date();
  var fs = f.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("fecha").textContent = fs.charAt(0).toUpperCase() + fs.slice(1);
  if (datos.ejemplo) $("aviso").hidden = false;

  var temas = datos.temas || [];
  var total = temas.reduce(function (a, t) { return a + (t.noticias || []).length; }, 0);
  $("intro").textContent = total + " noticias en " + temas.length + " temas. Lo esencial, sin ruido.";

  var nav = "", html = "";
  temas.forEach(function (t, i) {
    var id = slug(t.nombre), n = (t.noticias || []).length, c = "t" + (i % 5);
    nav += '<a class="' + c + '" href="#' + id + '">' + esc(t.nombre) + '<span>' + n + "</span></a>";
    html += '<section id="' + id + '" class="tema ' + c + '"><div class="tema-cab"><h2>' + esc(t.nombre) +
      '</h2><span class="cuenta">' + n + (n === 1 ? " noticia" : " noticias") + '</span></div><div class="lista">';
    (t.noticias || []).forEach(function (x) {
      html += '<article class="nota"><h3>' + esc(x.titulo) + "</h3><p>" + esc(x.resumen) +
        '</p><a class="fuente" href="' + esc(x.url || "#") + '" target="_blank" rel="noopener">' + esc(x.fuente) + ' <span aria-hidden="true">↗</span></a></article>';
    });
    html += "</div></section>";
  });
  $("nav").innerHTML = nav;
  $("contenido").innerHTML = html || "<p>No hay noticias cargadas.</p>";
})();
