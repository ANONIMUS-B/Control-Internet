#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"

php_bin="${PHP_BIN:-php}"

for required_file in .env artisan vendor/autoload.php public/build/manifest.json; do
    if [[ ! -f "$required_file" ]]; then
        echo "Deployment stopped: missing $required_file. Preserve the existing installation." >&2
        exit 1
    fi
done

"$php_bin" -r '
if (PHP_VERSION_ID < 80300) {
    fwrite(STDERR, "PHP 8.3 or newer is required. Configure the PHP CLI version in cPanel.\n");
    exit(1);
}
require "vendor/autoload.php";
$manifest = json_decode(file_get_contents("public/build/manifest.json"), true, 512, JSON_THROW_ON_ERROR);
foreach ($manifest as $entry) {
    foreach (array_merge([$entry["file"]], $entry["css"] ?? [], $entry["assets"] ?? []) as $asset) {
        if (!is_file("public/build/".$asset)) {
            fwrite(STDERR, "Missing compiled asset: ".$asset."\n");
            exit(1);
        }
    }
}
'

"$php_bin" artisan config:clear --no-interaction
"$php_bin" artisan view:clear --no-interaction

echo "cPanel deployment checks completed. No migrations, database commands or queue workers were run."
