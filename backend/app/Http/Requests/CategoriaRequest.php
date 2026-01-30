<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'imagem' => 'nullable|string',
            'ativo' => 'boolean',
            'ordem' => 'integer',
        ];

        if ($this->isMethod('POST')) {
            $rules['slug'] = 'nullable|string|unique:categorias,slug';
        } else {
            $rules['slug'] = 'nullable|string|unique:categorias,slug,' . $this->route('categoria');
        }

        return $rules;
    }
}
