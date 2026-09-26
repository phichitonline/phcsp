<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityRegistration;
use App\Models\ActivityTargetGroup;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::first();

        // 1. กิจกรรมตัวอย่าง A1 ตามเอกสาร PDF (พิธีไหว้ครู 8 ชั่วโมง)
        $act1 = Activity::firstOrCreate([
            'activity_code' => 'A1',
        ], [
            'academic_year' => 2569,
            'semester' => 1,
            'activity_name' => 'พิธีไหว้ครูและบายศรีสู่ขวัญ ประจำปีการศึกษา 2569',
            'activity_type' => 'mandatory',
            'activity_date' => Carbon::create(2026, 8, 7),
            'start_time' => '08:30:00',
            'end_time' => '16:30:00',
            'total_hours' => 8.0,
            'location_name' => 'หอประชุมใหญ่ วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี',
            'latitude' => 14.475685,
            'longitude' => 100.116528,
            'radius_limit' => 150,
            'status' => 'published',
            'max_participants' => 100,
            'description' => 'พิธีไหว้ครูเพื่อแสดงความเคารพและกตัญญูกตเวทิตาต่อคณาจารย์ พร้อมพิธีบายศรีสู่ขวัญต้อนรับนักศึกษาใหม่',
            'created_by' => $admin?->id,
            'qr_secret_token' => bin2hex(random_bytes(16)),
        ]);

        ActivityTargetGroup::firstOrCreate([
            'activity_id' => $act1->id,
            'target_type' => 'ALL',
        ], [
            'required' => true,
        ]);

        // 2. กิจกรรมตัวอย่าง A2: กิจกรรมจิตอาสาพัฒนาชุมชน (3 ชั่วโมง, สมัครใจ)
        $act2 = Activity::firstOrCreate([
            'activity_code' => 'A2',
        ], [
            'academic_year' => 2569,
            'semester' => 1,
            'activity_name' => 'โครงการจิตอาสาพัฒนาสิ่งแวดล้อมและส่งเสริมสุขภาพชุมชน',
            'activity_type' => 'elective',
            'activity_date' => Carbon::now()->addDays(3),
            'start_time' => '09:00:00',
            'end_time' => '12:00:00',
            'total_hours' => 3.0,
            'location_name' => 'ลานอเนกประสงค์ วสส.สุพรรณบุรี และชุมชนโดยรอบ',
            'latitude' => 14.475685,
            'longitude' => 100.116528,
            'radius_limit' => 200,
            'status' => 'published',
            'max_participants' => 50,
            'description' => 'กิจกรรมจิตอาสาร่วมกับชุมชน รณรงค์ป้องกันโรคไข้เลือดออกและส่งเสริมสุขาภิบาลสิ่งแวดล้อม',
            'created_by' => $admin?->id,
            'qr_secret_token' => bin2hex(random_bytes(16)),
        ]);

        ActivityTargetGroup::firstOrCreate([
            'activity_id' => $act2->id,
            'target_type' => 'ALL',
        ], [
            'required' => false,
        ]);

        // 3. กิจกรรมตัวอย่าง A3: ปฐมนิเทศนักศึกษาฝึกปฏิบัติงาน (4 ชั่วโมง, บังคับ)
        $act3 = Activity::firstOrCreate([
            'activity_code' => 'A3',
        ], [
            'academic_year' => 2569,
            'semester' => 1,
            'activity_name' => 'ปฐมนิเทศเตรียมความพร้อมการฝึกปฏิบัติงานวิชาชีพสาธารณสุข',
            'activity_type' => 'mandatory',
            'activity_date' => Carbon::now()->subDays(5),
            'start_time' => '13:00:00',
            'end_time' => '17:00:00',
            'total_hours' => 4.0,
            'location_name' => 'ห้องประชุมราชพฤกษ์ ชั้น 3 วสส.สุพรรณบุรี',
            'latitude' => 14.475685,
            'longitude' => 100.116528,
            'radius_limit' => 100,
            'status' => 'completed',
            'max_participants' => 80,
            'description' => 'เตรียมความพร้อมด้านจริยธรรม กฎหมายสาธารณสุข และทักษะการปฏิบัติงานในโรงพยาบาลและ รพ.สต.',
            'created_by' => $admin?->id,
            'qr_secret_token' => bin2hex(random_bytes(16)),
        ]);

        ActivityTargetGroup::firstOrCreate([
            'activity_id' => $act3->id,
            'target_type' => 'ALL',
        ], [
            'required' => true,
        ]);

        // ลงทะเบียนตัวอย่างสำหรับผู้ใช้ที่มีอยู่ในระบบ
        $students = User::whereHas('studentProfile')->orWhere('role', 'student')->get();
        if ($students->isEmpty()) {
            $students = User::limit(5)->get();
        }

        foreach ($students as $student) {
            $studentCode = $student->studentProfile?->student_code ?? 'STU-' . $student->id;

            // กิจกรรม A3 (เสร็จสิ้นแล้ว - บันทึกผลเข้าร่วม)
            ActivityRegistration::firstOrCreate([
                'activity_id' => $act3->id,
                'user_id' => $student->id,
            ], [
                'student_code' => $studentCode,
                'registration_status' => 'attended',
                'registered_at' => Carbon::now()->subDays(7),
                'check_in_time' => Carbon::now()->subDays(5)->setTime(12, 50),
                'check_out_time' => Carbon::now()->subDays(5)->setTime(17, 05),
                'check_in_method' => 'QR',
                'check_in_lat' => 14.475680,
                'check_in_lng' => 100.116520,
                'check_in_distance' => 12.5,
                'actual_hours' => 4.0,
                'attendance_type' => 'full',
            ]);

            // กิจกรรม A1 (ลงทะเบียนล่วงหน้า)
            ActivityRegistration::firstOrCreate([
                'activity_id' => $act1->id,
                'user_id' => $student->id,
            ], [
                'student_code' => $studentCode,
                'registration_status' => 'registered',
                'registered_at' => Carbon::now()->subDays(2),
                'actual_hours' => 0.0,
                'attendance_type' => 'none',
            ]);
        }
    }
}
