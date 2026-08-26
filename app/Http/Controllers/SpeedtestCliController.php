<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SpeedtestCliController extends Controller
{
    public function test(Request $request)
    {
        try {
            Log::info('=== INICIO SPEEDTEST-CLI ===');
            
            // ✅ 1. Verificar que el comando existe
            $whichOutput = shell_exec('where speedtest-cli 2>&1');
            Log::info('Where speedtest-cli: ' . $whichOutput);
            
            // ✅ 2. Probar con un comando simple
            $testOutput = shell_exec('echo "Hola Mundo" 2>&1');
            Log::info('Test echo: ' . $testOutput);
            
            // ✅ 3. Verificar versión de Python
            $pythonVersion = shell_exec('python --version 2>&1');
            Log::info('Python version: ' . $pythonVersion);
            
            // ✅ 4. Intentar ejecutar speedtest-cli
            $output = shell_exec('speedtest-cli --simple 2>&1');
            Log::info('Speedtest output: ' . $output);
            
            if (empty($output)) {
                return response()->json([
                    'success' => false,
                    'message' => 'speedtest-cli no devolvió resultados',
                    'debug' => [
                        'which' => $whichOutput,
                        'python' => $pythonVersion,
                    ],
                ], 500);
            }
            
            // ✅ 5. Parsear resultados
            $data = [
                'ping' => $this->extractValue($output, 'Ping'),
                'download' => $this->extractValue($output, 'Download'),
                'upload' => $this->extractValue($output, 'Upload'),
            ];
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'raw' => $output,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());
            Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }
    
    private function extractValue($output, $key)
    {
        preg_match("/{$key}:\s+([\d.]+)/", $output, $matches);
        return $matches[1] ?? 'N/A';
    }
}