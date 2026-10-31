"""Inverso de build_pwa.py: arma los archivos del artefacto desde el clon del repositorio.
Uso: python3 tools/desde_repo.py <clon> <salida>
Deja todo menos html/gestion.html ("Lo que ve Viva", solo en el artefacto): al publicar en modo
patch, el artefacto lo conserva. Falla si algo no encaja."""
import os, shutil, sys
src, dst = sys.argv[1], sys.argv[2]
shutil.rmtree(dst, ignore_errors=True); os.makedirs(dst)
for d in ('css', 'html', 'js', 'img'):
    shutil.copytree(os.path.join(src, d), os.path.join(dst, d))
os.remove(os.path.join(dst, 'html', 'gestion.html'))
s = open(os.path.join(src, 'index.html'), encoding='utf-8').read()
a = '<meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">'
meta = a.replace('initial-scale=1,', 'initial-scale=1,maximum-scale=1,user-scalable=no,') + (
    '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Vivapp">'
    '<meta name="theme-color" content="#05070a"><meta name="robots" content="noindex,nofollow">'
    '<link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" href="icon-192.png"><link rel="manifest" href="manifest.webmanifest">')
for x, y in [(meta, a), (':root{color-scheme:dark;', ':root{color-scheme:light;'), ('background:#05070a;color:#eef2f8}', 'background:#fff;color:#000}')]:
    assert s.count(x) == 1, x
    s = s.replace(x, y)
open(os.path.join(dst, 'index.html'), 'w', encoding='utf-8').write(s)
dm = os.path.join(dst, 'html', 'demo.html'); t = open(dm, encoding='utf-8').read()
assert t.count('<!--sin-gestion-->') == 1
open(dm, 'w', encoding='utf-8').write(t.replace('<!--sin-gestion-->', '<button class="btn ghost sm" data-go="gestion">Ver lo que ve Viva</button>'))
print('artefacto ok:', dst)
