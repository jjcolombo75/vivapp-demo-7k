# Modelos del cuerpo (Progreso)

`cuerpo-m.glb` · **provisorio**. Derivado de **Écorché** (github.com/Charleeh/ecorche), CC BY-SA 4.0. Basado en BodyParts3D, © The Database Center for Life Science, CC BY 4.0, y Z-Anatomy de Gauthier Kervyn, CC BY-SA 4.0.

Cambios (los exige la licencia): sin músculos de la cara; esqueleto sin columna, costillas, escápulas, esternón, dientes, ojos ni cartílagos (los tapan los músculos); simplificado a ≈98k triángulos (las láminas finas del tronco, más suave, para que no se hundan); sin color de vértice; cada nodo de músculo con `extras.vk` = clave de músculo de Vivapp. Se rearma con `node tools/cuerpo-glb.mjs <ecorche.meshopt.glb> <salida.glb> <ecorche.structures.json>`. Este archivo derivado se comparte bajo CC BY-SA 4.0.

Se reemplaza por el modelo comprado (masculino y femenino del mismo estilo): ver `docs/dueno.md`.

## Tratamiento en la app (v66)
La app no muestra el écorché tal cual: oculta cabeza, manos y pies y pone en su lugar formas lisas (elipsoide y cápsulas, grafito mate); todo el cuerpo es grafito mate y el único color es el de la métrica; contorno fino cian al 30 % en los músculos medidos. El archivo no cambia. (El modelo por grupos de la v65 se descartó: Dirección pidió no usar otro modelo.)

## Cuerpo estilizado (T14) · `estilizado/`
`estilizado/cuerpo-m.glb` y `estilizado/cuerpo-f.glb` (+ `.js` para el artefacto): 19 grupos musculares con nombre canónico y `extras.vk`, más `resto`, `resto_brazos`, `cabeza`, `manos` y `pies` (siluetas lisas integradas en el archivo). ≈78k triángulos y ≈530 KB cada uno. Mapa grupo → zona → ejercicios en `mapa-grupos.json`. Se rearman con `tools/cuerpo/hacer.sh`. **Todavía no los carga la app** (Progreso sigue con `cuerpo-m.js` de la v66); para usarlos: cambiar `CUERPO_GLB` en `js/progreso.js` y sacar del visor las formas de cabeza, manos y pies que hoy agrega.

### Licencia (ficha)
| Pieza | Fuente | Licencia | Qué obliga |
|---|---|---|---|
| Músculos, resto y siluetas (forma) | Écorché (github.com/Charleeh/ecorche), sobre BodyParts3D (© DBCLS) y Z-Anatomy (G. Kervyn) | CC BY-SA 4.0 (BodyParts3D: CC BY 4.0) | **Atribución visible** (crédito en la app, como hoy en Progreso) · **los GLB derivados se comparten bajo CC BY-SA 4.0** (cualquiera puede extraerlos del teléfono y reusarlos; no se pueden cifrar para impedirlo) · indicar los cambios (este archivo y `tools/cuerpo/LEEME.md`) |
| Proporciones femeninas | MakeHuman (base hm08 y targets macro) | CC0 | Nada |
| Código del pipeline | Vivapp (y el de Écorché, MIT, solo como referencia) | MIT | — |

**Lectura (no es asesoramiento legal):** BY-SA cubre el modelo, no el código de la app: la app puede ser cerrada y white-label mientras el GLB lleve crédito y su licencia. Lo que se pierde es exclusividad (el modelo es de todos) y el crédito tiene que verse en cada marca blanca. Sirve para la demo y el piloto. Para producción conviene la compra (`docs/dueno.md` 57) con permiso escrito de incrustar en app; el pipeline la convierte sin rehacer nada.

Crédito para la app: "Cuerpo: Écorché (Charleeh), BodyParts3D (DBCLS) y Z-Anatomy, CC BY-SA 4.0; silueta femenina con MakeHuman (CC0)."
