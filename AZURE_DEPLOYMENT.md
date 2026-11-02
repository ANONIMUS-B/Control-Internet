# GitHub y Azure App Service

La instalación actual utiliza cPanel. Sigue primero
[CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md). Esta guía de Azure es una opción
para una migración futura y no debe usarse para actualizar el hosting actual.

## Alcance y protección de datos

Este procedimiento publica código. No crea bases de datos, no ejecuta migraciones,
no importa respaldos, no ejecuta seeders ni inicia trabajadores de colas.
El archivo local `.env` no se publica ni se modifica. Los valores de producción
se configuran en Azure, fuera de Git.

La aplicación necesita una **base MySQL existente y accesible desde Azure** para
funcionar con sus datos. `localhost` en Azure no es tu equipo de Laragon.
Si solo tienes la base en tu computadora, primero debe definirse una conexión
segura a un servidor existente; no importes ni migres datos como parte de estos pasos.

Preparar el repositorio no equivale a aprobar su seguridad para producción:
los permisos de reportes señalados en la revisión anterior deben corregirse
antes de exponer datos reales a usuarios externos.

## 1. Revisar y subir a GitHub

El remoto actual es `https://github.com/ANONIMUS-B/Control-Internet.git`, rama `main`.
Verifica que ese sea el destino deseado. No necesitas crear otro repositorio.

Para Azure, las dependencias y los archivos compilados se generan durante el
workflow. En el despliegue actual de cPanel, `vendor` y `public/build` se conservan
versionados: no los retires del seguimiento mientras el hosting dependa de ellos.
Las credenciales y los datos locales no deben subirse. Quitar un archivo de Git
no elimina posibles secretos presentes en commits anteriores.

Revisa antes de publicar:

```powershell
git status --short
git diff --stat
git diff --cached --stat
git remote -v
```

Comprueba que no aparecen `.env`, respaldos, firmas, evidencias ni claves reales.
Cuando estés conforme con el contenido:

```powershell
git add .
git diff --cached --stat
git commit -m "Prepare application checks and Azure deployment"
git push origin main
```

No uses `git push --force`. Si Git rechaza la subida porque hay cambios remotos,
revísalos e intégralos antes de continuar. En GitHub, espera a que los workflows
`tests` y `linter` terminen correctamente. Los workflows ejecutan únicamente la
suite Unit, sin crear bases temporales. Las pruebas Feature que usan migraciones
quedan pendientes de una autorización para probar con una base aislada.

## 2. Crear únicamente la aplicación web en Azure

Desde la pantalla del portal que compartiste:

1. Entra en **App Services → Crear → Aplicación web**.
2. Selecciona tu suscripción y un grupo de recursos. Confirma la suscripción de
   estudiantes o los créditos disponibles; no asumas que todos los planes son gratuitos.
3. Elige **Publicar: Código**, **Sistema operativo: Linux** y **PHP 8.4** si está
   disponible. PHP 8.3 también está contemplado por este proyecto. Evita PHP 8.2.
4. Elige una región cercana a los usuarios y a tu base existente. Revisa el precio
   del plan antes de crear. Un plan gratuito sirve para evaluar, pero tiene límites.
5. No elijas la plantilla **Web App + Database** ni agregues un servidor de base de datos.
6. Crea la aplicación y copia su **dominio predeterminado exacto** del resumen.
   Los dominios de Azure pueden incluir un sufijo aleatorio; no lo reconstruyas a mano.

Puedes consultar los runtimes disponibles sin crear recursos desde Cloud Shell:

```bash
az webapp list-runtimes --os linux --output table
```

## 3. Variables de entorno y almacenamiento

En tu App Service abre **Configuración → Variables de entorno**. Usa
`.env.azure.example` como lista de referencia, no como archivo para subir secretos.

Configura al menos:

