<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MovimentacaoEstoqueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'produto_id' => 'required|exists:produtos,id',
            'tipo' => 'required|in:entrada,saida,ajuste',
            'quantidade' => 'required|integer|min:1',
            'observacao' => 'nullable|string',
        ];
    }
}
