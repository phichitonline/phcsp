<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Curriculum;
use App\Models\StudentCourseGrade;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CreditTrackingController extends Controller
{
    /**
     * Helper: คำนวณสรุปหน่วยกิตและ GPA ของนักศึกษาคนหนึ่ง
     */
    private function calculateStudentCreditSummary(User $user, ?Curriculum $curriculum = null): array
    {
        if (!$curriculum) {
            $curriculum = Curriculum::where('is_active', true)->first()
                ?? Curriculum::first();
        }

        $totalRequired = $curriculum ? $curriculum->total_credits : 36;
        $coreRequired = $curriculum ? $curriculum->core_credits_required : 15;
        $electiveRequired = $curriculum ? $curriculum->elective_credits_required : 9;
        $thesisRequired = $curriculum ? $curriculum->thesis_credits_required : 12;

        // ดึงเกรดทั้งหมดของนักศึกษาคนนี้ พร้อมข้อมูลวิชา
        $grades = StudentCourseGrade::with('course')
            ->where('user_id', $user->id)
            ->get();

        $coreEarned = 0;
        $electiveEarned = 0;
        $thesisEarned = 0;
        $totalEarned = 0;

        $totalGradePoints = 0.0;
        $totalGradedCredits = 0;
        $hasIncompleteOrAtRisk = false;

        foreach ($grades as $grade) {
            $course = $grade->course;
            if (!$course) continue;

            $credits = $course->credits;

            // ตรวจสอบสถานะผ่าน (นับหน่วยกิต)
            if ($grade->is_passed) {
                $totalEarned += $credits;

                if ($course->category === 'core') {
                    $coreEarned += $credits;
                } elseif ($course->category === 'elective') {
                    $electiveEarned += $credits;
                } elseif ($course->category === 'thesis') {
                    $thesisEarned += $credits;
                }
            }

            // คำนวณ GPA (เฉพาะเกรดที่มีแต้มคะแนน เช่น A - F, ไม่นับ S/U/W/I)
            if ($grade->grade_point !== null && $grade->grade && !in_array(strtoupper($grade->grade), ['S', 'U', 'W', 'I', 'IP'])) {
                $totalGradePoints += ($grade->grade_point * $credits);
                $totalGradedCredits += $credits;
            }

            if (in_array(strtoupper($grade->grade ?? ''), ['U', 'I', 'F'])) {
                $hasIncompleteOrAtRisk = true;
            }
        }

        $gpa = $totalGradedCredits > 0
            ? round($totalGradePoints / $totalGradedCredits, 2)
            : ($user->studentProfile?->gpa ? (float)$user->studentProfile->gpa : 0.00);

        $progressPercent = $totalRequired > 0
            ? min(100.0, round(($totalEarned / $totalRequired) * 100, 1))
            : 0.0;

        $corePercent = $coreRequired > 0 ? min(100.0, round(($coreEarned / $coreRequired) * 100, 1)) : 0.0;
        $electivePercent = $electiveRequired > 0 ? min(100.0, round(($electiveEarned / $electiveRequired) * 100, 1)) : 0.0;
        $thesisPercent = $thesisRequired > 0 ? min(100.0, round(($thesisEarned / $thesisRequired) * 100, 1)) : 0.0;

        return [
            'total_required' => $totalRequired,
            'total_earned' => $totalEarned,
            'progress_percent' => $progressPercent,
            'core_required' => $coreRequired,
            'core_earned' => $coreEarned,
            'core_percent' => $corePercent,
            'elective_required' => $electiveRequired,
            'elective_earned' => $electiveEarned,
            'elective_percent' => $electivePercent,
            'thesis_required' => $thesisRequired,
            'thesis_earned' => $thesisEarned,
            'thesis_percent' => $thesisPercent,
            'gpa' => $gpa,
            'has_risk' => $hasIncompleteOrAtRisk,
            'is_completed' => $totalEarned >= $totalRequired && $gpa >= ($curriculum->min_gpa_graduate ?? 3.00),
            'grades_count' => $grades->count(),
        ];
    }

    /**
     * หน้าแดชบอร์ดภาพรวมหน่วยกิตของนักศึกษาทั้งรุ่น/ทุกชั้นปี (Cohort Overview)
     */
    public function overview(Request $request)
    {
        $currentUser = auth()->user();
        $isAdmin = $currentUser && $currentUser->role === 'admin';

        $curriculum = Curriculum::with('courses')->where('is_active', true)->first()
            ?? Curriculum::with('courses')->first();

        // รายการปีการศึกษาที่มีในระบบ
        $academicYears = StudentProfile::select('academic_year')
            ->whereNotNull('academic_year')
            ->distinct()
            ->orderBy('academic_year', 'desc')
            ->pluck('academic_year')
            ->toArray();

        if (empty($academicYears)) {
            $academicYears = ['2567', '2566'];
        }

        // ดึงนักศึกษาทั้งหมด
        $studentsQuery = User::with([
            'studentProfile',
            'courseGrades.course',
        ])
        ->where(function ($q) {
            $q->where('role', '!=', 'admin')
              ->orWhereHas('studentProfile');
        });

        // Filter ตามปีการศึกษา
        if ($request->filled('academic_year') && $request->academic_year !== 'all') {
            $studentsQuery->whereHas('studentProfile', function ($q) use ($request) {
                $q->where('academic_year', $request->academic_year);
            });
        }

        // Filter ตามคำค้นหา
        if ($request->filled('search')) {
            $search = trim($request->search);
            $studentsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('studentProfile', function ($sq) use ($search) {
                      $sq->where('student_code', 'like', "%{$search}%")
                        ->orWhere('first_name_th', 'like', "%{$search}%")
                        ->orWhere('last_name_th', 'like', "%{$search}%")
                        ->orWhere('major', 'like', "%{$search}%");
                  });
            });
        }

        $allStudents = $studentsQuery->orderBy('id', 'asc')->get();

        // คำนวณสถิติและหน่วยกิตของแต่ละคน
        $studentsList = [];
        $totalStudents = 0;
        $completedStudents = 0;
        $inProgressStudents = 0;
        $atRiskStudents = 0;
        $sumProgressPercent = 0;

        foreach ($allStudents as $student) {
            $summary = $this->calculateStudentCreditSummary($student, $curriculum);

            // Filter ตามสถานะหน่วยกิต
            if ($request->filled('credit_status')) {
                if ($request->credit_status === 'completed' && !$summary['is_completed']) continue;
                if ($request->credit_status === 'in_progress' && ($summary['is_completed'] || $summary['total_earned'] == 0)) continue;
                if ($request->credit_status === 'at_risk' && !$summary['has_risk']) continue;
            }

            $totalStudents++;
            $sumProgressPercent += $summary['progress_percent'];

            if ($summary['is_completed']) {
                $completedStudents++;
            } elseif ($summary['total_earned'] > 0) {
                $inProgressStudents++;
            }

            if ($summary['has_risk']) {
                $atRiskStudents++;
            }

            $studentsList[] = [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'student_profile' => $student->studentProfile,
                'credit_summary' => $summary,
            ];
        }

        $avgProgress = $totalStudents > 0 ? round($sumProgressPercent / $totalStudents, 1) : 0;

        return Inertia::render('credits/index', [
            'curriculum' => $curriculum,
            'academic_years' => $academicYears,
            'selected_year' => $request->academic_year ?? 'all',
            'search' => $request->search ?? '',
            'credit_status' => $request->credit_status ?? 'all',
            'students' => $studentsList,
            'stats' => [
                'total_students' => $totalStudents,
                'completed_students' => $completedStudents,
                'in_progress_students' => $inProgressStudents,
                'at_risk_students' => $atRiskStudents,
                'avg_progress' => $avgProgress,
            ],
            'is_admin' => $isAdmin,
        ]);
    }

    /**
     * หน้ารายงานสรุปผลหน่วยกิตรายบุคคล (Individual Student Credit Audit)
     */
    public function studentCredit(Request $request, $id = null)
    {
        $currentUser = auth()->user();
        $isAdmin = $currentUser && $currentUser->role === 'admin';

        $targetUserId = $id ? (int)$id : $currentUser->id;

        // หากไม่ใช่ admin จะดูได้เฉพาะของตัวเอง
        if (!$isAdmin && $currentUser->id !== $targetUserId) {
            abort(403, 'คุณไม่มีสิทธิ์ดูข้อมูลหน่วยกิตของนักศึกษาท่านอื่น');
        }

        $student = User::with('studentProfile')->findOrFail($targetUserId);

        $curriculum = Curriculum::with('courses')->where('is_active', true)->first()
            ?? Curriculum::with('courses')->first();

        $allCourses = $curriculum ? $curriculum->courses : Course::where('is_active', true)->get();

        // ดึงผลการเรียนทั้งหมดของนักศึกษา
        $grades = StudentCourseGrade::with('course')
            ->where('user_id', $targetUserId)
            ->orderBy('academic_year', 'asc')
            ->orderBy('semester', 'asc')
            ->get();

        $gradesMap = [];
        foreach ($grades as $g) {
            $gradesMap[$g->course_id] = $g;
        }

        // คำนวณสรุปภาพรวม
        $summary = $this->calculateStudentCreditSummary($student, $curriculum);

        // จัดกลุ่มวิชาตามหมวดหมู่
        $categorizedCourses = [
            'core' => [
                'title' => 'หมวดวิชาบังคับ',
                'description' => 'ต้องศึกษารายวิชาบังคับให้ครบถ้วนตามเกณฑ์หลักสูตร',
                'required_credits' => $curriculum ? $curriculum->core_credits_required : 15,
                'earned_credits' => $summary['core_earned'],
                'percent' => $summary['core_percent'],
                'courses' => [],
            ],
            'elective' => [
                'title' => 'หมวดวิชาเลือก',
                'description' => 'เลือกศึกษาตามแผนการเรียนที่หลักสูตรกำหนด',
                'required_credits' => $curriculum ? $curriculum->elective_credits_required : 9,
                'earned_credits' => $summary['elective_earned'],
                'percent' => $summary['elective_percent'],
                'courses' => [],
            ],
            'thesis' => [
                'title' => 'หมวดวิทยานิพนธ์ / การค้นคว้าอิสระ',
                'description' => 'ทำวิทยานิพนธ์และสอบผ่านตามเกณฑ์มาตรฐานบัณฑิตศึกษา',
                'required_credits' => $curriculum ? $curriculum->thesis_credits_required : 12,
                'earned_credits' => $summary['thesis_earned'],
                'percent' => $summary['thesis_percent'],
                'courses' => [],
            ],
        ];

        foreach ($allCourses as $c) {
            $catKey = in_array($c->category, ['core', 'elective', 'thesis']) ? $c->category : 'core';
            $gradeRecord = $gradesMap[$c->id] ?? null;

            $categorizedCourses[$catKey]['courses'][] = [
                'id' => $c->id,
                'course_code' => $c->course_code,
                'course_name_th' => $c->course_name_th,
                'course_name_en' => $c->course_name_en,
                'credits' => $c->credits,
                'year_suggested' => $c->year_suggested,
                'term_suggested' => $c->term_suggested,
                'grade' => $gradeRecord ? $gradeRecord->grade : null,
                'grade_point' => $gradeRecord ? $gradeRecord->grade_point : null,
                'is_passed' => $gradeRecord ? $gradeRecord->is_passed : false,
                'academic_year' => $gradeRecord ? $gradeRecord->academic_year : null,
                'semester' => $gradeRecord ? $gradeRecord->semester : null,
                'remark' => $gradeRecord ? $gradeRecord->remark : null,
            ];
        }

        // จัดกลุ่มตามภาคการศึกษา (Semesters Breakdown)
        $semesters = [];
        $groupedGrades = $grades->groupBy(fn($g) => $g->academic_year . '-' . $g->semester);

        foreach ($groupedGrades as $key => $items) {
            $first = $items->first();
            $termCredits = 0;
            $termPassedCredits = 0;
            $termPoints = 0.0;
            $termGradedCredits = 0;

            foreach ($items as $it) {
                $cr = $it->course ? $it->course->credits : 0;
                $termCredits += $cr;
                if ($it->is_passed) {
                    $termPassedCredits += $cr;
                }
                if ($it->grade_point !== null && !in_array(strtoupper($it->grade ?? ''), ['S', 'U', 'W', 'I', 'IP'])) {
                    $termPoints += ($it->grade_point * $cr);
                    $termGradedCredits += $cr;
                }
            }

            $termGpa = $termGradedCredits > 0 ? round($termPoints / $termGradedCredits, 2) : 0.00;

            $semesters[] = [
                'key' => $key,
                'academic_year' => $first->academic_year,
                'semester' => $first->semester,
                'term_credits' => $termCredits,
                'term_passed_credits' => $termPassedCredits,
                'term_gpa' => $termGpa,
                'items' => $items,
            ];
        }

        return Inertia::render('credits/student-credit', [
            'student' => $student,
            'curriculum' => $curriculum,
            'summary' => $summary,
            'categorized_courses' => $categorizedCourses,
            'semesters' => $semesters,
            'is_admin' => $isAdmin,
        ]);
    }

    /**
     * หน้ากรอกและจัดการหน่วยกิต (Grade Entry Form)
     */
    public function gradeEntry(Request $request)
    {
        $currentUser = auth()->user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบและอาจารย์ผู้สอนเท่านั้นที่สามารถเข้าถึงหน้านี้ได้');
        }

        $curriculum = Curriculum::with('courses')->where('is_active', true)->first()
            ?? Curriculum::with('courses')->first();

        $students = User::with('studentProfile')
            ->where(function ($q) {
                $q->where('role', '!=', 'admin')
                  ->orWhereHas('studentProfile');
            })
            ->orderBy('id', 'asc')
            ->get();

        $courses = $curriculum ? $curriculum->courses : Course::where('is_active', true)->get();

        // รายการปีการศึกษา
        $academicYears = StudentProfile::select('academic_year')
            ->whereNotNull('academic_year')
            ->distinct()
            ->orderBy('academic_year', 'desc')
            ->pluck('academic_year')
            ->toArray();

        if (empty($academicYears)) {
            $academicYears = ['2567', '2566', '2565'];
        }

        // หากมีการเลือกนักศึกษาคนใดคนหนึ่ง ให้โหลดเกรดของนักศึกษาคนนั้น
        $selectedStudentId = $request->student_id ? (int)$request->student_id : null;
        $studentGrades = [];
        if ($selectedStudentId) {
            $studentGrades = StudentCourseGrade::where('user_id', $selectedStudentId)->get()->keyBy('course_id');
        }

        // หากเลือกโหมดตามรายวิชา
        $selectedCourseId = $request->course_id ? (int)$request->course_id : null;
        $courseGrades = [];
        if ($selectedCourseId) {
            $q = StudentCourseGrade::where('course_id', $selectedCourseId);
            if ($request->filled('academic_year')) {
                $q->where('academic_year', $request->academic_year);
            }
            if ($request->filled('semester')) {
                $q->where('semester', (int)$request->semester);
            }
            $courseGrades = $q->get()->keyBy('user_id');
        }

        return Inertia::render('credits/grade-entry', [
            'curriculum' => $curriculum,
            'students' => $students,
            'courses' => $courses,
            'academic_years' => $academicYears,
            'selected_student_id' => $selectedStudentId,
            'selected_course_id' => $selectedCourseId,
            'selected_year' => $request->academic_year ?? ($academicYears[0] ?? '2567'),
            'selected_semester' => (int)($request->semester ?? 1),
            'student_grades' => $studentGrades,
            'course_grades' => $courseGrades,
            'mode' => $request->mode ?? 'by_student', // by_student หรือ by_course
        ]);
    }

    /**
     * บันทึกผลการเรียนรายบุคคล (Save Single Student Grades)
     */
    public function saveStudentGrades(Request $request)
    {
        $currentUser = auth()->user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบเท่านั้น');
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'grades' => 'required|array',
            'grades.*.course_id' => 'required|exists:courses,id',
            'grades.*.grade' => 'nullable|string',
            'grades.*.academic_year' => 'nullable|string',
            'grades.*.semester' => 'nullable|integer|min:1|max:3',
        ]);

        $student = User::with('studentProfile')->findOrFail($request->user_id);
        $studentProfileId = $student->studentProfile?->id;

        DB::transaction(function () use ($request, $student, $studentProfileId, $currentUser) {
            foreach ($request->grades as $item) {
                $courseId = $item['course_id'];
                $gradeStr = isset($item['grade']) ? strtoupper(trim($item['grade'])) : null;
                $academicYear = $item['academic_year'] ?? ($student->studentProfile?->academic_year ?? '2567');
                $semester = isset($item['semester']) ? (int)$item['semester'] : 1;

                if (empty($gradeStr)) {
                    // หากเว้นว่าง ให้ลบรายการเกรดออกหากมีอยู่เดิม
                    StudentCourseGrade::where('user_id', $student->id)
                        ->where('course_id', $courseId)
                        ->delete();
                    continue;
                }

                $eval = StudentCourseGrade::evaluateGrade($gradeStr);

                StudentCourseGrade::updateOrCreate(
                    [
                        'user_id' => $student->id,
                        'course_id' => $courseId,
                    ],
                    [
                        'student_profile_id' => $studentProfileId,
                        'academic_year' => $academicYear,
                        'semester' => $semester,
                        'grade' => $gradeStr,
                        'grade_point' => $eval['point'],
                        'is_passed' => $eval['passed'],
                        'recorded_by_user_id' => $currentUser->id,
                        'remark' => $item['remark'] ?? null,
                    ]
                );
            }

            // คำนวณ GPA สะสมใหม่ และอัปเดตลง student_profiles
            $summary = $this->calculateStudentCreditSummary($student);
            if ($student->studentProfile) {
                $student->studentProfile->update([
                    'gpa' => $summary['gpa'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'บันทึกผลการเรียนของนักศึกษาเรียบร้อยแล้ว');
    }

    /**
     * บันทึกผลการเรียนรายวิชาแบบกลุ่ม (Batch Grade Save for a Course)
     */
    public function saveBatchGrades(Request $request)
    {
        $currentUser = auth()->user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบเท่านั้น');
        }

        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'academic_year' => 'required|string',
            'semester' => 'required|integer|min:1|max:3',
            'grades' => 'required|array',
            'grades.*.user_id' => 'required|exists:users,id',
            'grades.*.grade' => 'nullable|string',
        ]);

        $courseId = $request->course_id;
        $academicYear = $request->academic_year;
        $semester = (int)$request->semester;

        DB::transaction(function () use ($request, $courseId, $academicYear, $semester, $currentUser) {
            foreach ($request->grades as $item) {
                $userId = $item['user_id'];
                $gradeStr = isset($item['grade']) ? strtoupper(trim($item['grade'])) : null;

                if (empty($gradeStr)) {
                    StudentCourseGrade::where('user_id', $userId)
                        ->where('course_id', $courseId)
                        ->where('academic_year', $academicYear)
                        ->where('semester', $semester)
                        ->delete();
                    continue;
                }

                $student = User::with('studentProfile')->find($userId);
                $eval = StudentCourseGrade::evaluateGrade($gradeStr);

                StudentCourseGrade::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'course_id' => $courseId,
                        'academic_year' => $academicYear,
                        'semester' => $semester,
                    ],
                    [
                        'student_profile_id' => $student?->studentProfile?->id,
                        'grade' => $gradeStr,
                        'grade_point' => $eval['point'],
                        'is_passed' => $eval['passed'],
                        'recorded_by_user_id' => $currentUser->id,
                        'remark' => $item['remark'] ?? null,
                    ]
                );

                // ปรับปรุง GPA ใน student_profiles
                if ($student) {
                    $summary = $this->calculateStudentCreditSummary($student);
                    if ($student->studentProfile) {
                        $student->studentProfile->update(['gpa' => $summary['gpa']]);
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'บันทึกเกรดนักศึกษาแบบกลุ่มประจำวิชานี้เรียบร้อยแล้ว');
    }

    /**
     * หน้าจัดการหลักสูตรและรายวิชา (Curriculum Management)
     */
    public function curriculumIndex(Request $request)
    {
        $curriculums = Curriculum::with(['courses' => function ($q) {
            $q->orderBy('order_no', 'asc')->orderBy('course_code', 'asc');
        }])->get();

        return Inertia::render('credits/curriculum', [
            'curriculums' => $curriculums,
            'is_admin' => auth()->user()?->role === 'admin',
        ]);
    }

    /**
     * เพิ่มหรือแก้ไขรายวิชาในหลักสูตร
     */
    public function storeCourse(Request $request)
    {
        $request->validate([
            'curriculum_id' => 'required|exists:curriculums,id',
            'course_code' => 'required|string|max:50',
            'course_name_th' => 'required|string|max:255',
            'course_name_en' => 'nullable|string|max:255',
            'credits' => 'required|integer|min:1|max:20',
            'category' => 'required|in:core,elective,thesis,remedial',
            'year_suggested' => 'required|integer|min:1|max:4',
            'term_suggested' => 'required|integer|min:1|max:3',
        ]);

        Course::updateOrCreate(
            ['id' => $request->id],
            [
                'curriculum_id' => $request->curriculum_id,
                'course_code' => strtoupper(trim($request->course_code)),
                'course_name_th' => trim($request->course_name_th),
                'course_name_en' => $request->course_name_en ? trim($request->course_name_en) : null,
                'credits' => (int)$request->credits,
                'category' => $request->category,
                'year_suggested' => (int)$request->year_suggested,
                'term_suggested' => (int)$request->term_suggested,
                'is_active' => $request->boolean('is_active', true),
                'order_no' => (int)($request->order_no ?? 1),
            ]
        );

        return redirect()->back()->with('success', 'บันทึกข้อมูลรายวิชาเรียบร้อยแล้ว');
    }

    /**
     * ลบรายวิชา
     */
    public function destroyCourse($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return redirect()->back()->with('success', 'ลบรายวิชาเรียบร้อยแล้ว');
    }

    /**
     * เพิ่มหรือแก้ไขหลักสูตร / สาขาวิชา
     */
    public function storeCurriculum(Request $request)
    {
        $currentUser = auth()->user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบเท่านั้น');
        }

        $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'degree_level' => 'required|string|max:50',
            'total_credits' => 'required|integer|min:1',
            'core_credits_required' => 'required|integer|min:0',
            'elective_credits_required' => 'required|integer|min:0',
            'thesis_credits_required' => 'required|integer|min:0',
            'min_gpa_graduate' => 'required|numeric|between:0,4.00',
            'academic_year_start' => 'nullable|string|max:10',
            'description' => 'nullable|string|max:1000',
        ]);

        Curriculum::updateOrCreate(
            ['id' => $request->id],
            [
                'code' => strtoupper(trim($request->code)),
                'name' => trim($request->name),
                'degree_level' => $request->degree_level,
                'total_credits' => (int)$request->total_credits,
                'core_credits_required' => (int)$request->core_credits_required,
                'elective_credits_required' => (int)$request->elective_credits_required,
                'thesis_credits_required' => (int)$request->thesis_credits_required,
                'min_gpa_graduate' => (float)$request->min_gpa_graduate,
                'academic_year_start' => $request->academic_year_start ? trim($request->academic_year_start) : null,
                'description' => $request->description ? trim($request->description) : null,
                'is_active' => $request->boolean('is_active', true),
            ]
        );

        return redirect()->back()->with('success', 'บันทึกข้อมูลหลักสูตร / สาขาวิชาเรียบร้อยแล้ว');
    }

    /**
     * ลบหลักสูตร / สาขาวิชา
     */
    public function destroyCurriculum($id)
    {
        $currentUser = auth()->user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบเท่านั้น');
        }

        $curriculum = Curriculum::withCount('courses')->findOrFail($id);
        if ($curriculum->courses_count > 0) {
            return redirect()->back()->with('error', 'ไม่สามารถลบได้ เนื่องจากมีรายวิชาผูกอยู่กับหลักสูตรนี้ (' . $curriculum->courses_count . ' วิชา)');
        }

        $curriculum->delete();

        return redirect()->back()->with('success', 'ลบหลักสูตรเรียบร้อยแล้ว');
    }
}
