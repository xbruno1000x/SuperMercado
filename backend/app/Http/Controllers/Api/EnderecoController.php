<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnderecoRequest;
use App\Models\Endereco;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnderecoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $enderecos = Endereco::where('user_id', $request->user()->id)
            ->orderBy('principal', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($enderecos);
    }

    public function store(EnderecoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        if ($request->boolean('principal')) {
            Endereco::where('user_id', $request->user()->id)
                ->update(['principal' => false]);
        }

        $endereco = Endereco::create($data);

        return response()->json($endereco, 201);
    }

    public function show(Request $request, Endereco $endereco): JsonResponse
    {
        if ($endereco->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Endereço não encontrado',
            ], 404);
        }

        return response()->json($endereco);
    }

    public function update(EnderecoRequest $request, Endereco $endereco): JsonResponse
    {
        if ($endereco->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Endereço não encontrado',
            ], 404);
        }

        if ($request->boolean('principal')) {
            Endereco::where('user_id', $request->user()->id)
                ->where('id', '!=', $endereco->id)
                ->update(['principal' => false]);
        }

        $endereco->update($request->validated());

        return response()->json($endereco);
    }

    public function destroy(Request $request, Endereco $endereco): JsonResponse
    {
        if ($endereco->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Endereço não encontrado',
            ], 404);
        }

        $endereco->delete();

        return response()->json(null, 204);
    }

    public function definirPrincipal(Request $request, Endereco $endereco): JsonResponse
    {
        if ($endereco->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Endereço não encontrado',
            ], 404);
        }

        DB::transaction(function () use ($request, $endereco) {
            Endereco::where('user_id', $request->user()->id)
                ->update(['principal' => false]);

            $endereco->update(['principal' => true]);
        });

        return response()->json($endereco);
    }
}
