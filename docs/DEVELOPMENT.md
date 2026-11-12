# Obsidian / Charbel Ochoa

Portada negra con tres retratos ASCII originales, enlaces a GitHub y tres proyectos destacados. Archivo para el blog y una cadena de tres acertijos ocultos. Sin rastreadores, cuentas de visitantes ni servicios externos de fuentes.

## Ejecutar

Requiere Node.js 20.19 o posterior y npm.

```sh
npm ci
npm run build
npm run dev
```

Abre `http://127.0.0.1:4174`. El servidor sirve exclusivamente `dist/` y se detiene con Ctrl+C.

## Publicar una entrada

1. Copia `content/drafts/primera-entrada.md` a `content/posts/mi-entrada.md`.
2. Escribe un titulo, una fecha `AAAA-MM-DD` y un slug unico en minusculas, sin espacios.
3. Escribe tu experiencia en Markdown. Cambia `draft: true` a `draft: false` cuando este lista.
4. Sube el cambio a `main` desde tu cuenta de GitHub.

Ejemplo de cabecera:

```yaml
---
title: "Lo que aprendi construyendo un agente"
date: "2026-11-12"
slug: "construyendo-un-agente"
draft: false
---
```

Puedes editar los archivos y subir imagenes desde la interfaz web de GitHub. Guarda imagenes en `assets/uploads/` y referencialas desde una entrada con `![Descripcion](../assets/uploads/imagen.jpg)`.

Las entradas con `draft: true` y las fechas futuras quedan fuera de la compilacion. Una fecha futura se publica solo al ejecutar una nueva compilacion despues de esa fecha; no se programan tareas automaticas.

## Activar GitHub Pages

En el repositorio, selecciona **Settings → Pages → Source → GitHub Actions**. El workflow `.github/workflows/pages.yml` compila y despliega solo los pushes a `main` o ejecuciones manuales realizadas por `charbelochoa`. El trabajo exige tanto el repositorio exacto como `github.actor == charbelochoa`. No hay formulario publico ni un editor protegido por una clave de JavaScript.

Este paquete deja ese flujo preparado. No modifica la configuracion del repositorio, el dominio ni el DNS. No contiene credenciales. La URL real la devuelve GitHub Pages al completar el despliegue.

## Archivos

- `index.html`, `readme.css`, `site.js`: portada y consola de acertijos.
- `archive.html`: plantilla del archivo publico.
- `content/posts/`: las entradas que quieres publicar.
- `content/drafts/`: plantillas y textos que no se incluyen en la web.
- `assets/uploads/`: imagenes de tus entradas.
- `assets/identity/`: retratos SVG hechos de texto ASCII, versiones `.txt` y marca.
- `signals/`: cifrados, hashes y pistas publicas. No contiene respuestas en claro.
- `scripts/build.mjs`: generador de entradas y web estatica; escapa HTML crudo, titulos y URLs inseguras.
- `scripts/generate-ascii.mjs`: generador reproducible del arte; `node scripts/generate-ascii.mjs`.
- `docs/RESEARCH.md`: dossier original conservado.

Publica solo el contenido de `dist/`. El generador excluye fuentes, `node_modules`, borradores y notas del propietario. El workflow Koi original permanece intacto.

## Acertijos

La marca `∴` abre la consola; tambien puedes pulsar `?`. Hay tres capas encadenadas, respuestas normalizadas y validacion SHA-256. El avance se recuerda en el navegador. El sistema de acertijos no participa en la autorizacion del blog.

Las soluciones se entregan aparte, fuera del sitio y del ZIP de codigo. Conservalas fuera del repositorio publico.
