<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'due_date' => $this->due_date?->toDateString(),
            'is_overdue' => $this->status !== 'DONE' && $this->due_date?->isPast() && ! $this->due_date->isToday(),
            'position' => $this->position,
            'completed_at' => $this->completed_at,
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->pluck('name')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
