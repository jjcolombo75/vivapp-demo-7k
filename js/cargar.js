/* Vivapp · cargador (versión 43). Une las piezas en el orden original y arranca la app.
   html/*.html: bloques <!--#hNN--> que reemplazan a <template data-b="hNN"> de index.html.
   img/*.svg: símbolos (logo, sello, íconos, patrón) dentro de un único <svg> oculto.
   js/*.js: bloques //#bloque NNN, ordenados por número, dentro de la función principal; después js/halo.js. */
(function () {
  var V = '50';
  var HTML = ["captacion", "inicio", "entrenar", "progreso", "club", "gestion", "comunidad", "demo"], SVG = ["logo", "sello", "iconos", "patron"], JS = ["datos", "comun", "inicio", "entrenar", "progreso", "club", "comunidad", "captacion", "demo"];
  var SVG_A = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>', SVG_B = '</defs></svg>';
  function get(u) {
    return new Promise(function (ok, ko) {
      var x = new XMLHttpRequest();
      x.open('GET', u + '?v=' + V);
      x.onload = function () { if ((x.status === 200 || x.status === 0) && x.responseText) ok(x.responseText); else ko(new Error('No cargó ' + u + ' (' + x.status + ')')); };
      x.onerror = function () { ko(new Error('No cargó ' + u)); };
      x.send();
    });
  }
  function blocks(text, re, out) {
    var p = text.split(re);
    for (var i = 1; i < p.length; i += 2) out[p[i]] = p[i + 1].slice(0, -1);
  }
  var urls = HTML.map(function (f) { return 'html/' + f + '.html'; })
    .concat(SVG.map(function (f) { return 'img/' + f + '.svg'; }))
    .concat(JS.map(function (f) { return 'js/' + f + '.js'; }), ['js/halo.js']);
  Promise.all(urls.map(get)).then(function (t) {
    var hb = {}, i = 0, k;
    for (k = 0; k < HTML.length; k++) blocks(t[i++], /^<!--#(h\d+)-->\n/m, hb);
    var sym = '';
    for (k = 0; k < SVG.length; k++) { var s = t[i++]; sym += s.slice(s.indexOf('>\n') + 2, s.lastIndexOf('\n</svg>')); }
    hb.svg = SVG_A + sym + SVG_B;
    var jb = {};
    for (k = 0; k < JS.length; k++) { var js = t[i++]; blocks(js.slice(js.indexOf('//#bloque')), /^\/\/#bloque (\d+)\n/m, jb); }
    var halo = t[i++];
    Array.prototype.forEach.call(document.querySelectorAll('template[data-b]'), function (tp) {
      if (!(tp.dataset.b in hb)) throw new Error('Falta el bloque ' + tp.dataset.b);
      var r = document.createRange(); r.selectNode(tp);
      tp.parentNode.replaceChild(r.createContextualFragment(hb[tp.dataset.b]), tp);
    });
    var body = Object.keys(jb).sort(function (a, b) { return a - b; }).map(function (n) { return jb[n]; }).join('\n');
    var a = document.createElement('script');
    a.textContent = '\n(function(){\n' + body + '\n})();\n//# sourceURL=vivapp.js';
    document.body.appendChild(a);
    var b = document.createElement('script');
    b.textContent = '\n' + halo + '//# sourceURL=halo.js';
    document.body.appendChild(b);
  }).catch(function (e) { console.error(e); });
})();
