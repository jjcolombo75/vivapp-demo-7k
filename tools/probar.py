"""Prueba antes/después. Uso: python3 tools/probar.py <url> <carpeta_capturas>
Sirve los archivos por HTTP (como el hosting). Imprime errores y un hash del DOM por pantalla."""
import asyncio, sys, hashlib, re, os
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
FD = '/home/claude/work/fonts/node_modules/@fontsource-variable/archivo/files/'
CSS = ''.join("@font-face{font-family:'Archivo';font-style:normal;font-weight:100 900;font-stretch:62%% 125%%;src:url('http://127.0.0.1:8765/__f/archivo-%s-wdth-normal.woff2') format('woff2-variations')%s}\n" % (sub, ur)
              for sub, ur in [('latin', ''), ('latin-ext', ';unicode-range:U+0100-02BA,U+1E00-1E9F')])
DOMJS = """()=>{const c=document.documentElement.cloneNode(true);
 c.querySelectorAll('script,link,template,style,meta,title').forEach(e=>e.remove());
 const sp=[...c.querySelectorAll('body > svg')].find(s=>s.querySelector('symbol'));
 let ids=''; if(sp){ids=[...sp.querySelectorAll('[id]')].map(e=>e.id+':'+e.outerHTML.length).sort().join(',');sp.remove();}
 return c.outerHTML.replace(/>\\s+</g,'><')+'|'+ids}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
        pg.on('console', lambda m: errs.append('console.' + m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
        async def fonts(route):
            if 'css' in route.request.url: await route.fulfill(status=200, content_type='text/css', body=CSS)
            else: await route.abort()
        await pg.route('**/fonts.googleapis.com/**', fonts)
        await pg.route('**/fonts.gstatic.com/**', lambda r: r.abort())
        await pg.clock.install(time=1793462400000)   # misma hora fija en las dos versiones
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        await pg.evaluate("document.fonts.ready")
        async def snap(name):
            await pg.wait_for_timeout(700)
            await pg.screenshot(path=f'{OUT}/{name}.png', animations='disabled')
            d = await pg.evaluate(DOMJS)
            print(name, hashlib.md5(d.encode()).hexdigest()[:10], len(d))
            open(f'{OUT}/{name}.dom', 'w').write(d)
        async def go(sc):
            await pg.evaluate("(s)=>{const b=document.createElement('button');b.dataset.go=s;document.body.appendChild(b);b.click();b.remove()}", sc)
        await snap('0-ingreso')
        await go('inicio'); await snap('1-inicio')
        await go('hoy'); await snap('2-entrenar-hoy')
        await pg.evaluate("document.querySelector('#hEmpezar').click()"); await snap('3-modo-sala')
        await go('beneficios'); await snap('4-club')
        await go('social'); await snap('5-comunidad')
        await go('inicio'); await pg.wait_for_timeout(300)
        await pg.evaluate("document.querySelector('#demoFab').click()"); await snap('6-panel-demo')
        print('ERRORES:', len(errs)); [print('  ', e) for e in errs]
        await b.close()
asyncio.run(main())
