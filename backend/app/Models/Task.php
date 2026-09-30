<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    protected $fillable = ['title', 'description', 'status', 'priority', 'due_date', 'position'];

    protected $casts = [
        'due_date' => 'date:Y-m-d',
        'completed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // Tự ghi nhận thời điểm hoàn thành khi đổi trạng thái
        static::saving(function (Task $task) {
            if ($task->isDirty('status')) {
                $task->completed_at = $task->status === 'DONE' ? now() : null;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'task_tag');
    }

    // Chỉ lấy dữ liệu của chính user (dùng ở mọi controller)
    public function scopeOwnedBy(Builder $q, int $userId): Builder
    {
        return $q->where('user_id', $userId);
    }

    public function scopeFilter(Builder $q, array $f): Builder
    {
        return $q
            ->when($f['search'] ?? null, fn ($q, $v) => $q->where('title', 'like', "%{$v}%"))
            ->when($f['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($f['priority'] ?? null, fn ($q, $v) => $q->where('priority', $v));
    }

    public function scopeUpcoming(Builder $q, int $days = 7): Builder
    {
        return $q->where('status', '!=', 'DONE')
            ->whereBetween('due_date', [today(), today()->addDays($days)])
            ->orderBy('due_date');
    }
}
