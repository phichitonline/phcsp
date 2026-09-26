<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityRegistration;
use App\Models\ActivityTargetGroup;
use App\Models\StudentProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ActivityController extends Controller
{
    /**
     * Helper คำนวณระยะทาง Haversine (หน่วย: เมตร)
     */
    public static function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // รัศมีโลกเป็นเมตร

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }

    /**
     * Helper สร้าง Dynamic QR Token ที่หมุนเวียนตามเวลาที่กำหนดในกิจกรรม (วินาที)
     */
    public static function generateDynamicQrToken(Activity $activity, int $timeOffsetSeconds = 0): string
    {
        $interval = max(15, (int) ($activity->qr_refresh_interval ?: 60));
        $timeWindow = floor((time() + $timeOffsetSeconds) / $interval);
        return hash_hmac('sha256', $activity->id . '|' . $timeWindow, $activity->ensureQrToken());
    }

    /**
     * Helper ตรวจสอบความถูกต้องของ Dynamic QR Token (ยอมรับย้อนหลังได้ 1 window เผื่อ delay)
     */
    public static function verifyDynamicQrToken(Activity $activity, string $providedToken): bool
    {
        $interval = max(15, (int) ($activity->qr_refresh_interval ?: 60));
        $current = self::generateDynamicQrToken($activity, 0);
        $prev = self::generateDynamicQrToken($activity, -$interval);
        $next = self::generateDynamicQrToken($activity, $interval);

        return hash_equals($current, $providedToken) ||
               hash_equals($prev, $providedToken) ||
               hash_equals($next, $providedToken);
    }

    /**
     * แสดงรายการกิจกรรมทั้งหมด (สำหรับอาจารย์ / ผู้ดูแลระบบ)
     */
    public function index(Request $request)
    {
        $query = Activity::with(['creator', 'targetGroups'])
            ->withCount([
                'registrations',
                'registrations as attended_count' => function ($q) {
                    $q->whereNotNull('check_in_time');
                }
            ]);

        // ตัวกรองปีการศึกษา
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        // ตัวกรองภาคเรียน
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        // ตัวกรองประเภทกิจกรรม
        if ($request->filled('activity_type')) {
            $query->where('activity_type', $request->activity_type);
        }

        // ค้นหาตามชื่อกิจกรรมหรือสถานที่
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('activity_name', 'like', "%{$search}%")
                  ->orWhere('activity_code', 'like', "%{$search}%")
                  ->orWhere('location_name', 'like', "%{$search}%");
            });
        }

        $activities = $query->orderBy('activity_date', 'desc')
                            ->orderBy('start_time', 'asc')
                            ->paginate(15)
                            ->withQueryString();

        // สถิติภาพรวม
        $stats = [
            'total_activities' => Activity::count(),
            'mandatory_count' => Activity::where('activity_type', 'mandatory')->count(),
            'elective_count' => Activity::where('activity_type', 'elective')->count(),
            'total_hours' => Activity::sum('total_hours'),
            'total_checkins' => ActivityRegistration::whereNotNull('check_in_time')->count(),
        ];

        // ตัวเลือกปีการศึกษาที่มีข้อมูล
        $academicYears = Activity::select('academic_year')
            ->distinct()
            ->orderBy('academic_year', 'desc')
            ->pluck('academic_year')
            ->toArray();

        if (empty($academicYears)) {
            $academicYears = [2569, 2568, 2567];
        }

        return Inertia::render('activities/index', [
            'activities' => $activities,
            'filters' => $request->only(['academic_year', 'semester', 'activity_type', 'search']),
            'stats' => $stats,
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * บันทึกกิจกรรมใหม่
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'activity_name' => 'required|string|max:255',
            'activity_code' => 'nullable|string|max:50',
            'academic_year' => 'required|integer',
            'semester' => 'required|integer|in:1,2,3',
            'activity_type' => 'required|in:mandatory,elective',
            'activity_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'total_hours' => 'required|numeric|min:0.5|max:100',
            'location_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius_limit' => 'nullable|integer|min:10|max:5000',
            'qr_refresh_interval' => 'nullable|integer|min:15|max:600',
            'status' => 'nullable|in:draft,published,ongoing,completed,cancelled',
            'max_participants' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'target_groups' => 'nullable|array',
            'target_groups.*.target_type' => 'required|string',
            'target_groups.*.target_value' => 'nullable|string',
            'target_groups.*.required' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            $activity = Activity::create([
                'activity_code' => $validated['activity_code'] ?? null,
                'academic_year' => $validated['academic_year'],
                'semester' => $validated['semester'],
                'activity_name' => $validated['activity_name'],
                'activity_type' => $validated['activity_type'],
                'activity_date' => $validated['activity_date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'total_hours' => $validated['total_hours'],
                'location_name' => $validated['location_name'] ?? 'วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี',
                'latitude' => $validated['latitude'] ?? 14.475685, // ค่าเริ่มต้น วสส.สุพรรณบุรี
                'longitude' => $validated['longitude'] ?? 100.116528,
                'radius_limit' => $validated['radius_limit'] ?? 100,
                'qr_secret_token' => bin2hex(random_bytes(16)),
                'qr_refresh_interval' => $validated['qr_refresh_interval'] ?? 60,
                'status' => $validated['status'] ?? 'published',
                'max_participants' => $validated['max_participants'] ?? null,
                'description' => $validated['description'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            // กำหนดรหัสกิจกรรมอัตโนมัติหากไม่ได้ระบุ
            if (empty($activity->activity_code)) {
                $activity->activity_code = 'ACT-' . $activity->academic_year . '-' . str_pad($activity->id, 3, '0', STR_PAD_LEFT);
                $activity->saveQuietly();
            }

            // บันทึกกลุ่มเป้าหมาย (activity_target_groups)
            if (!empty($validated['target_groups'])) {
                foreach ($validated['target_groups'] as $group) {
                    $activity->targetGroups()->create([
                        'target_type' => $group['target_type'],
                        'target_value' => $group['target_value'] ?? null,
                        'required' => $group['required'] ?? true,
                    ]);
                }
            } else {
                // ค่าเริ่มต้น: บังคับนักศึกษาทั้งหมด
                $activity->targetGroups()->create([
                    'target_type' => 'ALL',
                    'target_value' => null,
                    'required' => ($activity->activity_type === 'mandatory'),
                ]);
            }

            DB::commit();

            return redirect()->route('activities.show', $activity->id)
                ->with('success', "สร้างกิจกรรม '{$activity->activity_name}' สำเร็จเรียบร้อยแล้ว");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'เกิดข้อผิดพลาดในการสร้างกิจกรรม: ' . $e->getMessage());
        }
    }

    /**
     * ดูรายละเอียดกิจกรรม ตรวจสอบผลการเข้าร่วม และจัดการรายชื่อ
     */
    public function show($id)
    {
        $activity = Activity::with(['creator', 'targetGroups'])
            ->findOrFail($id);

        $activity->ensureQrToken();

        // ดึงรายชื่อการลงทะเบียนพร้อมข้อมูลนักศึกษา
        $registrations = ActivityRegistration::with(['user.studentProfile', 'overrideUser'])
            ->where('activity_id', $activity->id)
            ->orderBy('check_in_time', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        // คำนวณสถิติ
        $totalRegistered = $registrations->count();
        $attendedCount = $registrations->whereNotNull('check_in_time')->count();
        $fullTimeCount = $registrations->where('attendance_type', 'full')->count();
        $partialTimeCount = $registrations->where('attendance_type', 'partial')->count();
        $absentCount = $registrations->whereNull('check_in_time')->count();

        // สร้าง token Dynamic QR ปัจจุบัน
        $currentDynamicQr = self::generateDynamicQrToken($activity);

        return Inertia::render('activities/show', [
            'activity' => $activity,
            'registrations' => $registrations,
            'stats' => [
                'total_registered' => $totalRegistered,
                'attended_count' => $attendedCount,
                'full_time_count' => $fullTimeCount,
                'partial_time_count' => $partialTimeCount,
                'absent_count' => $absentCount,
                'attendance_percent' => $totalRegistered > 0 ? round(($attendedCount / $totalRegistered) * 100, 1) : 0,
            ],
            'currentDynamicQr' => $currentDynamicQr,
        ]);
    }

    /**
     * อัปเดตข้อมูลกิจกรรม
     */
    public function update(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        $validated = $request->validate([
            'activity_name' => 'required|string|max:255',
            'activity_code' => 'nullable|string|max:50',
            'academic_year' => 'required|integer',
            'semester' => 'required|integer|in:1,2,3',
            'activity_type' => 'required|in:mandatory,elective',
            'activity_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'total_hours' => 'required|numeric|min:0.5|max:100',
            'location_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius_limit' => 'nullable|integer|min:10|max:5000',
            'qr_refresh_interval' => 'nullable|integer|min:15|max:600',
            'status' => 'nullable|in:draft,published,ongoing,completed,cancelled',
            'max_participants' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'target_groups' => 'nullable|array',
            'target_groups.*.target_type' => 'required|string',
            'target_groups.*.target_value' => 'nullable|string',
            'target_groups.*.required' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            $activity->update([
                'activity_code' => $validated['activity_code'] ?? $activity->activity_code,
                'academic_year' => $validated['academic_year'],
                'semester' => $validated['semester'],
                'activity_name' => $validated['activity_name'],
                'activity_type' => $validated['activity_type'],
                'activity_date' => $validated['activity_date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'total_hours' => $validated['total_hours'],
                'location_name' => $validated['location_name'] ?? $activity->location_name,
                'latitude' => $validated['latitude'] ?? $activity->latitude,
                'longitude' => $validated['longitude'] ?? $activity->longitude,
                'radius_limit' => $validated['radius_limit'] ?? $activity->radius_limit,
                'qr_refresh_interval' => $validated['qr_refresh_interval'] ?? $activity->qr_refresh_interval,
                'status' => $validated['status'] ?? $activity->status,
                'max_participants' => $validated['max_participants'] ?? $activity->max_participants,
                'description' => $validated['description'] ?? $activity->description,
            ]);

            // อัปเดตกลุ่มเป้าหมายหากมีการส่งมา
            if (isset($validated['target_groups'])) {
                $activity->targetGroups()->delete();
                foreach ($validated['target_groups'] as $group) {
                    $activity->targetGroups()->create([
                        'target_type' => $group['target_type'],
                        'target_value' => $group['target_value'] ?? null,
                        'required' => $group['required'] ?? true,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('activities.show', $activity->id)
                ->with('success', 'ปรับปรุงข้อมูลกิจกรรมสำเร็จเรียบร้อย');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'เกิดข้อผิดพลาดในการอัปเดตกิจกรรม: ' . $e->getMessage());
        }
    }

    /**
     * ลบกิจกรรม (เฉพาะกิจกรรมที่ยังไม่มีการเช็กอินเข้าร่วม)
     */
    public function destroy($id)
    {
        $activity = Activity::findOrFail($id);

        $attendedCount = $activity->registrations()->whereNotNull('check_in_time')->count();
        if ($attendedCount > 0) {
            return back()->with('error', 'ไม่สามารถลบกิจกรรมนี้ได้ เนื่องจากมีนักศึกษาเช็กอินเข้าร่วมกิจกรรมแล้ว');
        }

        $activity->delete();

        return redirect()->route('activities.index')
            ->with('success', "ลบกิจกรรม '{$activity->activity_name}' สำเร็จแล้ว");
    }

    /**
     * หน้า Live Screen สำหรับเปิดขึ้นจอโปรเจกเตอร์ในงาน
     * แสดง Dynamic QR Code หมุนเวียน + จำนวนผู้เช็กอินแบบ Real-time
     */
    public function liveScreen($id)
    {
        $activity = Activity::with(['targetGroups'])->findOrFail($id);
        $activity->ensureQrToken();

        $token = self::generateDynamicQrToken($activity);

        $registrations = ActivityRegistration::with(['user.studentProfile'])
            ->where('activity_id', $activity->id)
            ->whereNotNull('check_in_time')
            ->orderBy('check_in_time', 'desc')
            ->limit(20)
            ->get();

        $totalCheckedIn = ActivityRegistration::where('activity_id', $activity->id)
            ->whereNotNull('check_in_time')
            ->count();

        return Inertia::render('activities/live', [
            'activity' => $activity,
            'currentQrToken' => $token,
            'recentCheckins' => $registrations,
            'totalCheckedIn' => $totalCheckedIn,
        ]);
    }

    /**
     * API ดึง Dynamic QR Token ปัจจุบัน (สำหรับ Refresh ทุก 20-30 วินาที)
     */
    public function getDynamicQrToken($id)
    {
        $activity = Activity::findOrFail($id);
        $activity->ensureQrToken();

        $interval = max(15, (int) ($activity->qr_refresh_interval ?: 60));
        $token = self::generateDynamicQrToken($activity);
        $secondsRemaining = $interval - (time() % $interval);

        return response()->json([
            'qr_token' => $token,
            'interval' => $interval,
            'expires_in_seconds' => $secondsRemaining,
            'checked_in_count' => ActivityRegistration::where('activity_id', $activity->id)
                ->whereNotNull('check_in_time')
                ->count(),
        ]);
    }

    /**
     * นำเข้ารายชื่อนักศึกษาเป็นกลุ่มเป้าหมายหรือลงทะเบียนล่วงหน้า
     */
    public function importTargetStudents(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        $request->validate([
            'student_codes' => 'required|string', // รับเป็นรหัสนักศึกษา คั่นด้วย comma หรือขึ้นบรรทัดใหม่
            'required' => 'boolean',
        ]);

        $rawCodes = preg_split('/[\r\n,]+/', $request->student_codes);
        $codes = array_values(array_filter(array_map('trim', $rawCodes)));

        if (empty($codes)) {
            return back()->with('error', 'ไม่พบรหัสนักศึกษาที่ถูกต้อง');
        }

        $isRequired = $request->boolean('required', true);
        $addedCount = 0;

        foreach ($codes as $code) {
            // ค้นหานักศึกษาจาก student_profiles หรือ users
            $profile = StudentProfile::where('student_code', $code)->first();
            $userId = $profile?->user_id;

            if (!$userId) {
                $user = User::where('name', 'like', "%{$code}%")
                    ->orWhere('email', 'like', "{$code}%")
                    ->first();
                $userId = $user?->id;
            }

            if ($userId) {
                // บันทึกใน target_groups
                $activity->targetGroups()->firstOrCreate([
                    'target_type' => 'STUDENT_ID',
                    'target_value' => $code,
                ], [
                    'required' => $isRequired,
                ]);

                // สร้าง record ใน activity_registrations
                ActivityRegistration::firstOrCreate([
                    'activity_id' => $activity->id,
                    'user_id' => $userId,
                ], [
                    'student_code' => $code,
                    'registration_status' => 'registered',
                    'registered_at' => now(),
                ]);

                $addedCount++;
            }
        }

        return back()->with('success', "นำเข้ารหัสนักศึกษาจำนวน {$addedCount} คน สำเร็จเรียบร้อย");
    }

    /**
     * อาจารย์ปรับแก้สถานะและชั่วโมงด้วยตนเอง (Admin Override)
     */
    public function overrideAttendance(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        $validated = $request->validate([
            'registration_id' => 'required|exists:activity_registrations,id',
            'attendance_type' => 'required|in:full,partial,none',
            'actual_hours' => 'required|numeric|min:0|max:100',
            'check_in_time' => 'nullable|date',
            'check_out_time' => 'nullable|date',
            'override_reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $registration = ActivityRegistration::where('activity_id', $activity->id)
            ->findOrFail($validated['registration_id']);

        $registration->update([
            'attendance_type' => $validated['attendance_type'],
            'actual_hours' => $validated['actual_hours'],
            'registration_status' => $validated['attendance_type'] !== 'none' ? 'attended' : 'absent',
            'check_in_time' => $validated['check_in_time'] ? Carbon::parse($validated['check_in_time']) : $registration->check_in_time,
            'check_out_time' => $validated['check_out_time'] ? Carbon::parse($validated['check_out_time']) : $registration->check_out_time,
            'admin_override' => true,
            'override_by' => $request->user()->id,
            'override_reason' => $validated['override_reason'],
            'notes' => $validated['notes'] ?? $registration->notes,
        ]);

        return back()->with('success', 'บันทึกการปรับแก้ข้อมูลการเข้าร่วมสำเร็จ');
    }

    /**
     * ส่งออกไฟล์รายงานการเข้าร่วมกิจกรรม (CSV / Excel)
     */
    public function exportAttendance($id)
    {
        $activity = Activity::with(['registrations.user.studentProfile'])->findOrFail($id);

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"attendance_{$activity->activity_code}_{$activity->activity_date->format('Ymd')}.csv\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($activity) {
            $handle = fopen('php://output', 'w');
            // ใส่ BOM UTF-8 ให้เปิดใน Excel ภาษาไทยได้ไม่เพี้ยน
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, ['รหัสกิจกรรม', $activity->activity_code, 'ชื่อกิจกรรม', $activity->activity_name]);
            fputcsv($handle, ['วันที่จัด', $activity->activity_date->format('d/m/Y'), 'เวลา', "{$activity->start_time} - {$activity->end_time}", 'ชั่วโมงที่กำหนด', $activity->total_hours]);
            fputcsv($handle, []);

            // หัวตาราง
            fputcsv($handle, [
                'ลำดับ',
                'รหัสนักศึกษา',
                'ชื่อ - นามสกุล',
                'คณะ / วิทยาลัย',
                'สาขาวิชา',
                'ชั้นปี',
                'สถานะ',
                'เวลาเช็กอิน',
                'เวลาเช็กเอาต์',
                'วิธีเช็กอิน',
                'ระยะห่าง (เมตร)',
                'ชั่วโมงที่ได้รับจริง',
                'ผลการเข้าร่วม',
                'อาจารย์ปรับแก้',
                'เหตุผลการปรับแก้',
            ]);

            $index = 1;
            foreach ($activity->registrations as $reg) {
                $profile = $reg->user?->studentProfile;
                $studentName = $profile ? "{$profile->title_prefix}{$profile->first_name_th} {$profile->last_name_th}" : ($reg->user?->name ?? '-');

                $statusMap = [
                    'registered' => 'ลงทะเบียนแล้ว',
                    'attended' => 'เข้าร่วมแล้ว',
                    'absent' => 'ขาด',
                ];

                $attendanceTypeMap = [
                    'full' => 'เต็มเวลา',
                    'partial' => 'ไม่เต็มเวลา',
                    'none' => 'ไม่ผ่าน',
                ];

                fputcsv($handle, [
                    $index++,
                    $profile?->student_code ?? $reg->student_code ?? '-',
                    $studentName,
                    $profile?->faculty ?? '-',
                    $profile?->major ?? '-',
                    $profile?->class_year ?? '-',
                    $statusMap[$reg->registration_status] ?? $reg->registration_status,
                    $reg->check_in_time ? $reg->check_in_time->format('d/m/Y H:i:s') : '-',
                    $reg->check_out_time ? $reg->check_out_time->format('d/m/Y H:i:s') : '-',
                    $reg->check_in_method ?? '-',
                    $reg->check_in_distance ? number_format($reg->check_in_distance, 1) : '-',
                    number_format($reg->actual_hours, 1),
                    $attendanceTypeMap[$reg->attendance_type] ?? $reg->attendance_type,
                    $reg->admin_override ? 'ใช่' : 'ไม่ใช่',
                    $reg->override_reason ?? '-',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * หน้าคู่มือการใช้งานระบบกิจกรรมสำหรับอาจารย์และผู้ดูแลระบบ
     */
    public function guide()
    {
        return Inertia::render('activities/guide');
    }
}
