# Herramientas del prototipo (versión partida, desde la 43)

- `desde_repo.py <clon> <salida>`: arma los archivos del artefacto desde este repositorio (todo menos `html/gestion.html`, que vive solo en el artefacto).
- `build_pwa.py <carpeta_artefacto> <clon>`: arma esta copia pública desde los archivos del artefacto (sin "Lo que ve Viva").
- `probar.py <url> <carpeta>`: capturas de Inicio, Entrenar (Hoy y modo sala), Club, Comunidad y panel de demo, con errores de consola. Servir por HTTP (`python3 -m http.server`); por `file://` el cargador no puede leer las piezas.
