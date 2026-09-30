<?php

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'name' => 'Demo User',
            'email' => 'demo@taskflow.test',
            'password' => 'password123',
        ]);
        User::create(['name' => 'Other User', 'email' => 'other@taskflow.test', 'password' => 'password123']);

        $ui = Tag::create(['user_id' => $user->id, 'name' => 'Ui']);
        $design = Tag::create(['user_id' => $user->id, 'name' => 'Design']);
        $backend = Tag::create(['user_id' => $user->id, 'name' => 'Backend']);

        // Dữ liệu giống ảnh giao diện
        $samples = [
            ['Product Redesign', 'TODO', 'MEDIUM', 0, [$ui, $design]],
            ['Mobile App Beta', 'IN_PROGRESS', 'MEDIUM', 2, [$ui, $design]],
            ['Performance Optimization', 'IN_PROGRESS', 'HIGH', 3, [$ui, $backend]],
            ['API Integration for Tasks', 'DONE', 'MEDIUM', -2, [$ui, $backend]],
        ];
        foreach ($samples as $i => [$title, $status, $priority, $offset, $tags]) {
            $task = Task::make([
                'title' => $title,
                'description' => "Mô tả cho công việc: {$title}",
                'status' => $status,
                'priority' => $priority,
                'due_date' => today()->addDays($offset),
                'position' => $i,
            ]);
            $task->user_id = $user->id;
            $task->save();
            $task->tags()->attach(collect($tags)->pluck('id'));
        }

        // Thêm dữ liệu để test phân trang / lọc
        $statuses = ['TODO', 'IN_PROGRESS', 'DONE'];
        $priorities = ['LOW', 'MEDIUM', 'HIGH'];
        for ($i = 1; $i <= 30; $i++) {
            $task = Task::make([
                'title' => "Sample task #{$i}",
                'description' => 'Dữ liệu mẫu để kiểm thử phân trang.',
                'status' => $statuses[$i % 3],
                'priority' => $priorities[$i % 3],
                'due_date' => today()->addDays(rand(-5, 20)),
                'position' => $i + 10,
            ]);
            $task->user_id = $user->id;
            $task->save();
        }
    }
}
