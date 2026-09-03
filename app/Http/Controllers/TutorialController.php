<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TutorialController extends Controller
{
    /**
     * Mostrar la página de tutoriales
     */
    public function index(Request $request)
    {
        return Inertia::render('Tutorials/Index');
    }
}