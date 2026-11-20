# Pavarotti Wiki

La portada enlaza el emblema superior izquierdo a `/wiki/`. El sitio público está en GitHub Pages. Las entradas del archivo se incorporan como investigaciones. Los artículos creados en el editor viven en `content/wiki/<direccion>/article.json` con un PDF opcional llamado `documento.pdf`.

## Publicar desde Windows

1. Abre **Abrir wiki.cmd** en el equipo que tiene OpenSSH y tu llave autorizada.
2. Elige **Nueva publicación** o selecciona un artículo del menú. El título propone una dirección que puedes ajustar antes de publicar.
3. Escribe el texto en Markdown. Puedes añadir un enlace y un PDF de hasta 20 MiB. En una edición puedes conservar, sustituir o retirar el PDF.
4. Pulsa **Publicar**. Los cambios se guardan en Git y el despliegue de Pages actualiza el dominio. El artículo y su PDF pasan a ser públicos.
5. Pulsa Ctrl+C en la ventana de conexión para cerrar el túnel.

Las cinco investigaciones originales se editan en sus archivos Markdown de `content/posts/`. Los artículos nuevos se editan en el panel.

## Servidor

El editor se ejecuta con Node.js 22 como servicio de usuario `pavarotti-wiki.service`. Su directorio privado en eclipse es `~/.local/share/pavarotti-wiki/`. La aplicación escucha en `editor.sock` con modo 0600. SSH conecta ese socket con el puerto local 4179 del equipo del autor.

El repositorio privado se conserva en `library.git`. La llave de publicación de eclipse está autorizada únicamente para el repositorio del sitio. Las peticiones de escritura requieren el origen local y el token del editor. Cada envío usa una copia temporal, valida el PDF y comprueba la revisión antes de publicar. Una edición en conflicto requiere volver a abrir el artículo.

Para revisar el servicio desde una sesión de la cuenta propietaria:

```sh
systemctl --user status pavarotti-wiki.service
journalctl --user -u pavarotti-wiki.service -n 30
```

La aplicación web pública se genera con `npm run build`. Los archivos de `author/`, las llaves y las rutas internas del servidor quedan fuera de `dist/`.
