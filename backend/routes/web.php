<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => view('welcome'));

// Swagger UI: http://localhost:8000/docs
Route::get('/docs', fn () => response()->file(public_path('docs/index.html')));
