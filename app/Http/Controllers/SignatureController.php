<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class SignatureController extends Controller
{
    /**
     * Mostrar la página de gestión de firma.
     * ✅ Cualquier usuario autenticado puede ver su propia firma
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login')->with('error', 'Debes iniciar sesión.');
        }

        return Inertia::render('Profile/Signature', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'signature_path' => $user->signature_path,
                'signature_active' => $user->signature_active,
                'signature_url' => $user->signature_url,
                'signature_updated_at' => $user->signature_updated_at?->format('d/m/Y H:i'),
                'has_signature' => $user->hasSignature(),
                'signature_status' => $user->signature_status,
                'signature_status_color' => $user->signature_status_color,
            ]
        ]);
    }

    /**
     * Subir o actualizar la firma digital.
     * ✅ Cualquier usuario autenticado puede subir su propia firma
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function upload(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login')->with('error', 'Debes iniciar sesión.');
        }
        
        $validator = Validator::make($request->all(), [
            'signature' => 'required|image|mimes:png,jpg,jpeg|max:2048',
        ], [
            'signature.required' => 'Debes seleccionar una imagen para tu firma.',
            'signature.image' => 'El archivo debe ser una imagen válida.',
            'signature.mimes' => 'La imagen debe ser de tipo PNG, JPG o JPEG.',
            'signature.max' => 'La imagen no debe pesar más de 2MB.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            if (!$request->hasFile('signature') || !$request->file('signature')->isValid()) {
                return back()->with('error', 'El archivo no es válido.');
            }

            $file = $request->file('signature');
            $filename = 'signature_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('signatures', $filename, 'public');
            
            if (!$path) {
                return back()->with('error', 'Error al guardar la imagen.');
            }
            
            $user->updateSignature($path);

            return back()->with('success', 'Firma digital actualizada correctamente.');

        } catch (\Exception $e) {
            return back()->with('error', 'Error al subir la firma: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar la firma digital.
     * ✅ Cualquier usuario autenticado puede eliminar su propia firma
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login')->with('error', 'Debes iniciar sesión.');
        }
        
        if ($user->deleteSignature()) {
            return back()->with('success', 'Firma digital eliminada correctamente.');
        }
        
        return back()->with('error', 'Error al eliminar la firma.');
    }

    /**
     * Previsualizar la firma en el PDF.
     * ✅ Cualquier usuario autenticado puede previsualizar su propia firma
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function preview(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Debes iniciar sesión.'
            ], 401);
        }
        
        if (!$user->hasSignature()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes una firma registrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'signature_url' => $user->signature_url,
                'signature_base64' => $user->signature_base64,
                'signature_filename' => $user->signature_filename,
                'signature_size' => $user->signature_size,
                'signature_status' => $user->signature_status,
                'signature_updated_at' => $user->signature_updated_at?->format('d/m/Y H:i'),
            ]
        ]);
    }

    /**
     * Verificar el estado de la firma.
     * ✅ Cualquier usuario autenticado puede ver el estado de su propia firma
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function status(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Debes iniciar sesión.'
            ], 401);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'has_signature' => $user->hasSignature(),
                'signature_status' => $user->signature_status,
                'signature_status_color' => $user->signature_status_color,
                'signature_updated_at' => $user->signature_updated_at?->format('d/m/Y H:i'),
                'is_valid' => $user->isSignatureValid(),
            ]
        ]);
    }

    /**
     * Obtener la firma para un reporte específico (para admins).
     * ✅ SOLO ADMIN, SPECIALIST, SUPER_ADMIN
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSignatureForUser(Request $request, $userId)
    {
        // ✅ PROTECCIÓN - Solo admin, specialist, super_admin
        $user = $request->user();
        
        if (!$user || !in_array($user->role, ['admin', 'specialist', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para ver esta firma.'
            ], 403);
        }
        
        $targetUser = User::find($userId);
        
        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado.'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $targetUser->id,
                'name' => $targetUser->name,
                'has_signature' => $targetUser->hasSignature(),
                'signature_url' => $targetUser->signature_url,
                'signature_status' => $targetUser->signature_status,
                'signature_updated_at' => $targetUser->signature_updated_at?->format('d/m/Y H:i'),
            ]
        ]);
    }
}