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
        Schema::create('curriculums', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. MPH-2566
            $table->string('name'); // e.g. หลักสูตรสาธารณสุขศาสตรมหาบัณฑิต (ส.ม.)
            $table->string('degree_level')->default('master'); // master, bachelor, etc.
            $table->integer('total_credits')->default(36);
            $table->integer('core_credits_required')->default(15);
            $table->integer('elective_credits_required')->default(9);
            $table->integer('thesis_credits_required')->default(12);
            $table->decimal('min_gpa_graduate', 3, 2)->default(3.00);
            $table->string('academic_year_start')->nullable(); // e.g. 2566
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curriculum_id')->constrained('curriculums')->onDelete('cascade');
            $table->string('course_code'); // e.g. MPH601
            $table->string('course_name_th');
            $table->string('course_name_en')->nullable();
            $table->integer('credits')->default(3);
            $table->integer('lecture_hours')->default(3);
            $table->integer('lab_hours')->default(0);
            $table->integer('self_study_hours')->default(6);
            $table->enum('category', ['core', 'elective', 'thesis', 'remedial'])->default('core');
            $table->integer('term_suggested')->nullable(); // 1, 2, 3
            $table->integer('year_suggested')->default(1); // 1, 2
            $table->boolean('is_active')->default(true);
            $table->integer('order_no')->default(1);
            $table->timestamps();

            $table->index(['curriculum_id', 'course_code']);
            $table->index(['category', 'is_active']);
        });

        Schema::create('student_course_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_profile_id')->nullable()->constrained('student_profiles')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('academic_year', 10); // e.g. 2567
            $table->unsignedTinyInteger('semester')->default(1); // 1, 2, 3 (summer)
            $table->string('grade', 5)->nullable(); // A, B+, B, C+, C, D+, D, F, S, U, W, I, IP
            $table->decimal('grade_point', 3, 2)->nullable(); // 4.00, 3.50, 3.00 etc.
            $table->boolean('is_passed')->default(false);
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('remark')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id', 'academic_year', 'semester'], 'unique_student_course_term');
            $table->index(['user_id', 'is_passed']);
            $table->index(['academic_year', 'semester']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_course_grades');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('curriculums');
    }
};
