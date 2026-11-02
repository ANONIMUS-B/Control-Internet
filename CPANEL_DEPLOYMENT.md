# Actualizar la instalación existente en cPanel

La captura muestra la rama `main` en
`/home/ugel4mbo/public_html/internet.ugelambo.edu.pe`.
El repositorio está en la carpeta de la aplicación activa: **Update from Remote
ya cambia sus archivos**, antes de pulsar **Deploy HEAD Commit**.
Este procedimiento no garantiza una actualización sin interrupciones; realiza
la actualización en un horario de poco uso.

## Qué se conserva

- La base de datos existente: no se ejecutan migraciones, seeders ni colas.
- El `.env` del servidor, incluida su `APP_KEY`: no se reemplaza ni se regenera.
- `storage/` y los archivos subidos por los usuarios.
- La configuración actual del dominio y su enlace `public/storage`.

Este hosting recibe `vendor/` y `public/build/` desde Git. Se mantienen
versionados para que **Update from Remote** no los elimine ni exija instalar
Composer o Node en producción. `vendor.zip` conserva su estado anterior en Git;
no se necesita extraerlo para esta actualización. No agregues archivos nuevos
de usuarios desde `public/storage` al repositorio público.

## Antes de publicar

1. En cPanel comprueba que el dominio usa **PHP 8.3 o 8.4**. Si utilizas el botón
   de despliegue, el PHP de línea de comandos también debe ser compatible.
2. Conserva una copia privada de los archivos actuales fuera de la carpeta
   pública. No publiques `.env`, firmas, evidencias ni credenciales en GitHub.
   Estos pasos no requieren exportar ni modificar ninguna base de datos.
3. Comprueba que la raíz pública del dominio sigue apuntando a `public/`.
   No cambies la estructura del sitio que ya funciona ni muevas sus archivos.
4. En **Git Version Control → Manage**, comprueba que sigue seleccionada `main`.
   Si cPanel indica archivos locales modificados, detente y revisa cuáles son;
   no uses `reset --hard`, `git clean` ni fuerces la actualización.

## Preparar y subir desde tu computadora

El frontend ya debe estar compilado antes de subir. Para próximas actualizaciones:

```powershell
npx.cmd vite build --emptyOutDir=false
npm.cmd run types:check
npm.cmd run format:check
npm.cmd run lint:check
php vendor/bin/phpstan analyse --no-progress
php artisan test --compact --testsuite=Unit --do-not-cache-result
git status --short
git diff --stat
git diff --cached --stat
```

`--emptyOutDir=false` conserva versiones anteriores de los archivos con hash,
para reducir errores en pestañas que estaban abiertas durante la actualización.
La compilación se ejecuta con la configuración local; no copies el `.env` local
al servidor ni incluyas secretos en variables `VITE_*`.

Después de revisar los cambios:

```powershell
git add .
git diff --cached --stat
git commit -m "Fix institution permissions and prepare cPanel update"
git push origin main
```

No uses `--force`. Espera a que los checks de GitHub terminen. Ejecutan pruebas
Unit sin crear bases de datos; las pruebas Feature con migraciones no se han
ejecutado como parte de esta preparación.

## Actualizar en cPanel

1. Abre **Git Version Control → Manage → Pull or Deploy**.
2. Pulsa **Update from Remote** una sola vez. En tu instalación esto actualiza
   directamente los archivos de la aplicación en uso.
3. Pulsa **Deploy HEAD Commit** y revisa el registro. `.cpanel.yml` ejecuta
   `scripts/cpanel-deploy.sh`: comprueba PHP, dependencias y archivos compilados,
   y limpia solamente la caché de configuración y las vistas compiladas.
   El script no copia carpetas, no borra almacenamiento y no toca la base.
4. Si el hosting bloquea la ejecución del script, solicita al administrador
   ejecutar esos dos comandos con PHP compatible dentro de la carpeta del
   proyecto: `php artisan config:clear --no-interaction` y
   `php artisan view:clear --no-interaction`. No sustituyas estos comandos por
   `optimize:clear`, que puede vaciar un almacén de caché en base de datos.
5. Comprueba el sitio y los logs. La navegación y las operaciones normales de
   usuarios pueden escribir datos: esta preparación no convierte la aplicación
   en modo de solo lectura.

No ejecutes `composer setup`, `key:generate`, `migrate`, `migrate:fresh`,
`db:seed` ni trabajadores de colas para publicar estos cambios. No necesitas
crear una base de datos nueva ni cambiar las credenciales de la que ya funciona.

## Límites de esta preparación

Se verificaron compilación, tipos, análisis estático y pruebas Unit locales.
No se ha accedido al servidor para comprobar su PHP, permisos ni configuración,
y no se ha hecho push ni despliegue desde esta sesión. La actualización de
dependencias debe comprobarse también en el hosting. Los permisos de reportes
señalados en la revisión anterior siguen pendientes antes de considerar completa
la revisión de seguridad de la aplicación.

Referencia: [despliegue Git de cPanel](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/).
