<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use App\Models\Curriculum;
use App\Models\Course;
use App\Models\StudentProfile;
use App\Models\StudentCourseGrade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display the authenticated user's profile.
     */
    public function profile()
    {
        $user = auth()->user()->load('department');
        return Inertia::render('users/profile', [
            'user' => $user
        ]);
    }

    /**
     * Update the authenticated user's avatar.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = auth()->user();

        // ลบรูปเก่าถ้ามี
        if ($user->avatar && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->avatar)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
        }

        // อัปโหลดรูปใหม่
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = $path;
        $user->save();

        return redirect()->back()->with('success', 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }
        $users = User::with(['department', 'studentProfile'])->orderBy('name')->get();
        return Inertia::render('users/index', [
            'users' => $users
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }
        $departments = Department::active()->orderBy('dp_name')->get();
        $curriculums = Curriculum::with(['courses' => function ($q) {
            $q->where('is_active', true)->orderBy('order_no', 'asc')->orderBy('course_code', 'asc');
        }])->where('is_active', true)->orderBy('code', 'asc')->get();

        return Inertia::render('users/create', [
            'departments' => $departments,
            'curriculums' => $curriculums,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:admin,head,user,guest',
            'department_id' => 'nullable|exists:departments,id',
            'curriculum_id' => 'nullable|exists:curriculums,id',
            'student_code' => 'nullable|string|max:50',
            'academic_year' => 'nullable|string|max:10',
            'class_year' => 'nullable|string|max:50',
            'is_active' => 'required|boolean',
        ]);

        // หากไม่ได้เลือกประเภท ให้ค่าเริ่มต้นเป็น "อาจารย์"
        $departmentId = $request->department_id;
        if (empty($departmentId)) {
            $defaultDept = Department::where('dp_name', 'like', '%อาจารย์%')->first();
            if ($defaultDept) {
                $departmentId = $defaultDept->id;
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'department_id' => $departmentId,
            'is_active' => $request->is_active,
        ]);

        // หากเลือกประเภทเป็น "นักศึกษา" ให้สร้างข้อมูลลงในทะเบียนนักศึกษา (StudentProfile)
        // พร้อมดึงรายวิชาในหลักสูตรมาลงทะเบียนให้อัตโนมัติ
        if ($departmentId) {
            $department = Department::find($departmentId);
            if ($department && trim($department->dp_name) === 'นักศึกษา') {
                $curriculum = null;
                if ($request->filled('curriculum_id')) {
                    $curriculum = Curriculum::with('courses')->find($request->curriculum_id);
                }
                if (!$curriculum) {
                    $curriculum = Curriculum::with('courses')->where('is_active', true)->first();
                }

                $academicYear = $request->filled('academic_year')
                    ? trim($request->academic_year)
                    : ($curriculum?->academic_year_start ?? '2570');

                $classYear = $request->filled('class_year')
                    ? trim($request->class_year)
                    : 'ชั้นปีที่ 1';

                $major = $curriculum ? $curriculum->name : 'สาธารณสุขศาสตรมหาบัณฑิต';

                $studentCode = $request->filled('student_code')
                    ? trim($request->student_code)
                    : ('68' . str_pad($user->id, 5, '0', STR_PAD_LEFT) . '1');

                $nameParts = explode(' ', trim($request->name), 2);
                $firstName = $nameParts[0] ?? $request->name;
                $lastName = $nameParts[1] ?? '';

                // ตัดคำนำหน้าถ้ามี
                $titlePrefix = 'นาย';
                if (str_starts_with($firstName, 'นางสาว') || str_starts_with($firstName, 'น.ส.')) {
                    $titlePrefix = 'นางสาว';
                } elseif (str_starts_with($firstName, 'นาง')) {
                    $titlePrefix = 'นาง';
                } elseif (str_starts_with($firstName, 'นาย')) {
                    $titlePrefix = 'นาย';
                }

                $profile = StudentProfile::create([
                    'user_id' => $user->id,
                    'student_code' => $studentCode,
                    'national_id' => $user->pid ?? null,
                    'title_prefix' => $titlePrefix,
                    'first_name_th' => $firstName,
                    'last_name_th' => $lastName,
                    'gender' => in_array($titlePrefix, ['นางสาว', 'นาง']) ? 'หญิง' : 'ชาย',
                    'faculty' => 'วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี',
                    'major' => $major,
                    'curriculum_id' => $curriculum?->id,
                    'academic_year' => $academicYear,
                    'class_year' => $classYear,
                    'student_status' => 'กำลังศึกษา',
                ]);

                // ดึงรายวิชาในหลักสูตรมาลงทะเบียนให้นักศึกษาใหม่อัตโนมัติ
                if ($curriculum && $curriculum->courses->isNotEmpty()) {
                    foreach ($curriculum->courses as $course) {
                        StudentCourseGrade::firstOrCreate(
                            [
                                'user_id' => $user->id,
                                'course_id' => $course->id,
                                'academic_year' => $academicYear,
                                'semester' => $course->term_suggested ?? 1,
                            ],
                            [
                                'student_profile_id' => $profile->id,
                                'grade' => null,
                                'grade_point' => null,
                                'is_passed' => false,
                                'recorded_by_user_id' => auth()->id() ?? 1,
                                'remark' => 'ลงทะเบียนตามโครงสร้างหลักสูตร (' . $curriculum->code . ')',
                            ]
                        );
                    }
                }
            }
        }

        return redirect()->route('users.index')->with('success', 'เพิ่มผู้ใช้สำเร็จ' . (isset($profile) ? ' พร้อมสร้างทะเบียนนักศึกษาและลงทะเบียนวิชาในหลักสูตรเรียบร้อยแล้ว' : ''));
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::findOrFail($id);
        
        // อนุญาตถ้าเป็น Admin หรือ แก้ไขตัวเอง
        if (auth()->user()->role !== 'admin' && auth()->id() !== $user->id) {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้อื่น');
        }

        $departments = Department::active()->orderBy('dp_name')->get();
        return Inertia::render('users/edit', [
            'user' => $user,
            'departments' => $departments
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $currentUser = auth()->user();

        // อนุญาตถ้าเป็น Admin หรือ แก้ไขตัวเอง
        if ($currentUser->role !== 'admin' && $currentUser->id !== $user->id) {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้อื่น');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|in:admin,head,user,guest',
            'department_id' => 'nullable|exists:departments,id',
            'password' => 'nullable|string|min:8|confirmed',
            'is_active' => 'required|boolean',
        ]);

        $data = [
            'name' => $request->name,
        ];

        // ถ้าไม่ใช่ Admin จะเปลี่ยน Role, Department, is_active ไม่ได้ แต่เปลี่ยน Email ได้
        if ($currentUser->role === 'admin') {
            $data['email'] = $request->email;
            $data['role'] = $request->role;
            $data['department_id'] = $request->department_id;
            $data['is_active'] = $request->is_active;
        } else {
            // อนุญาตให้แก้ไข Email ของตัวเองได้
            $data['email'] = $request->email;
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        // หาก Admin อัปเดตประเภทเป็น "นักศึกษา" ให้สร้าง StudentProfile หากยังไม่มี
        if ($currentUser->role === 'admin' && $request->department_id) {
            $department = Department::find($request->department_id);
            if ($department && trim($department->dp_name) === 'นักศึกษา') {
                $nameParts = explode(' ', trim($request->name), 2);
                $firstName = $nameParts[0] ?? $request->name;
                $lastName = $nameParts[1] ?? '';

                $titlePrefix = 'นาย';
                if (str_starts_with($firstName, 'นางสาว') || str_starts_with($firstName, 'น.ส.')) {
                    $titlePrefix = 'นางสาว';
                } elseif (str_starts_with($firstName, 'นาง')) {
                    $titlePrefix = 'นาง';
                } elseif (str_starts_with($firstName, 'นาย')) {
                    $titlePrefix = 'นาย';
                }

                \App\Models\StudentProfile::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'student_code' => '68' . str_pad($user->id, 5, '0', STR_PAD_LEFT) . '1',
                        'national_id' => $user->pid ?? null,
                        'title_prefix' => $titlePrefix,
                        'first_name_th' => $firstName,
                        'last_name_th' => $lastName,
                        'gender' => in_array($titlePrefix, ['นางสาว', 'นาง']) ? 'หญิง' : 'ชาย',
                        'faculty' => 'วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี',
                        'major' => 'สาธารณสุขศาสตรมหาบัณฑิต',
                        'academic_year' => '2568',
                        'class_year' => 'ชั้นปีที่ 1',
                        'student_status' => 'กำลังศึกษา',
                    ]
                );
            }
        }

        if ($currentUser->role === 'admin') {
            return redirect()->route('users.index')->with('success', 'แก้ไขข้อมูลผู้ใช้สำเร็จ');
        } else {
            return redirect()->route('dashboard')->with('success', 'แก้ไขข้อมูลส่วนตัวสำเร็จ');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        $user = User::findOrFail($id);
        
        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')->with('error', 'ไม่สามารถลบตัวเองได้');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'ลบผู้ใช้สำเร็จ');
    }
}
