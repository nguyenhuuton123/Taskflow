<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->enum('status', ['TODO', 'IN_PROGRESS', 'DONE'])->default('TODO');
            $table->enum('priority', ['LOW', 'MEDIUM', 'HIGH'])->default('MEDIUM');
            $table->date('due_date')->nullable();
            $table->unsignedInteger('position')->default(0); // thứ tự trong cột Kanban
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Index phục vụ lọc, tìm kiếm, dashboard
            $table->index(['user_id', 'status', 'position']);
            $table->index(['user_id', 'priority']);
            $table->index(['user_id', 'due_date']);
            $table->index(['user_id', 'title']);
        });

        // Ràng buộc dữ liệu: title không rỗng (MySQL 8.0.16+)
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT chk_tasks_title CHECK (CHAR_LENGTH(TRIM(title)) > 0)");
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
