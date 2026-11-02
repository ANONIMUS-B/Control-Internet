<?php

use Illuminate\Filesystem\Filesystem;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

beforeEach(function () {
    $this->deploymentDirectory = sys_get_temp_dir().'/conformidad-cpanel-'.bin2hex(random_bytes(8));
    $this->deploymentFilesystem = new Filesystem;
    foreach ([
        $this->deploymentDirectory.'/scripts',
        $this->deploymentDirectory.'/vendor',
        $this->deploymentDirectory.'/public/build/assets',
        $this->deploymentDirectory.'/storage/app/public',
    ] as $directory) {
        $this->deploymentFilesystem->makeDirectory($directory, 0755, true);
    }

    $this->deploymentFilesystem->copy(
        dirname(__DIR__, 2).'/scripts/cpanel-deploy.sh',
        $this->deploymentDirectory.'/scripts/cpanel-deploy.sh',
    );

    file_put_contents($this->deploymentDirectory.'/.env', 'APP_KEY=existing-key');
    file_put_contents($this->deploymentDirectory.'/vendor/autoload.php', '<?php');
    file_put_contents($this->deploymentDirectory.'/storage/app/public/evidence.txt', 'Existing evidence');
    file_put_contents($this->deploymentDirectory.'/public/build/assets/app.js', 'console.log("built");');
    file_put_contents($this->deploymentDirectory.'/public/build/manifest.json', json_encode([
        'resources/js/app.tsx' => ['file' => 'assets/app.js'],
    ], JSON_THROW_ON_ERROR));
    file_put_contents($this->deploymentDirectory.'/artisan', <<<'PHP'
        <?php
        file_put_contents(__DIR__.'/commands.jsonl', json_encode(array_slice($argv, 1)).PHP_EOL, FILE_APPEND);
        PHP);

    $this->deploymentBash = PHP_OS_FAMILY === 'Windows'
        ? 'C:/Program Files/Git/bin/bash.exe'
        : '/bin/bash';

    $this->runDeployment = fn (): Process => (new Process(
        [$this->deploymentBash, 'scripts/cpanel-deploy.sh'],
        $this->deploymentDirectory,
        ['PHP_BIN' => str_replace('\\', '/', PHP_BINARY)],
        timeout: 30,
    ))->mustRun();
});

afterEach(function () {
    $fixturePath = realpath($this->deploymentDirectory);
    $temporaryPath = realpath(sys_get_temp_dir());

    if ($fixturePath !== false && $temporaryPath !== false
        && str_starts_with($fixturePath, $temporaryPath.DIRECTORY_SEPARATOR.'conformidad-cpanel-')) {
        $this->deploymentFilesystem->deleteDirectory($fixturePath);
    }
});

test('cpanel deployment preserves credentials and uploads and only clears file caches', function () {
    $process = ($this->runDeployment)();
    $commands = array_map(
        fn (string $command): array => json_decode($command, true, 512, JSON_THROW_ON_ERROR),
        file($this->deploymentDirectory.'/commands.jsonl', FILE_IGNORE_NEW_LINES),
    );

    expect($process->isSuccessful())->toBeTrue()
        ->and($commands)->toBe([
            ['config:clear', '--no-interaction'],
            ['view:clear', '--no-interaction'],
        ])
        ->and(file_get_contents($this->deploymentDirectory.'/.env'))->toBe('APP_KEY=existing-key')
        ->and(file_get_contents($this->deploymentDirectory.'/storage/app/public/evidence.txt'))->toBe('Existing evidence');
});

test('cpanel deployment stops before running artisan when required files are missing', function (string $missingFile) {
    unlink($this->deploymentDirectory.'/'.$missingFile);

    expect($this->runDeployment)->toThrow(ProcessFailedException::class);
    expect(file_exists($this->deploymentDirectory.'/commands.jsonl'))->toBeFalse();
})->with(['.env', 'vendor/autoload.php', 'public/build/manifest.json', 'public/build/assets/app.js']);
