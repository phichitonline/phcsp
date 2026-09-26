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
        // 1. ตารางกิจกรรม (activities)
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('activity_code', 50)->nullable()->index(); // รหัสกิจกรรม เช่น A1, ACT-2569-001
            $table->integer('academic_year')->default(2569); // ปี พ.ศ.
            $table->tinyInteger('semester')->default(1); // ภาคเรียน (1, 2, 3)
            $table->string('activity_name'); // ชื่อกิจกรรม
            $table->string('activity_type', 50)->default('mandatory'); // mandatory (กิจกรรมหลัก/บังคับ), elective (กิจกรรมเลือก)
            $table->date('activity_date'); // วันที่จัดกิจกรรม
            $table->time('start_time'); // เวลาเริ่มกิจกรรม
            $table->time('end_time'); // เวลาสิ้นสุดกิจกรรม
            $table->decimal('total_hours', 4, 1)->default(3.0); // จำนวนชั่วโมงกิจกรรมที่กำหนดไว้ เช่น 3, 8 ชม.
            $table->string('location_name')->nullable(); // ชื่อสถานที่จัดกิจกรรม
            $table->decimal('latitude', 10, 8)->nullable(); // ละติจูด
            $table->decimal('longitude', 11, 8)->nullable(); // ลองจิจูด
            $table->integer('radius_limit')->default(100); // รัศมีที่อนุญาตให้เช็กอินได้ (เมตร)
            $table->string('qr_secret_token', 64)->nullable(); // Token ประจำกิจกรรมสำหรับสร้าง Dynamic QR Code
            $table->string('status', 30)->default('draft'); // draft, published, ongoing, completed, cancelled
            $table->integer('max_participants')->nullable(); // จำนวนผู้เข้าร่วมสูงสุด
            $table->text('description')->nullable(); // รายละเอียดกิจกรรม
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); // ผู้สร้างกิจกรรม
            $table->timestamps();
        });

        // 2. ตารางกำหนดกลุ่มเป้าหมาย (activity_target_groups)
        Schema::create('activity_target_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->string('target_type', 30)->default('ALL'); // ALL, FACULTY, MAJOR, CLASS_YEAR, STUDENT_ID
            $table->string('target_value', 150)->nullable(); // เช่น รหัสสาขา, ชั้นปีที่ 2, หรือ รหัสนักศึกษา
            $table->boolean('required')->default(true); // true = บังคับเข้าร่วม, false = สมัครใจ
            $table->timestamps();
        });

        // 3. ตารางการลงทะเบียนและเข้าร่วมกิจกรรม (activity_registrations)
        Schema::create('activity_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('student_code', 50)->nullable()->index(); // รหัสนักศึกษา
            $table->string('registration_status', 30)->default('registered'); // registered, attended, absent, cancelled
            $table->dateTime('registered_at')->nullable(); // วันเวลาที่ลงทะเบียน
            $table->dateTime('check_in_time')->nullable(); // เวลาเช็กอิน
            $table->dateTime('check_out_time')->nullable(); // เวลาเช็กเอาต์
            $table->string('check_in_method', 30)->nullable(); // QR, GPS, FACE, THAID, MANUAL
            $table->decimal('check_in_lat', 10, 8)->nullable(); // พิกัดละติจูดขณะเช็กอิน
            $table->decimal('check_in_lng', 11, 8)->nullable(); // พิกัดลองจิจูดขณะเช็กอิน
            $table->decimal('check_in_distance', 8, 2)->nullable(); // ระยะห่างจากจุดจัดงาน (เมตร)
            $table->string('check_in_photo')->nullable(); // รูปถ่าย Selfie ยืนยันตัวตน
            $table->decimal('face_match_score', 5, 2)->nullable(); // คะแนนความเหมือนใบหน้า
            $table->decimal('actual_hours', 4, 1)->default(0.0); // จำนวนชั่วโมงที่คำนวณได้จริง
            $table->string('attendance_type', 30)->default('none'); // full (เต็มเวลา), partial (ไม่เต็มเวลา), none (ไม่ผ่าน)
            $table->boolean('admin_override')->default(false); // มีการแก้ไขโดยอาจารย์หรือไม่
            $table->foreignId('override_by')->nullable()->constrained('users')->nullOnDelete(); // อาจารย์ที่ปรับแก้
            $table->string('override_reason')->nullable(); // เหตุผลการปรับแก้
            $table->text('notes')->nullable(); // หมายเหตุเพิ่มเติม
            $table->timestamps();

            $table->unique(['activity_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_registrations');
        Schema::dropIfExists('activity_target_groups');
        Schema::dropIfExists('activities');
    }
};
