<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // ✅ AGREGAR ESTA LÍNEA

class SpeedtestCaptureController extends Controller
{
    public function capture(Request $request)
    {
        try {
            // ✅ 1. Verificar que el script existe
            $scriptPath = base_path('scripts/capture-speedtest.cjs');
            if (!file_exists($scriptPath)) {
                Log::error('Script no encontrado: ' . $scriptPath);
                return response()->json([
                    'success' => false,
                    'message' => 'Script no encontrado: ' . $scriptPath,
                ], 500);
            }

            // ✅ 2. Crear directorio de screenshots
            $screenshotDir = storage_path('app/public/screenshots');
            if (!file_exists($screenshotDir)) {
                mkdir($screenshotDir, 0777, true);
            }

            $filename = 'speedtest_' . date('Ymd_His') . '.png';
            $filepath = $screenshotDir . '/' . $filename;

            // ✅ 3. Verificar que Node.js está disponible
            $nodeCheck = shell_exec('node --version 2>&1');
            Log::info('Node version: ' . $nodeCheck);
            
            if (empty($nodeCheck) || strpos($nodeCheck, 'v') === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Node.js no está instalado o no se encuentra en el PATH',
                    'node_check' => $nodeCheck,
                ], 500);
            }

            // ✅ 4. Verificar que Puppeteer está instalado
            $npmCheck = shell_exec('npm list puppeteer --depth=0 2>&1');
            Log::info('Puppeteer check: ' . $npmCheck);

            // ✅ 5. Ejecutar el script con Node.js
            $command = "node " . escapeshellarg($scriptPath) . " " . escapeshellarg($filepath) . " 2>&1";
            Log::info('Comando ejecutado: ' . $command);
            
            $output = shell_exec($command);
            Log::info('Output del script: ' . $output);

            // ✅ 6. Verificar si se creó la imagen
            if (!file_exists($filepath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo capturar la imagen. Verifica que Chrome esté instalado.',
                    'output' => $output,
                ], 500);
            }

            // ✅ 7. Obtener datos del JSON
            $jsonPath = str_replace('.png', '.json', $filepath);
            $speedData = [];

            if (file_exists($jsonPath)) {
                $speedData = json_decode(file_get_contents($jsonPath), true);
            }

            return response()->json([
                'success' => true,
                'message' => 'Captura realizada exitosamente',
                'data' => [
                    'download' => $speedData['download'] ?? 'N/A',
                    'upload' => $speedData['upload'] ?? 'N/A',
                    'ping' => $speedData['ping'] ?? 'N/A',
                    'isp' => $speedData['isp'] ?? 'N/A',
                    'timestamp' => $speedData['timestamp'] ?? now()->toISOString(),
                    'image_url' => asset('storage/screenshots/' . $filename),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Error en captura Speedtest: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al capturar: ' . $e->getMessage(),
            ], 500);
        }
    }
}