<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('webboard_posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('title');
            $table->text('content');
            $table->string('category')->default('question'); // question, feedback, problem
            $table->string('status')->default('open'); // open, answered
            $table->text('answer')->nullable();
            $table->unsignedBigInteger('answered_by')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('answered_by')->references('id')->on('users')->onDelete('set null');
        });

        // Insert default record if users exist
        $userId = \Illuminate\Support\Facades\DB::table('users')->where('id', 1)->value('id');
        \Illuminate\Support\Facades\DB::table('webboard_posts')->insert([
            'id' => 1,
            'user_id' => $userId,
            'title' => 'HOS-info ยินดีต้อนรับ',
            'content' => 'ยินดีต้อนรับ',
            'category' => 'question',
            'status' => 'answered',
            'answer' => 'Welcome',
            'answered_by' => $userId,
            'answered_at' => '2026-07-15 01:26:31',
            'created_at' => '2026-07-14 10:08:00',
            'updated_at' => '2026-07-15 01:26:31',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webboard_posts');
    }
};
