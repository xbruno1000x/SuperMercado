<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VendaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'itens' => 'required|array|min:1',
            'itens.*.produto_id' => 'required|exists:produtos,id',
            'itens.*.quantidade' => 'required|integer|min:1',
            'forma_pagamento' => 'required|in:dinheiro,cartao,pix',
            'desconto' => 'numeric|min:0',
            'valor_recebido' => 'nullable|numeric|min:0',
            'observacoes' => 'nullable|string',
        ];
    }
}
