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
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('student_code')->nullable()->index(); // รหัสนักศึกษา
            $table->string('national_id')->nullable(); // เลขประจำตัวประชาชน
            $table->string('title_prefix')->nullable(); // คำนำหน้าชื่อ (นาย / นางสาว / นาง)
            $table->string('first_name_th')->nullable(); // ชื่อภาษาไทย
            $table->string('last_name_th')->nullable(); // นามสกุลภาษาไทย
            $table->string('first_name_en')->nullable(); // ชื่อภาษาอังกฤษ
            $table->string('last_name_en')->nullable(); // นามสกุลภาษาอังกฤษ
            $table->string('gender')->nullable(); // เพศ
            $table->date('birth_date')->nullable(); // วัน/เดือน/ปี เกิด
            $table->string('blood_group')->nullable(); // หมู่เลือด
            $table->string('religion')->nullable(); // ศาสนา
            $table->string('ethnicity')->nullable()->default('ไทย'); // เชื้อชาติ
            $table->string('nationality')->nullable()->default('ไทย'); // สัญชาติ
            $table->string('phone')->nullable(); // เบอร์โทรศัพท์
            $table->string('line_id')->nullable(); // Line ID
            $table->string('faculty')->nullable()->default('วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี'); // วิทยาลัย/คณะ
            $table->string('major')->nullable()->default('สาธารณสุขศาสตรบัณฑิต (สาธารณสุขชุมชน)'); // สาขาวิชา
            $table->string('academic_year')->nullable()->default('2567'); // ปีการศึกษา / รุ่น
            $table->string('class_year')->nullable()->default('ชั้นปีที่ 1'); // ชั้นปี
            $table->string('advisor_name')->nullable(); // อาจารย์ที่ปรึกษา
            $table->string('student_status')->default('กำลังศึกษา'); // สถานะภาพ (กำลังศึกษา / สำเร็จการศึกษา / ลาพัก)
            $table->decimal('gpa', 3, 2)->nullable(); // เกรดเฉลี่ยสะสม GPAX
            $table->string('practicum_hospital')->nullable(); // แหล่งฝึกงาน / โรงพยาบาลฝึกปฏิบัติงาน
            $table->text('address')->nullable(); // ที่อยู่ตามทะเบียนบ้าน
            $table->text('current_address')->nullable(); // ที่อยู่ปัจจุบัน / หอพัก
            $table->string('emergency_contact_name')->nullable(); // ผู้ติดต่อฉุกเฉิน
            $table->string('emergency_relationship')->nullable(); // ความสัมพันธ์
            $table->string('emergency_phone')->nullable(); // เบอร์ติดต่อฉุกเฉิน
            $table->text('health_conditions')->nullable(); // โรคประจำตัว / ประวัติการแพ้ยา
            $table->string('avatar_path')->nullable(); // รูปถ่ายนักศึกษา
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
