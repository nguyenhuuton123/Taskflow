<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'status' => 'sometimes|in:TODO,IN_PROGRESS,DONE',
            'priority' => 'sometimes|in:LOW,MEDIUM,HIGH',
            'due_date' => 'nullable|date',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
        ];
    }
}
