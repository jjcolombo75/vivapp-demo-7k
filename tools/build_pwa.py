"""Copia para iPhone a partir de la versión partida.
Uso: python3 tools/build_pwa.py vNN <clon>
Copia los archivos de vNN al clon, ajusta index.html (metas de app, modo oscuro)
y reemplaza html/gestion.html ("Lo que ve Viva", NPS real) por un aviso; saca el botón que la abre.
Falla si queda algún dato real."""
import os, re, shutil, sys
src, dst = sys.argv[1], sys.argv[2]
for d in ('css', 'html', 'js', 'img'):
    shutil.rmtree(os.path.join(dst, d), ignore_errors=True)
    shutil.copytree(os.path.join(src, d), os.path.join(dst, d))

p = os.path.join(dst, 'index.html')
s = open(os.path.join(src, 'index.html'), encoding='utf-8').read()
a = '<meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">'
assert s.count(a) == 1
meta = a.replace('initial-scale=1,', 'initial-scale=1,maximum-scale=1,user-scalable=no,') + (
    '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Vivapp">'
    '<meta name="theme-color" content="#05070a"><meta name="robots" content="noindex,nofollow">'
    '<link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" href="icon-192.png"><link rel="manifest" href="manifest.webmanifest">')
for x, y in [(a, meta), (':root{color-scheme:light;', ':root{color-scheme:dark;'), ('background:#fff;color:#000}', 'background:#05070a;color:#eef2f8}')]:
    assert s.count(x) == 1, x
    s = s.replace(x, y)
open(p, 'w', encoding='utf-8').write(s)

g = os.path.join(dst, 'html', 'gestion.html')
t = open(g, encoding='utf-8').read()
mk = re.match(r'<!--#(h\d+)-->\n', t).group(0)
open(g, 'w', encoding='utf-8').write(mk + '<section class="scr" id="gestion" hidden aria-label="Lo que ve Viva"><div class="body"><p class="muted">No incluido en esta copia.</p></div></section>\n\n\n')

dm = os.path.join(dst, 'html', 'demo.html')
t = open(dm, encoding='utf-8').read()
btn = '<button class="btn ghost sm" data-go="gestion">Ver lo que ve Viva</button>'
assert t.count(btn) == 1
open(dm, 'w', encoding='utf-8').write(t.replace(btn, '<!--sin-gestion-->'))

for root, _, fs in os.walk(dst):
    if '.git' in root: continue
    for f in fs:
        if f.endswith(('.html', '.js', '.css', '.svg')):
            c = open(os.path.join(root, f), encoding='utf-8').read()
            assert 'WeHelp · real' not in c, f
assert 'No incluido en esta copia.' in open(g, encoding='utf-8').read()
print('pwa ok')
