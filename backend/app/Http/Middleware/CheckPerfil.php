<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPerfil
{
    public function handle(Request $request, Closure $next, ...$perfis): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        if (!in_array($request->user()->perfil, $perfis)) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        return $next($request);
    }
}
