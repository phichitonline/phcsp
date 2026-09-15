<?php

namespace App\Http\Controllers;

use App\Models\Curriculum;
use App\Models\PersonalDocument;
use App\Models\StandardDocument;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentProfileController extends Controller
{
    /**
     * Display student profile and registry information.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $isStaff = $currentUser && $currentUser->isStaff();
        $isAdmin = $currentUser && $currentUser->isAdmin();

        // หากเป็น Admin หรือ อาจารย์ และไม่ได้ระบุ student user_id มา
        // ให้ switch ไปหน้ารายชื่อนักศึกษา เพื่อเลือกนักศึกษาที่ต้องการดูข้อมูล
        // และป้องกันไม่ให้สร้าง record student_profile สำหรับ admin/อาจารย์
        if ($isStaff && !$request->filled('user_id')) {
            return redirect()->route('admin.students.index', ['action' => 'profile'])
                ->with('info', 'สำหรับอาจารย์และผู้ดูแลระบบ กรุณาเลือกนักศึกษาจากรายชื่อเพื่อดูทะเบียนประวัติ');
        }

        // Target user: Staff can view any student's profile via ?user_id=X, otherwise student views own profile
        $targetUserId = ($isStaff && $request->filled('user_id'))
            ? $request->user_id
            : $currentUser->id;

        $targetUser = User::with('department')->find($targetUserId);
        if (!$targetUser) {
            if ($isStaff) {
                return redirect()->route('admin.students.index', ['action' => 'profile'])
                    ->with('error', 'ไม่พบข้อมูลนักศึกษาที่ระบุ');
            }
            $targetUser = $currentUser;
        }

        // หากผู้ใช้เป้าหมายไม่ใช่กลุ่มนักศึกษา และเป็น staff ไม่ควรมีทะเบียนประวัติ
        if ($targetUser->isStaff() && !$targetUser->studentProfile) {
            return redirect()->route('admin.students.index', ['action' => 'profile'])
                ->with('warning', 'ผู้ใช้ประเภทผู้ดูแลระบบและอาจารย์ไม่มีทะเบียนประวัตินักศึกษา');
        }

        // ค้นหาทะเบียนประวัตินักศึกษา หรือสร้างเฉพาะกรณีเป็นนักศึกษาจริงๆ เท่านั้น
        $profile = StudentProfile::where('user_id', $targetUser->id)->first();
        if (!$profile) {
            if ($targetUser->isStudent()) {
                $nameParts = explode(' ', trim($targetUser->name), 2);
                $firstName = $nameParts[0] ?? $targetUser->name;
                $lastName = $nameParts[1] ?? '';
                $titlePrefix = 'นาย';
                if (str_starts_with($firstName, 'นางสาว') || str_starts_with($firstName, 'น.ส.')) {
                    $titlePrefix = 'นางสาว';
                } elseif (str_starts_with($firstName, 'นาง')) {
                    $titlePrefix = 'นาง';
                }

                $profile = StudentProfile::create([
                    'user_id' => $targetUser->id,
                    'student_code' => '68' . str_pad($targetUser->id, 5, '0', STR_PAD_LEFT) . '1',
                    'national_id' => $targetUser->pid ?? '1729900' . str_pad($targetUser->id, 6, '0', STR_PAD_LEFT),
                    'title_prefix' => $titlePrefix,
                    'first_name_th' => $firstName,
                    'last_name_th' => $lastName,
                    'first_name_en' => 'Student',
                    'last_name_en' => 'Graduate',
                    'gender' => in_array($titlePrefix, ['นางสาว', 'นาง']) ? 'หญิง' : 'ชาย',
                    'birth_date' => '2004-05-15',
                    'blood_group' => 'B',
                    'religion' => 'พุทธ',
                    'ethnicity' => 'ไทย',
                    'nationality' => 'ไทย',
                    'phone' => '081-234-5678',
                    'line_id' => '',
                    'faculty' => 'วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี',
                    'major' => 'สาธารณสุขศาสตรมหาบัณฑิต',
                    'academic_year' => '2567',
                    'class_year' => 'ชั้นปีที่ 1',
                    'advisor_name' => 'ดร.สมศรี มีสุข',
                    'student_status' => 'กำลังศึกษา',
                    'gpa' => 3.50,
                    'practicum_hospital' => 'โรงพยาบาลศูนย์เจ้าพระยายมราช สุพรรณบุรี',
                    'address' => 'วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี',
                    'current_address' => 'หอพักนักศึกษา วสส.สุพรรณบุรี',
                    'emergency_contact_name' => '',
                    'emergency_relationship' => '',
                    'emergency_phone' => '',
                    'health_conditions' => 'ไม่มีโรคประจำตัว',
                ]);
            } else {
                return redirect()->route('admin.students.index', ['action' => 'profile'])
                    ->with('warning', 'ผู้ใช้งานรายนี้ไม่ใช่กลุ่มนักศึกษา จึงไม่มีทะเบียนประวัติ');
            }
        }

        // Get personal documents uploaded by this target user
        $personalDocs = PersonalDocument::where('user_id', $targetUser->id)
            ->orderBy('item_no', 'asc')
            ->get();

        // Get standard documents for checklist overview
        $standardDocs = StandardDocument::with('thesisCategory')
            ->where('is_active', true)
            ->orderBy('item_no', 'asc')
            ->get();

        // If staff, get list of all students for directory view / quick switch
        $allStudents = [];
        if ($isStaff) {
            $allStudents = StudentProfile::with('user:id,name,email,avatar,role')
                ->orderBy('student_code', 'asc')
                ->get();
        }

        $curriculums = Curriculum::where('is_active', true)->orderBy('id', 'asc')->get();

        return Inertia::render('student-profile/index', [
            'student_profile' => $profile,
            'profile_user' => $targetUser,
            'auth_user' => $currentUser,
            'is_admin' => $isStaff,
            'personal_documents' => $personalDocs,
            'standard_documents' => $standardDocs,
            'all_students' => $allStudents,
            'curriculums' => $curriculums,
        ]);
    }

    /**
     * Update student profile.
     */
    public function update(Request $request)
    {
        $currentUser = auth()->user();
        $isStaff = $currentUser && $currentUser->isStaff();

        $targetUserId = ($isStaff && $request->filled('user_id'))
            ? $request->user_id
            : $currentUser->id;

        if ($isStaff && !$request->filled('user_id')) {
            return redirect()->route('admin.students.index', ['action' => 'profile'])
                ->with('warning', 'กรุณาเลือกนักศึกษาเพื่อแก้ไขทะเบียนประวัติ');
        }

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
            'ethnicity' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:50',
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
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072', // 3MB image
        ], [
            'first_name_th.required' => 'กรุณาระบุชื่อภาษาไทย',
            'last_name_th.required' => 'กรุณาระบุนามสกุลภาษาไทย',
            'avatar.image' => 'ไฟล์รูปถ่ายต้องเป็นรูปภาพเท่านั้น',
            'avatar.max' => 'ขนาดรูปถ่ายต้องไม่เกิน 3 MB',
        ]);

        $profile = StudentProfile::firstOrNew(['user_id' => $targetUserId]);

        $data = $request->except(['avatar', 'user_id']);

        // Handle avatar upload if provided
        if ($request->hasFile('avatar')) {
            $avatarFile = $request->file('avatar');
            $avatarPath = $avatarFile->store('student-avatars', 'public');

            // Delete old avatar if exists
            if ($profile->avatar_path && Storage::disk('public')->exists($profile->avatar_path)) {
                Storage::disk('public')->delete($profile->avatar_path);
            }
            $data['avatar_path'] = $avatarPath;

            // Also sync to User avatar if updating own profile
            if ($targetUserId === $currentUser->id) {
                $currentUser->update(['avatar' => Storage::url($avatarPath)]);
            }
        }

        $profile->fill($data);
        $profile->user_id = $targetUserId;
        $profile->save();

        return redirect()->back()->with('success', 'บันทึกข้อมูลทะเบียนประวัตินักศึกษาเรียบร้อยแล้ว');
    }

    /**
     * Quick search/autocomplete or API for student records.
     */
    public function search(Request $request)
    {
        $q = $request->get('q', '');
        $students = StudentProfile::with('user:id,name,email,avatar')
            ->where(function ($query) use ($q) {
                $query->where('student_code', 'like', "%{$q}%")
                    ->orWhere('first_name_th', 'like', "%{$q}%")
                    ->orWhere('last_name_th', 'like', "%{$q}%")
                    ->orWhere('national_id', 'like', "%{$q}%")
                    ->orWhere('major', 'like', "%{$q}%");
            })
            ->limit(20)
            ->get();

        return response()->json($students);
    }
}
