<?php

namespace App\Http\Controllers;

use App\Http\Requests\MoveTaskRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    private const SORTABLE = ['created_at', 'due_date', 'priority', 'title', 'position'];

    // GET /api/tasks?search=&status=&priority=&sort=&direction=&per_page=&page=
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => 'nullable|in:TODO,IN_PROGRESS,DONE',
            'priority' => 'nullable|in:LOW,MEDIUM,HIGH',
            'sort' => 'nullable|in:' . implode(',', self::SORTABLE),
            'direction' => 'nullable|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $tasks = $request->user()->tasks()
            ->with('tags')
            ->filter($request->only(['search', 'status', 'priority']))
            ->orderBy($request->input('sort', 'created_at'), $request->input('direction', 'desc'))
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return TaskResource::collection($tasks);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->safe()->except('tags');
        $data['status'] ??= 'TODO';
        // Đặt task mới xuống cuối cột
        $data['position'] = ($user->tasks()->where('status', $data['status'])->max('position') ?? -1) + 1;

        $task = $user->tasks()->create($data);
        $this->syncTags($task, $request->input('tags'), $user);

        return (new TaskResource($task->load('tags')))->response()->setStatusCode(201);
    }

    public function show(Request $request, int $task): TaskResource
    {
        return new TaskResource($this->findOwned($request, $task)->load('tags'));
    }

    public function update(UpdateTaskRequest $request, int $task): TaskResource
    {
        $model = $this->findOwned($request, $task);
        $model->update($request->safe()->except('tags'));
        $this->syncTags($model, $request->input('tags'), $request->user());

        return new TaskResource($model->load('tags'));
    }

    public function destroy(Request $request, int $task): JsonResponse
    {
        $this->findOwned($request, $task)->delete();

        return response()->json(null, 204);
    }

    // PATCH /api/tasks/{id}/move  { "status": "DONE", "position": 0 }
    public function move(MoveTaskRequest $request, int $task): TaskResource
    {
        $model = $this->findOwned($request, $task);
        $status = $request->status;
        $position = $request->position;

        DB::transaction(function () use ($request, $model, $status, $position) {
            // Nhường chỗ trong cột đích
            $request->user()->tasks()
                ->where('status', $status)
                ->where('id', '!=', $model->id)
                ->where('position', '>=', $position)
                ->increment('position');

            $model->update(['status' => $status, 'position' => $position]);
        });

        return new TaskResource($model->load('tags'));
    }

    // Chỉ tìm trong task của user hiện tại; task của người khác trả về 404
    private function findOwned(Request $request, int $id): Task
    {
        return $request->user()->tasks()->findOrFail($id);
    }

    private function syncTags(Task $task, ?array $names, User $user): void
    {
        if ($names === null) {
            return;
        }
        $ids = collect($names)
            ->map(fn ($n) => trim($n))
            ->filter()
            ->unique()
            ->map(fn ($n) => $user->tags()->firstOrCreate(['name' => $n])->id);

        $task->tags()->sync($ids);
    }
}
