<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityRegistration;
use App\Models\ActivityTargetGroup;
use App\Models\StudentProfile;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentActivityController extends Controller
{
    /**
     * หน้าแรกของนักศึกษา: Dashboard กิจกรรมที่ต้องเข้าร่วม และกิจกรรมเปิดรับสมัคร
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $profile = $user->studentProfile;

        // ดึงกิจกรรมทั้งหมดที่เปิดใช้งาน
        $activities = Activity::with(['targetGroups'])
            ->whereIn('status', ['published', 'ongoing'])
            ->orderBy('activity_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        // ดึงประวัติการลงทะเบียนของนักศึกษาคนนี้
        $userRegistrations = ActivityRegistration::where('user_id', $user->id)
            ->get()
            ->keyBy('activity_id');

        $mandatoryActivities = [];
        $electiveActivities = [];

        foreach ($activities as $act) {
            $isTargeted = false;
            $isRequired = ($act->activity_type === 'mandatory');

            // ตรวจสอบ target groups
            foreach ($act->targetGroups as $tg) {
                if ($tg->target_type === 'ALL') {
                    $isTargeted = true;
                    if ($tg->required) $isRequired = true;
                } elseif ($tg->target_type === 'FACULTY' && $profile && $profile->faculty === $tg->target_value) {
                    $isTargeted = true;
                    if ($tg->required) $isRequired = true;
                } elseif ($tg->target_type === 'MAJOR' && $profile && $profile->major === $tg->target_value) {
                    $isTargeted = true;
                    if ($tg->required) $isRequired = true;
                } elseif ($tg->target_type === 'CLASS_YEAR' && $profile && $profile->class_year === $tg->target_value) {
                    $isTargeted = true;
                    if ($tg->required) $isRequired = true;
                } elseif ($tg->target_type === 'STUDENT_ID' && $profile && $profile->student_code === $tg->target_value) {
                    $isTargeted = true;
                    if ($tg->required) $isRequired = true;
                }
            }

            // ถ้าเป็น mandatory ให้เป็น required เสมอ
            if ($act->activity_type === 'mandatory') {
                $isTargeted = true;
                $isRequired = true;
            }

            $registration = $userRegistrations->get($act->id);

            $activityData = [
                'id' => $act->id,
                'activity_code' => $act->activity_code,
                'activity_name' => $act->activity_name,
                'activity_type' => $act->activity_type,
                'activity_date' => $act->activity_date->format('Y-m-d'),
                'activity_date_th' => $act->activity_date->translatedFormat('d F Y'),
                'start_time' => $act->start_time,
                'end_time' => $act->end_time,
                'total_hours' => $act->total_hours,
                'location_name' => $act->location_name,
                'latitude' => $act->latitude,
                'longitude' => $act->longitude,
                'radius_limit' => $act->radius_limit,
                'description' => $act->description,
                'is_required' => $isRequired,
                'registration' => $registration ? [
                    'id' => $registration->id,
                    'status' => $registration->registration_status,
                    'check_in_time' => $registration->check_in_time ? $registration->check_in_time->format('d/m/Y H:i') : null,
                    'check_out_time' => $registration->check_out_time ? $registration->check_out_time->format('d/m/Y H:i') : null,
                    'actual_hours' => $registration->actual_hours,
                    'attendance_type' => $registration->attendance_type,
                ] : null,
            ];

            if ($isRequired) {
                $mandatoryActivities[] = $activityData;
            } else {
                $electiveActivities[] = $activityData;
            }
        }

        // คำนวณชั่วโมงสะสมรวมของปีการศึกษาปัจจุบัน
        $currentYearHours = ActivityRegistration::where('user_id', $user->id)
            ->whereHas('activity', function ($q) {
                $q->where('academic_year', 2569);
            })
            ->sum('actual_hours');

        $totalLifetimeHours = ActivityRegistration::where('user_id', $user->id)
            ->sum('actual_hours');

        return Inertia::render('student-activities/index', [
            'studentProfile' => $profile,
            'mandatoryActivities' => $mandatoryActivities,
            'electiveActivities' => $electiveActivities,
            'summary' => [
                'current_year_hours' => round($currentYearHours, 1),
                'total_lifetime_hours' => round($totalLifetimeHours, 1),
                'attended_activities_count' => ActivityRegistration::where('user_id', $user->id)->whereNotNull('check_in_time')->count(),
            ],
        ]);
    }

    /**
     * ลงทะเบียนกิจกรรมแบบสมัครใจ (สำหรับกิจกรรมเลือก)
     */
    public function register(Request $request, $id)
    {
        $user = $request->user();
        $activity = Activity::findOrFail($id);

        if ($activity->max_participants) {
            $currentCount = ActivityRegistration::where('activity_id', $activity->id)->count();
            if ($currentCount >= $activity->max_participants) {
                return back()->with('error', 'ขออภัย กิจกรรมนี้มีผู้ลงทะเบียนครบจำนวนแล้ว');
            }
        }

        ActivityRegistration::firstOrCreate([
            'activity_id' => $activity->id,
            'user_id' => $user->id,
        ], [
            'student_code' => $user->studentProfile?->student_code ?? '',
            'registration_status' => 'registered',
            'registered_at' => now(),
        ]);

        return back()->with('success', "ลงทะเบียนเข้าร่วมกิจกรรม '{$activity->activity_name}' สำเร็จ");
    }

    /**
     * หน้าแสดงแผนที่และระบบเช็กอิน/เช็กเอาต์
     */
    public function checkInView($id, Request $request)
    {
        $user = $request->user();
        $activity = Activity::findOrFail($id);

        $registration = ActivityRegistration::where('activity_id', $activity->id)
            ->where('user_id', $user->id)
            ->first();

        return Inertia::render('student-activities/check-in', [
            'activity' => $activity,
            'registration' => $registration,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'student_code' => $user->studentProfile?->student_code ?? '',
                'avatar' => $user->studentProfile?->avatar_path ?? $user->avatar,
                'thaid_linked' => !empty($user->thaid_id) || !empty($user->pid),
            ],
        ]);
    }

    /**
     * บันทึกการ Check-in (GPS + QR Token + ถ่ายรูป Selfie)
     */
    public function submitCheckIn(Request $request, $id)
    {
        $user = $request->user();
        $activity = Activity::findOrFail($id);

        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'qr_token' => 'required|string',
            'method' => 'required|in:QR,GPS,FACE,THAID',
            'photo' => 'nullable|string', // Base64 data URL
        ]);

        // 1. ตรวจสอบพิกัด GPS (Haversine Geofencing)
        if ($activity->latitude && $activity->longitude) {
            $distance = ActivityController::calculateDistance(
                (float) $validated['lat'],
                (float) $validated['lng'],
                (float) $activity->latitude,
                (float) $activity->longitude
            );

            if ($distance > $activity->radius_limit) {
                return back()->with('error', "คุณอยู่นอกพื้นที่จัดกิจกรรม (ห่างจากจุดจัดงาน {$distance} เมตร เกินรัศมีที่กำหนด {$activity->radius_limit} เมตร)");
            }
        } else {
            $distance = 0;
        }

        // 2. ตรวจสอบ Dynamic QR Token
        $isValidQr = ActivityController::verifyDynamicQrToken($activity, $validated['qr_token']);
        if (!$isValidQr) {
            return back()->with('error', 'รหัส QR Code ประจำงานไม่ถูกต้องหรือหมดอายุแล้ว กรุณาสแกนใหม่จากจอโปรเจกเตอร์');
        }

        // 3. บันทึกรูปถ่าย Selfie (ถ้ามี)
        $photoPath = null;
        if (!empty($validated['photo']) && str_starts_with($validated['photo'], 'data:image')) {
            try {
                $imageParts = explode(';base64,', $validated['photo']);
                if (count($imageParts) === 2) {
                    $imageData = base64_decode($imageParts[1]);
                    $fileName = 'checkins/' . $activity->id . '_' . $user->id . '_' . time() . '.jpg';
                    Storage::disk('public')->put($fileName, $imageData);
                    $photoPath = '/storage/' . $fileName;
                }
            } catch (\Exception $e) {
                // รูปไม่สมบูรณ์ บันทึกต่อได้
            }
        }

        // 4. บันทึก Check-in
        $registration = ActivityRegistration::updateOrCreate([
            'activity_id' => $activity->id,
            'user_id' => $user->id,
        ], [
            'student_code' => $user->studentProfile?->student_code ?? '',
            'registration_status' => 'attended',
            'check_in_time' => now(),
            'check_in_method' => $validated['method'],
            'check_in_lat' => $validated['lat'],
            'check_in_lng' => $validated['lng'],
            'check_in_distance' => $distance,
            'check_in_photo' => $photoPath,
            'actual_hours' => 0.0,
            'attendance_type' => 'none',
        ]);

        return redirect()->route('student.activities.checkin', $activity->id)
            ->with('success', "เช็กอินเข้าร่วมกิจกรรม '{$activity->activity_name}' สำเร็จเรียบร้อย!");
    }

    /**
     * บันทึกการ Check-out และคำนวณชั่วโมงอัตโนมัติ
     */
    public function submitCheckOut(Request $request, $id)
    {
        $user = $request->user();
        $activity = Activity::findOrFail($id);

        $registration = ActivityRegistration::where('activity_id', $activity->id)
            ->where('user_id', $user->id)
            ->whereNotNull('check_in_time')
            ->firstOrFail();

        $checkInTime = $registration->check_in_time;
        $checkOutTime = now();

        // คำนวณระยะเวลาเป็นนาที
        $durationMinutes = $checkInTime->diffInMinutes($checkOutTime);
        $durationHours = round($durationMinutes / 60, 1);

        // เวลาที่กำหนดไว้ในกิจกรรม (นาที) อนุโลม 15 นาที
        $requiredMinutes = ($activity->total_hours * 60) - 15;

        if ($durationMinutes >= $requiredMinutes) {
            $actualHours = $activity->total_hours;
            $attendanceType = 'full';
            $msg = "เช็กเอาต์สำเร็จ! คุณเข้าร่วมครบเต็มเวลา ได้รับ {$actualHours} ชั่วโมงกิจกรรม";
        } else {
            $actualHours = min($durationHours, $activity->total_hours);
            $attendanceType = 'partial';
            $msg = "เช็กเอาต์สำเร็จ! เข้าร่วมไม่เต็มเวลา คำนวณชั่วโมงตามจริงที่ {$actualHours} ชั่วโมง";
        }

        $registration->update([
            'check_out_time' => $checkOutTime,
            'actual_hours' => $actualHours,
            'attendance_type' => $attendanceType,
            'registration_status' => 'attended',
        ]);

        return redirect()->route('student.activities.checkin', $activity->id)
            ->with('success', $msg);
    }

    /**
     * หน้าประวัติการเข้าร่วมกิจกรรมและสรุปชั่วโมงสะสม
     */
    public function history(Request $request)
    {
        $user = $request->user();
        $profile = $user->studentProfile;

        $registrations = ActivityRegistration::with(['activity'])
            ->where('user_id', $user->id)
            ->whereNotNull('check_in_time')
            ->orderBy('check_in_time', 'desc')
            ->get();

        // รวมชั่วโมงตามปีการศึกษา
        $hoursByYear = [];
        foreach ($registrations as $reg) {
            $year = $reg->activity->academic_year ?? 2569;
            if (!isset($hoursByYear[$year])) {
                $hoursByYear[$year] = 0;
            }
            $hoursByYear[$year] += $reg->actual_hours;
        }

        return Inertia::render('student-activities/history', [
            'studentProfile' => $profile,
            'registrations' => $registrations,
            'hoursByYear' => $hoursByYear,
            'totalHours' => $registrations->sum('actual_hours'),
        ]);
    }

    /**
     * ใบรับรองชั่วโมงกิจกรรม (e-Certificate) สำหรับพิมพ์หรือบันทึกเป็น PDF
     */
    public function certificate($id, Request $request)
    {
        $user = $request->user();
        $registration = ActivityRegistration::with(['activity', 'user.studentProfile'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->where('attendance_type', '!=', 'none')
            ->firstOrFail();

        return Inertia::render('student-activities/certificate', [
            'registration' => $registration,
            'verifyUrl' => url("/verify/certificate/{$registration->id}"),
        ]);
    }

    /**
     * หน้าคู่มือการใช้งานระบบกิจกรรมสำหรับนักศึกษา
     */
    public function guide(Request $request)
    {
        return Inertia::render('student-activities/guide');
    }
}
