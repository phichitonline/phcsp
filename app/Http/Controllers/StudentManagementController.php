<?php

namespace App\Http\Controllers;

use App\Models\Curriculum;
use App\Models\PersonalDocument;
use App\Models\StandardDocument;
use App\Models\StudentProfile;
use App\Models\ThesisCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentManagementController extends Controller
{
    /**
     * Display listing of students for admin management.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงหน้านี้ได้');
        }

        // ดึงรายการเอกสารมาตรฐานทั้งหมดที่ active
        $standardDocuments = StandardDocument::with('thesisCategory')
            ->where('is_active', true)
            ->orderBy('item_no', 'asc')
            ->get();
        $totalStandardDocsCount = $standardDocuments->count();

        $thesisCategories = ThesisCategory::orderBy('category_no', 'asc')->get();

        // ดึงเฉพาะผู้ใช้งานที่มีประเภท (Department) เป็น "นักศึกษา" เท่านั้น
        $usersQuery = User::with([
            'studentProfile',
            'department',
            'personalDocuments' => function ($q) {
                $q->orderBy('item_no', 'asc');
            },
        ])
        ->whereHas('department', function ($q) {
            $q->where('dp_name', 'นักศึกษา');
        })
        ->orderBy('id', 'asc');

        // ค้นหาตามคำค้น (Search)
        if ($request->filled('search')) {
            $search = trim($request->search);
            $usersQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('pid', 'like', "%{$search}%")
                  ->orWhereHas('studentProfile', function ($sq) use ($search) {
                      $sq->where('student_code', 'like', "%{$search}%")
                        ->orWhere('first_name_th', 'like', "%{$search}%")
                        ->orWhere('last_name_th', 'like', "%{$search}%")
                        ->orWhere('national_id', 'like', "%{$search}%")
                        ->orWhere('major', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        $allUsers = $usersQuery->get();

        // คำนวณสถานะและข้อมูลของนักศึกษาแต่ละคน
        $students = $allUsers->map(function ($user) use ($totalStandardDocsCount, $standardDocuments, $thesisCategories) {
            $profile = $user->studentProfile;

            // หากยังไม่มี student profile ให้สร้าง object ชั่วคราวเพื่อให้ UI นำไปแสดงผลได้
            if (!$profile) {
                $nameParts = explode(' ', $user->name, 2);
                $profile = new StudentProfile([
                    'user_id' => $user->id,
                    'student_code' => '66' . str_pad($user->id, 5, '0', STR_PAD_LEFT) . '1',
                    'national_id' => $user->pid,
                    'title_prefix' => 'นาย',
                    'first_name_th' => $nameParts[0] ?? $user->name,
                    'last_name_th' => $nameParts[1] ?? '',
                    'faculty' => 'วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี',
                    'major' => 'สาธารณสุขศาสตรบัณฑิต',
                    'class_year' => 'ชั้นปีที่ 2',
                    'academic_year' => '2567',
                    'student_status' => 'กำลังศึกษา',
                ]);
            }

            // คำนวณความสมบูรณ์ของทะเบียนประวัติ (Completeness %)
            $essentialFields = [
                'student_code', 'national_id', 'first_name_th', 'last_name_th',
                'phone', 'faculty', 'major', 'academic_year', 'class_year',
                'advisor_name', 'address', 'emergency_contact_name', 'emergency_phone'
            ];
            $filledCount = 0;
            foreach ($essentialFields as $field) {
                if (!empty($profile->{$field})) {
                    $filledCount++;
                }
            }
            $profileCompleteness = round(($filledCount / count($essentialFields)) * 100);

            // ตรวจสอบว่าเคยมีการอัปเดตทะเบียนประวัติหรือไม่
            $isProfileUpdated = $profile->exists && (
                $profile->updated_at != $profile->created_at ||
                $profileCompleteness >= 60 ||
                !empty($profile->phone) ||
                !empty($profile->address)
            );

            // คำนวณสถานะเอกสาร
            $uploadedDocs = $user->personalDocuments;
            $uploadedItemNos = $uploadedDocs->pluck('item_no')->filter()->toArray();
            $uploadedCount = count($uploadedItemNos);

            $docProgressPercent = $totalStandardDocsCount > 0
                ? round(($uploadedCount / $totalStandardDocsCount) * 100)
                : 0;

            $isDocsCompleted = $totalStandardDocsCount > 0 && $uploadedCount >= $totalStandardDocsCount;

            // ตรวจสอบหมวดปัจจุบันที่นักศึกษากำลังดำเนินการ
            $currentCategoryName = 'หมวดที่ 1: การแต่งตั้งคณะกรรมการที่ปรึกษา';
            if ($uploadedCount > 0) {
                // หาหมวดแรกที่ยังอัปโหลดไม่ครบ
                foreach ($thesisCategories as $cat) {
                    $catDocItemNos = $standardDocuments->where('thesis_category_id', $cat->id)->pluck('item_no')->toArray();
                    $catUploadedCount = count(array_intersect($catDocItemNos, $uploadedItemNos));
                    if ($catUploadedCount < count($catDocItemNos)) {
                        $currentCategoryName = "หมวดที่ {$cat->category_no}: {$cat->name}";
                        break;
                    }
                }
                if ($isDocsCompleted) {
                    $currentCategoryName = 'อัปโหลดครบทุกหมวดแล้ว';
                }
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ? (str_starts_with($user->avatar, 'http') ? $user->avatar : Storage::url($user->avatar)) : null,
                'role' => $user->role,
                'created_at' => $user->created_at ? $user->created_at->toISOString() : null,
                'profile' => [
                    'id' => $profile->id ?? null,
                    'user_id' => $user->id,
                    'student_code' => $profile->student_code ?? '',
                    'national_id' => $profile->national_id ?? $user->pid,
                    'title_prefix' => $profile->title_prefix ?? '',
                    'first_name_th' => $profile->first_name_th ?? '',
                    'last_name_th' => $profile->last_name_th ?? '',
                    'first_name_en' => $profile->first_name_en ?? '',
                    'last_name_en' => $profile->last_name_en ?? '',
                    'full_name_th' => $profile->full_name_th ?? $user->name,
                    'gender' => $profile->gender ?? '',
                    'birth_date' => $profile->birth_date ? $profile->birth_date->format('Y-m-d') : '',
                    'blood_group' => $profile->blood_group ?? '',
                    'religion' => $profile->religion ?? '',
                    'phone' => $profile->phone ?? '',
                    'line_id' => $profile->line_id ?? '',
                    'faculty' => $profile->faculty ?? '',
                    'major' => $profile->major ?? '',
                    'academic_year' => $profile->academic_year ?? '',
                    'class_year' => $profile->class_year ?? '',
                    'advisor_name' => $profile->advisor_name ?? '',
                    'student_status' => $profile->student_status ?? 'กำลังศึกษา',
                    'gpa' => $profile->gpa ?? null,
                    'practicum_hospital' => $profile->practicum_hospital ?? '',
                    'address' => $profile->address ?? '',
                    'current_address' => $profile->current_address ?? '',
                    'emergency_contact_name' => $profile->emergency_contact_name ?? '',
                    'emergency_relationship' => $profile->emergency_relationship ?? '',
                    'emergency_phone' => $profile->emergency_phone ?? '',
                    'health_conditions' => $profile->health_conditions ?? '',
                    'avatar_path' => $profile->avatar_path ? Storage::url($profile->avatar_path) : null,
                    'updated_at' => $profile->updated_at ? $profile->updated_at->toISOString() : null,
                ],
                'profile_status' => [
                    'is_updated' => $isProfileUpdated,
                    'completeness' => $profileCompleteness,
                    'last_updated' => $profile->updated_at ? $profile->updated_at->diffForHumans() : null,
                ],
                'document_status' => [
                    'uploaded_count' => $uploadedCount,
                    'total_count' => $totalStandardDocsCount,
                    'progress_percent' => $docProgressPercent,
                    'is_completed' => $isDocsCompleted,
                    'current_category' => $currentCategoryName,
                    'uploaded_item_nos' => $uploadedItemNos,
                ],
                'personal_documents' => $uploadedDocs->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'item_no' => $doc->item_no,
                        'title' => $doc->title,
                        'file_name' => $doc->file_name,
                        'file_size' => $doc->file_size,
                        'created_at' => $doc->created_at ? $doc->created_at->toISOString() : null,
                        'view_url' => route('personal-documents.view', $doc->id),
                        'download_url' => route('personal-documents.download', $doc->id),
                    ];
                }),
            ];
        });

        // คำนวณสถิติภาพรวม
        $totalStudents = $students->count();
        $profilesUpdatedCount = $students->where('profile_status.is_updated', true)->count();
        $docsCompletedCount = $students->where('document_status.is_completed', true)->count();
        $docsInProgressCount = $students->filter(function ($s) {
            return $s['document_status']['uploaded_count'] > 0 && !$s['document_status']['is_completed'];
        })->count();

        return Inertia::render('admin/students/index', [
            'students' => $students->values(),
            'standard_documents' => $standardDocuments,
            'thesis_categories' => $thesisCategories,
            'curriculums' => Curriculum::where('is_active', true)->orderBy('id', 'asc')->get(),
            'stats' => [
                'total_students' => $totalStudents,
                'profiles_updated' => $profilesUpdatedCount,
                'documents_completed' => $docsCompletedCount,
                'documents_in_progress' => $docsInProgressCount,
            ],
            'filters' => [
                'search' => $request->search ?? '',
                'profile_status' => $request->profile_status ?? 'all',
                'doc_status' => $request->doc_status ?? 'all',
                'class_year' => $request->class_year ?? 'all',
            ],
        ]);
    }

    /**
     * Admin quick update student profile.
     */
    public function updateProfile(Request $request, $id)
    {
        $currentUser = auth()->user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            abort(403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'student_code' => 'nullable|string|max:50',
            'national_id' => 'nullable|string|max:20',
            'title_prefix' => 'nullable|string|max:20',
            'first_name_th' => 'required|string|max:100',
            'last_name_th' => 'required|string|max:100',
            'first_name_en' => 'nullable|string|max:100',
            'last_name_en' => 'nullable|string|max:100',
            'gender' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'blood_group' => 'nullable|string|max:10',
            'religion' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:30',
            'line_id' => 'nullable|string|max:50',
            'faculty' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'academic_year' => 'nullable|string|max:10',
            'class_year' => 'nullable|string|max:50',
            'advisor_name' => 'nullable|string|max:150',
            'student_status' => 'nullable|string|max:50',
            'gpa' => 'nullable|numeric|between:0,4.00',
            'practicum_hospital' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'current_address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:150',
            'emergency_relationship' => 'nullable|string|max:50',
            'emergency_phone' => 'nullable|string|max:30',
            'health_conditions' => 'nullable|string|max:500',
        ], [
            'first_name_th.required' => 'กรุณาระบุชื่อภาษาไทย',
            'last_name_th.required' => 'กรุณาระบุนามสกุลภาษาไทย',
        ]);

        $profile = StudentProfile::firstOrNew(['user_id' => $user->id]);
        $profile->fill($request->all());
        $profile->user_id = $user->id;
        $profile->save();

        // อัปเดตชื่อในตาราง User ด้วยเพื่อความสอดคล้อง
        $fullName = trim("{$request->title_prefix}{$request->first_name_th} {$request->last_name_th}");
        if (!empty($fullName)) {
            $user->update(['name' => $fullName]);
        }

        return redirect()->back()->with('success', 'บันทึกการแก้ไขทะเบียนประวัตินักศึกษาเรียบร้อยแล้ว');
    }
}
