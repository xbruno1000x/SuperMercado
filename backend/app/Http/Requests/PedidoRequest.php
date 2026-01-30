<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PedidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'endereco_id' => 'required|exists:enderecos,id',
            'forma_pagamento' => 'required|in:dinheiro,cartao,pix',
            'troco_para' => 'nullable|numeric|min:0',
            'observacoes' => 'nullable|string',
            'taxa_entrega' => 'numeric|min:0',
        ];
    }
}
