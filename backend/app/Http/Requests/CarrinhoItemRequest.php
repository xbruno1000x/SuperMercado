<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CarrinhoItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'produto_id' => 'required|exists:produtos,id',
            'quantidade' => 'integer|min:1',
        ];
    }
}
