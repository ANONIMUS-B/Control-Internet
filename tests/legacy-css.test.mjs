import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import tailwindcss from '@tailwindcss/vite';
import { build, loadConfigFromFile } from 'vite';

test('production styles provide Chrome 109 colors and gradient directions', async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), 'legacy-css-'));
    const { config } = await loadConfigFromFile({
        command: 'build',
        mode: 'production',
    });

    try {
        await build({
            configFile: false,
            logLevel: 'error',
            plugins: [tailwindcss()],
            build: {
                cssTarget: config.build.cssTarget,
                outDir: outputDirectory,
                rollupOptions: {
                    input: 'resources/css/app.css',
                    output: { assetFileNames: 'app.css' },
                },
            },
        });
        const css = await readFile(join(outputDirectory, 'app.css'), 'utf8');

        assert.ok(
            /--color-purple-500:\s*#[\da-f]+/i.test(css),
            'purple has a compatible fallback',
        );
        assert.ok(
            /--background:\s*#(?:fff|ffffff)/i.test(css),
            'background has a compatible fallback',
        );
        assert.ok(
            /@supports\s*not\s*\(color:\s*oklch\([^)]*\)\)[\s\S]*?\.bg-gradient-to-r\s*\{--tw-gradient-position:to right[;}]/.test(
                css,
            ),
            'horizontal gradient has a compatible direction',
        );
        assert.ok(
            /@supports\s*not\s*\(color:\s*oklch\([^)]*\)\)[\s\S]*?\.bg-gradient-to-br\s*\{--tw-gradient-position:to bottom right[;}]/.test(
                css,
            ),
            'diagonal gradient has a compatible direction',
        );
    } finally {
        await rm(outputDirectory, { recursive: true, force: true });
    }
});
