<?php

use App\Http\Controllers\BulkExportController;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Connection;
use Illuminate\Database\ConnectionResolverInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Tests\TestCase;

uses(TestCase::class);

test('exports in the same minute keep separate ZIP contents and download cleanup', function () {
    $this->freezeTime();

    $originalStoragePath = storage_path();
    $temporaryStoragePath = storage_path('framework/testing/zip-export-'.Str::uuid());
    $originalResolver = Model::getConnectionResolver();

    $connection = Mockery::mock(Connection::class.'[select]', [function () {
        throw new LogicException('Database access is forbidden in this test.');
    }]);

    $connection->shouldReceive('select')->andReturnUsing(function (string $query): array {
        if (str_contains($query, '"monthly_reports"')) {
            return [(object) [
                'id' => 1,
                'institution_id' => 1,
                'user_id' => null,
                'month' => 10,
                'year' => 2026,
            ]];
        }

        if (str_contains($query, '"educational_institutions"')) {
            return [(object) ['id' => 1, 'modular_code' => '1234567']];
        }

        return [];
    });

    $resolver = Mockery::mock(ConnectionResolverInterface::class);
    $resolver->shouldReceive('connection')->andReturn($connection);
    Model::setConnectionResolver($resolver);

    $request = Mockery::mock(Request::class)->makePartial();
    $request->initialize([], ['report_ids' => [1]], [], [], [], ['REQUEST_METHOD' => 'POST']);
    $request->setUserResolver(fn () => (object) ['role' => 'super_admin']);
    $request->shouldReceive('validate')->twice()->andReturn(['report_ids' => [1]]);

    $pdf = Mockery::mock(Barryvdh\DomPDF\PDF::class);
    $pdf->shouldReceive('setPaper')->twice();
    $pdf->shouldReceive('setOptions')->twice();
    $pdf->shouldReceive('output')->twice()->andReturn('first PDF', 'second PDF');
    Pdf::shouldReceive('loadView')->twice()->andReturn($pdf);
    Log::spy();

    $this->app->useStoragePath($temporaryStoragePath);

    try {
        $controller = new BulkExportController;
        $firstResponse = $controller->export($request);
        $secondResponse = $controller->export($request);
        $firstPath = $firstResponse->getFile()->getPathname();
        $secondPath = $secondResponse->getFile()->getPathname();

        expect($firstPath)->not->toBe($secondPath);
        expect($firstResponse->headers->get('Content-Disposition'))
            ->toBe($secondResponse->headers->get('Content-Disposition'));

        $firstArchive = new ZipArchive;
        expect($firstArchive->open($firstPath))->toBeTrue();
        expect($firstArchive->getFromName('REPORTE_1234567_10_2026_1.pdf'))->toBe('first PDF');
        $firstArchive->close();

        ob_start();
        try {
            $firstResponse->sendContent();
        } finally {
            ob_end_clean();
        }

        expect(file_exists($firstPath))->toBeFalse();
        expect(file_exists($secondPath))->toBeTrue();

        $secondArchive = new ZipArchive;
        expect($secondArchive->open($secondPath))->toBeTrue();
        expect($secondArchive->getFromName('REPORTE_1234567_10_2026_1.pdf'))->toBe('second PDF');
        $secondArchive->close();
    } finally {
        Model::setConnectionResolver($originalResolver);
        $this->app->useStoragePath($originalStoragePath);
        File::deleteDirectory($temporaryStoragePath);
    }
});