| Variable                         | Valor                                      |
| -------------------------------- | ------------------------------------------ |
| `APP_ENV`                        | `production`                               |
| `APP_DEBUG`                      | `false`                                    |
| `APP_URL`                        | Dominio exacto de Azure con `https://`     |
| `APP_KEY`                        | Clave de producción, guardada fuera de Git |
| `LARAVEL_STORAGE_PATH`           | `/home/conformidad-storage`                |
| `INERTIA_SSR_ENABLED`            | `false`                                    |
| `SESSION_DRIVER`                 | `file`                                     |
| `SESSION_SECURE_COOKIE`          | `true`                                     |
| `CACHE_STORE`                    | `file`                                     |
| `QUEUE_CONNECTION`               | `sync`                                     |
| `LOG_CHANNEL`                    | `stderr`                                   |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false`                                    |

No actives `WEBSITE_RUN_FROM_PACKAGE=1`: esta configuración necesita escribir
la caché de Laravel y crear el enlace de almacenamiento. Deja ese ajuste sin
definir o en `0`. Habilita **Solo HTTPS** en la aplicación web.

Configura `DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`,
`DB_USERNAME` y `DB_PASSWORD` apuntando a tu base **existente**. Usa TLS según
los requisitos de ese servidor; `MYSQL_ATTR_SSL_CA` permite indicar el archivo
CA. No desactives la verificación TLS para resolver problemas de conexión.

Si es una instalación nueva del código, puedes generar una clave sin escribir
archivos ni acceder a la base:

```powershell
php artisan key:generate --show
```

Guárdala solo en Azure. Si la base existente contiene valores cifrados, 2FA o
passkeys que deban seguir funcionando, conserva la clave y los secretos que
se utilizaron para cifrarlos. No sustituyas claves de una instalación existente
sin planificar su impacto.

La plantilla deja el correo en `log`: configura tu proveedor SMTP antes de usar
restablecimiento de contraseñas o verificación de correo. Las passkeys requieren
el dominio HTTPS correcto en `APP_URL` y deberán revisarse si cambias de dominio.

El almacenamiento de producción se conserva en `/home/conformidad-storage`,
fuera de los archivos del despliegue. No se copian firmas ni evidencias locales.
Mantén una sola instancia mientras se utilicen sesiones y archivos locales;
para escalar, habrá que diseñar almacenamiento y sesiones compartidos.

## 4. Comando de inicio

En **Configuración → Configuración general → Comando de inicio** establece:

```bash
bash /home/site/wwwroot/scripts/azure-startup.sh
```

El script prepara directorios de archivos, enlaza el disco público, genera la
caché de configuración y configura Nginx para servir solo `public/`.
No ejecuta ninguna operación de base de datos. No arranca Node, Vite ni colas.
El frontend se compila previamente en GitHub; SSR queda deshabilitado en Azure.

## 5. Conectar GitHub mediante OpenID Connect

El archivo `.github/workflows/azure.yml` permite desplegar **manualmente**.
No se despliega automáticamente al hacer push.

En GitHub crea un entorno en **Settings → Environments** llamado
`azure-production`. Configura revisores requeridos si tu plan lo permite.

Dentro de ese entorno añade:

- Variable `AZURE_WEBAPP_NAME`: nombre del recurso App Service, no su URL.
- Secretos `AZURE_CLIENT_ID`, `AZURE_TENANT_ID` y `AZURE_SUBSCRIPTION_ID`.

Configura en Azure una identidad para GitHub con permiso **Website Contributor**
limitado al App Service. La credencial federada debe usar:

```text
Issuer: https://token.actions.githubusercontent.com
Subject: repo:ANONIMUS-B/Control-Internet:environment:azure-production
Audience: api://AzureADTokenExchange
```

El sujeto debe coincidir exactamente con el propietario, repositorio y entorno.
Los identificadores se obtienen de tu identidad y suscripción; no se inventan.
El Centro de implementación de Azure puede ayudarte a configurar una identidad,
pero puede crear otro workflow en GitHub. Revisa ese archivo y evita mantener
dos mecanismos publicando la misma aplicación. No compartas perfiles de
publicación, credenciales ni el contenido de `.env` en el chat o en Git.

## 6. Primer despliegue y verificación

1. Confirma que el código ya está en GitHub y que los checks pasan.
2. En **Actions → Deploy to Azure App Service → Run workflow**, selecciona `main`.
3. El workflow comprueba tipos, estilo, PHPStan y pruebas Unit sin base de datos;
   compila Vite e instala dependencias PHP de producción.
4. Publica únicamente código, dependencias y archivos compilados. No empaqueta
   `.env`, `node_modules`, el almacenamiento local ni credenciales.
5. Comprueba el registro de despliegue y luego el **Flujo de registros** de Azure.
6. Comprueba primero `/up` en el dominio real: es la comprobación de salud.
   Un 200 en `/up` no demuestra todavía que la conexión de base de datos funcione.
7. Cuando autorices el uso normal de la aplicación, verifica acceso, permisos,
   PDF, Excel y subida de archivos con datos de prueba apropiados.

Si aparece 404, revisa el comando de inicio y la raíz Nginx `public/`. Si aparece
500, revisa los logs y las variables; no actives `APP_DEBUG` públicamente.
Para errores de carga de archivos, comprueba también `upload_max_filesize` y
`post_max_size` de PHP en Azure y alínealos con los límites de los formularios.

## Desarrollo local y comprobaciones sin base de datos

`composer run dev` deja la terminal ocupada porque mantiene los servidores
activos; ese comportamiento es normal. Para iniciar solo la web y Vite sin
procesar trabajos de la cola, usa `composer run dev:web`.

```powershell
npm.cmd run types:check
npm.cmd run lint:check
npm.cmd run format:check
php vendor/bin/phpstan analyse --no-progress
php artisan test --compact --testsuite=Unit --do-not-cache-result
```

No ejecutes `composer setup`, `migrate`, `migrate:fresh`, `db:seed` ni
`optimize:clear` para este despliegue: algunos de esos comandos modifican bases
o limpian el almacén de caché configurado. No inicies la cola si no quieres
procesar trabajos pendientes. La navegación normal de una aplicación en uso
puede modificar datos; estas instrucciones no convierten la aplicación en solo lectura.

## Documentación oficial

- [Configuración de PHP y Nginx en App Service](https://learn.microsoft.com/en-us/azure/app-service/configure-language-php?pivots=platform-linux)
- [Despliegue con GitHub Actions y OpenID Connect](https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions)
- [Creación de una aplicación PHP en App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-php)
