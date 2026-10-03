---
name: github-pre-push
description: "Verify and guarantee CI/CD readiness before committing or pushing changes to GitHub. Prevents failures in GitHub Actions workflows (linter, tests, types:check, PHP compatibility, git executable permissions, SQLite in-memory test compatibility, ESLint, Prettier, and Pint). Activate whenever preparing to push to git, running pre-commit checks, or troubleshooting failing GitHub Actions workflows."
---

# GitHub Pre-Push Verification Skill

Esta skill contiene el protocolo de verificación obligatorio para asegurar que cualquier commit o push a GitHub pase todos los checks de CI/CD (**`linter`** y **`tests`**) en verde y sin errores.

---

## 1. Los 6 Pilares de Prevención de Errores

### Pilar 1: Compatibilidad de versiones de PHP en CI
- **El problema:** Si en `.github/workflows/tests.yml` se incluye una versión de PHP en desarrollo (ej. `8.5`) y una dependencia en `composer.lock` (como `phpoffice/phpspreadsheet`) exige `php < 8.5.0`, `composer install` fallará con exit code 2.
- **La regla:**
  - Mantener la matriz de PHP en `.github/workflows/tests.yml` únicamente con versiones estables soportadas por el proyecto (ej. `['8.3', '8.4']`).
  - Antes de agregar una nueva versión de PHP a la matriz, verificar `composer.lock` o correr `composer check-platform-reqs`.

---

### Pilar 2: Permisos de ejecución de binarios (Windows vs Linux)
- **El problema:** En Windows, los archivos no tienen bit de ejecución (`+x`). Al commitear carpetas como `vendor/bin/` o scripts `.sh`, en Git quedan con modo `100644`. Al correr en Ubuntu en GitHub Actions, cualquier llamado a `pint`, `pest` o `phpstan` arroja:
  ```text
  sh: 1: pint: Permission denied (exit code 127)
  ```
- **La regla:**
  - En los workflows (`lint.yml` y `tests.yml`), siempre asegurar `chmod -R +x vendor/bin` tras instalar dependencias.
  - Si se añade un binario a Git desde Windows, registrarlo con ejecución:
    ```bash
    git update-index --chmod=+x vendor/bin/<nombre>
    ```

---

### Pilar 3: Compatibilidad de migraciones con SQLite (Tests en memoria)
- **El problema:** En `phpunit.xml`, las pruebas corren sobre SQLite en memoria (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`). Sentencias SQL crudas de MySQL (como `ALTER TABLE ... MODIFY COLUMN ... ENUM(...)`) lanzan error de sintaxis en SQLite:
  ```text
  SQLSTATE[HY000]: General error: 1 near "MODIFY": syntax error
  ```
- **La regla (Sin alterar tablas de MySQL):**
  - Cualquier sentencia SQL cruda con sintaxis propietaria de MySQL debe estar protegida con el driver check:
    ```php
    if (DB::getDriverName() === 'mysql') {
        DB::statement("ALTER TABLE ... MODIFY COLUMN ...");
    }
    ```
  - **Nunca** alterar la estructura de tablas de producción ni eliminar columnas existentes para acomodar tests.

---

### Pilar 4: Análisis estático de tipos (PHPStan / Larastan)
- **El problema:** Larastan con `level: 7` detecta cientos de advertencias en llamadas dinámicas de Eloquent, exports de Excel y arrays sin generics tipados (`missingType.iterableValue`, `missingType.generics`).
- **La regla:**
  - El proyecto utiliza un **Baseline** oficial (`phpstan-baseline.neon`).
  - Si agregas nuevo código PHP y PHPStan falla, soluciona los tipos reales o regenera el baseline si son llamadas dinámicas válidas de Laravel:
    ```bash
    vendor/bin/phpstan analyse --generate-baseline
    ```
  - Verificar que `phpstan analyse` devuelva `0 errors` antes de subir.

---

### Pilar 5: Frontend Linting y Formateo (ESLint & Prettier)
- **El problema:**
  - ESLint corriendo en la raíz analiza carpetas externas (`.agents/**`, `scripts/**`, `resources/js/ziggy.js`) generando cientos de falsos positivos.
  - Caracteres de escape redundantes en expresiones regulares (`[^\/]` en vez de `[^/]`).
  - Reglas estrictas de React 19 (`react-hooks/set-state-in-effect`, `immutability`).
- **La regla:**
  - Mantener en `eslint.config.js` la lista de `ignores` para `.agents/**`, `scripts/**`, y `resources/js/ziggy.js`.
  - Correr `npm run format` (Prettier) y `npm run lint` (ESLint) antes de hacer push.
  - Asegurarse de que `npm run lint:check` termine con código de salida `0` (0 errores).

---

### Pilar 6: Aislamiento del entorno de pruebas (`testing`)
- **El problema:** Middlewares de sesión o autenticación estricta (ej. `CheckAuthSession`) que verifiquen tokens CSRF de formulario (`$request->session()->has('_token')`) desconectan al usuario durante peticiones automatizadas `$this->actingAs($user)`.
- **La regla:**
  - En middlewares de sesión web, permitir el paso en pruebas:
    ```php
    if (app()->environment('testing')) {
        return $next($request);
    }
    ```
  - En las factories de prueba (`UserFactory.php`), asegurar que los estados por defecto creen usuarios activos y válidos (`'is_active' => true`).

---

## 2. Checklist Pre-Push Rápido

Antes de hacer `git push origin main`, ejecuta o verifica estos 4 comandos:

```bash
# 1. Formateo y Linter de PHP
vendor/bin/pint --format agent

# 2. Análisis estático de tipos PHP
vendor/bin/phpstan analyse

# 3. Formateo y Linter de Frontend
npm run format
npm run lint:check

# 4. Suite de pruebas automatizadas
php artisan test --compact
```

Si los 4 comandos finalizan con éxito (`0 errors`, `passed`), el push a GitHub pasará al 100% en verde.
