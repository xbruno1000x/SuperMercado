<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AtualizarStatusPedidoRequest;
use App\Http\Requests\PedidoRequest;
use App\Models\Pedido;
use App\Services\PedidoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    protected PedidoService $pedidoService;

    public function __construct(PedidoService $pedidoService)
    {
        $this->pedidoService = $pedidoService;
    }

    public function index(Request $request): JsonResponse
    {
        $pedidos = $this->pedidoService->listarPedidosCliente(
            $request->user()->id,
            $request->get('per_page', 15)
        );

        return response()->json($pedidos);
    }

    public function store(PedidoRequest $request): JsonResponse
    {
        try {
            $pedido = $this->pedidoService->criarPedido(
                $request->user()->id,
                $request->endereco_id,
                $request->forma_pagamento,
                $request->troco_para,
                $request->observacoes,
                $request->get('taxa_entrega', 0)
            );

            return response()->json($pedido, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            // Admin pode ver qualquer pedido, cliente só pode ver seus próprios
            $userId = $user->perfil === 'admin' ? null : $user->id;
            $pedido = $this->pedidoService->getPedido($id, $userId);

            return response()->json($pedido);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Pedido não encontrado',
            ], 404);
        }
    }

    public function atualizarStatus(AtualizarStatusPedidoRequest $request, Pedido $pedido): JsonResponse
    {
        try {
            $pedido = $this->pedidoService->atualizarStatus($pedido, $request->status);

            return response()->json($pedido);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function listarTodos(Request $request): JsonResponse
    {
        $query = Pedido::with(['user', 'itens']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('data')) {
            $query->whereDate('created_at', $request->data);
        }

        $pedidos = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($pedidos);
    }

    public function solicitarCancelamento(Request $request, int $id): JsonResponse
    {
        try {
            $pedido = Pedido::where('user_id', $request->user()->id)
                ->findOrFail($id);

            // Só pode solicitar cancelamento se o pedido ainda não começou a ser separado
            if (!in_array($pedido->status, [Pedido::STATUS_CRIADO])) {
                return response()->json([
                    'message' => 'Não é possível solicitar cancelamento. O pedido já está em separação ou foi finalizado.',
                ], 422);
            }

            $pedido->status = Pedido::STATUS_CANCELAMENTO_SOLICITADO;
            $pedido->save();

            return response()->json([
                'message' => 'Solicitação de cancelamento enviada com sucesso',
                'pedido' => $pedido->load('itens'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Pedido não encontrado',
            ], 404);
        }
    }

    public function adicionarItens(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'itens' => 'required|array|min:1',
            'itens.*.produto_id' => 'required|exists:produtos,id',
            'itens.*.quantidade' => 'required|integer|min:1',
        ]);

        try {
            $pedido = Pedido::where('user_id', $request->user()->id)
                ->findOrFail($id);

            // Só pode adicionar itens se o pedido ainda não começou a ser separado
            if ($pedido->status !== Pedido::STATUS_CRIADO) {
                return response()->json([
                    'message' => 'Não é possível adicionar itens. O pedido já está em separação ou foi finalizado.',
                ], 422);
            }

            $pedido = $this->pedidoService->adicionarItens($pedido, $request->itens);

            return response()->json([
                'message' => 'Itens adicionados com sucesso',
                'pedido' => $pedido,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
