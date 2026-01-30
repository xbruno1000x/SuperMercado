<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'SuperMercado API',
        'version' => '1.0.0',
    ]);
});
