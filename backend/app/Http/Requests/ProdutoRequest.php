<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProdutoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $produtoId = $this->route('produto')?->id ?? $this->route('produto');
        
        $rules = [
            'categoria_id' => 'required|exists:categorias,id',
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'preco' => 'required|numeric|min:0',
            'preco_promocional' => 'nullable|numeric|min:0',
            'unidade' => 'string|max:20',
            'imagem' => 'nullable|string',
            'estoque_minimo' => 'integer|min:0',
            'ativo' => 'boolean',
        ];

        if ($this->isMethod('POST')) {
            $rules['codigo_barras'] = 'nullable|string|max:50|unique:produtos,codigo_barras';
            $rules['slug'] = 'nullable|string|unique:produtos,slug';
        } else {
            $rules['codigo_barras'] = [
                'nullable',
                'string',
                'max:50',
                Rule::unique('produtos', 'codigo_barras')->ignore($produtoId),
            ];
            $rules['slug'] = [
                'nullable',
                'string',
                Rule::unique('produtos', 'slug')->ignore($produtoId),
            ];
        }

        return $rules;
    }
}
