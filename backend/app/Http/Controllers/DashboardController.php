<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // GET /api/dashboard?days=7
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $counts = $user->tasks()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        $upcoming = $user->tasks()->with('tags')
            ->upcoming(min($request->integer('days', 7), 90))
            ->limit(10)->get();

        // Hoạt động gần đây = các task được cập nhật gần nhất
        $recent = $user->tasks()->with('tags')->latest('updated_at')->limit(5)->get();

        // Tiến độ theo tag (đóng vai trò "project" trên giao diện)
        $projects = $user->tags()
            ->withCount(['tasks', 'tasks as done_count' => fn ($q) => $q->where('status', 'DONE')])
            ->orderByDesc('tasks_count')
            ->limit(3)->get()
            ->map(fn ($t) => ['name' => $t->name, 'total' => $t->tasks_count, 'done' => $t->done_count]);

        $open = $user->tasks()->where('status', '!=', 'DONE');

        return response()->json([
            'total' => $counts->sum(),
            'todo' => (int) ($counts['TODO'] ?? 0),
            'in_progress' => (int) ($counts['IN_PROGRESS'] ?? 0),
            'done' => (int) ($counts['DONE'] ?? 0),
            'due_today' => (clone $open)->whereDate('due_date', today())->count(),
            'overdue' => (clone $open)->whereDate('due_date', '<', today())->count(),
            'upcoming' => TaskResource::collection($upcoming)->resolve(),
            'recent' => TaskResource::collection($recent)->resolve(),
            'projects' => $projects,
        ]);
    }
}
