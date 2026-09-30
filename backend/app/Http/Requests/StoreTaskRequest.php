<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'status' => 'nullable|in:TODO,IN_PROGRESS,DONE',
            'priority' => 'nullable|in:LOW,MEDIUM,HIGH',
            'due_date' => 'nullable|date',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
        ];
    }
}
