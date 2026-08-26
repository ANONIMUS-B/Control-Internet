<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SpeedtestCliController extends Controller
{
    /**
     * Ejecutar prueba de velocidad con speedtest-cli
     */
    public function test(Request $request)
    {
        try {
            Log::info('=== INICIO SPEEDTEST-CLI ===');
            
            // ✅ 1. Verificar que speedtest-cli está instalado
            $versionCheck = shell_exec('speedtest-cli --version 2>&1');
            Log::info('Version check: ' . $versionCheck);
            
            if (empty($versionCheck) || strpos($versionCheck, 'Speedtest') === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'speedtest-cli no está instalado. Ejecuta: pip install speedtest-cli',
                    'version_check' => $versionCheck,
                ], 500);
            }
            
            // ✅ 2. Ejecutar speedtest-cli
            Log::info('Ejecutando speedtest-cli...');
            $output = shell_exec('speedtest-cli --simple 2>&1');
            Log::info('Output: ' . $output);
            
            if (empty($output)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se obtuvo respuesta de speedtest-cli',
                ], 500);
            }
            
            // ✅ 3. Parsear resultados
            $data = $this->parseSpeedtestOutput($output);
            
            // ✅ 4. Obtener información del ISP
            $ispInfo = $this->getIspInfo();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'download' => round($data['download'], 2),
                    'upload' => round($data['upload'], 2),
                    'ping' => round($data['ping'], 2),
                    'isp' => $ispInfo['isp'] ?? 'Proveedor local',
                    'server' => $ispInfo['server'] ?? 'Servidor Speedtest',
                    'location' => $ispInfo['location'] ?? 'Desconocida',
                    'timestamp' => now()->toISOString(),
                    'raw_output' => $output,
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en speedtest-cli: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Parsear la salida de speedtest-cli
     */
    private function parseSpeedtestOutput($output)
    {
        $data = [
            'ping' => 0,
            'download' => 0,
            'upload' => 0,
        ];
        
        // ✅ Extraer Ping
        if (preg_match('/Ping:\s+([\d.]+)\s+ms/', $output, $matches)) {
            $data['ping'] = floatval($matches[1]);
        }
        
        // ✅ Extraer Download
        if (preg_match('/Download:\s+([\d.]+)\s+Mbit\/s/', $output, $matches)) {
            $data['download'] = floatval($matches[1]);
        }
        
        // ✅ Extraer Upload
        if (preg_match('/Upload:\s+([\d.]+)\s+Mbit\/s/', $output, $matches)) {
            $data['upload'] = floatval($matches[1]);
        }
        
        return $data;
    }
    
    /**
     * Obtener información del ISP desde la IP
     */
    private function getIspInfo()
    {
        try {
            // ✅ Obtener IP pública
            $ip = file_get_contents('https://api.ipify.org');
            
            // ✅ Consultar información de la IP
            $ch = curl_init("http://ip-api.com/json/{$ip}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            $response = curl_exec($ch);
            curl_close($ch);
            
            $data = json_decode($response, true);
            
            return [
                'isp' => $data['isp'] ?? 'Proveedor local',
                'server' => $data['org'] ?? 'Servidor Speedtest',
                'location' => $data['city'] ?? 'Desconocida',
            ];
        } catch (\Exception $e) {
            return [
                'isp' => 'Proveedor local',
                'server' => 'Servidor Speedtest',
                'location' => 'Desconocida',
            ];
        }
    }
    
    /**
     * Obtener la versión de speedtest-cli
     */
    public function version()
    {
        $output = shell_exec('speedtest-cli --version 2>&1');
        
        return response()->json([
            'success' => true,
            'version' => $output,
        ]);
    }
}