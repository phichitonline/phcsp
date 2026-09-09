<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Curriculum;
use App\Models\StudentCourseGrade;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class CurriculumAndCourseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. สร้างข้อมูลหลักสูตร ป.โท วสส.สุพรรณบุรี
        $curriculum = Curriculum::firstOrCreate(
            ['code' => 'MPH-2566'],
            [
                'name' => 'หลักสูตรสาธารณสุขศาสตรมหาบัณฑิต (ส.ม.)',
                'degree_level' => 'master',
                'total_credits' => 36,
                'core_credits_required' => 15,
                'elective_credits_required' => 9,
                'thesis_credits_required' => 12,
                'min_gpa_graduate' => 3.00,
                'academic_year_start' => '2566',
                'description' => 'หลักสูตรระดับปริญญาโท วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี แผน ก แบบ ก 2 (ศึกษารายวิชาและทำวิทยานิพนธ์ รวม 36 หน่วยกิต)',
                'is_active' => true,
            ]
        );

        // 2. รายการวิชาในหลักสูตร
        $coursesData = [
            // หมวดวิชาบังคับ (Core Courses - 15 หน่วยกิต)
            [
                'course_code' => 'MPH601',
                'course_name_th' => 'วิทยาการระบาดประยุกต์และชีวสถิติ',
                'course_name_en' => 'Applied Epidemiology and Biostatistics',
                'credits' => 3,
                'lecture_hours' => 3,
                'lab_hours' => 0,
                'self_study_hours' => 6,
                'category' => 'core',
                'year_suggested' => 1,
                'term_suggested' => 1,
                'order_no' => 1,
            ],
            [
                'course_code' => 'MPH602',
                'course_name_th' => 'นโยบายสุขภาพ การวางแผน และการประเมินผล',
                'course_name_en' => 'Health Policy, Planning and Evaluation',
                'credits' => 3,
                'lecture_hours' => 3,
                'lab_hours' => 0,
                'self_study_hours' => 6,
                'category' => 'core',
                'year_suggested' => 1,
                'term_suggested' => 1,
                'order_no' => 2,
            ],
            [
                'course_code' => 'MPH603',
                'course_name_th' => 'การบริหารจัดการระบบสุขภาพและภาวะผู้นำ',
                'course_name_en' => 'Health Systems Management and Leadership',
                'credits' => 3,
                'lecture_hours' => 3,
                'lab_hours' => 0,
                'self_study_hours' => 6,
                'category' => 'core',
                'year_suggested' => 1,
                'term_suggested' => 1,
                'order_no' => 3,
            ],
            [
                'course_code' => 'MPH604',
                'course_name_th' => 'ระเบียบวิธีวิจัยทางสาธารณสุข',
                'course_name_en' => 'Research Methodology in Public Health',
                'credits' => 3,
                'lecture_hours' => 3,
                'lab_hours' => 0,
                'self_study_hours' => 6,
                'category' => 'core',
                'year_suggested' => 1,
                'term_suggested' => 2,
                'order_no' => 4,
            ],
            [
                'course_code' => 'MPH605',
                'course_name_th' => 'สัมมนาประเด็นสำคัญทางสาธารณสุข',
                'course_name_en' => 'Seminar on Current Issues in Public Health',
                'credits' => 3,
                'lecture_hours' => 3,
                'lab_hours' => 0,
                'self_study_hours' => 6,
                'category' => 'core',
                'year_suggested' => 1,
                'term_suggested' => 2,
                'order_no' => 5,
            ],

            // หมวดวิชาเลือก (Elective Courses - เลือก 9 หน่วยกิต)
            [
                'course_code' => 'MPH621',
                'course_name_th' => 'การสร้างเสริมสุขภาพและการจัดการปัจจัยเสี่ยง',
                'course_name_en' => 'Health Promotion and Risk Factor Management',
                'credits' => 3,
                'lecture_hours' => 3,
                'lab_hours' => 0,
                'self_study_hours' => 6,
                'category' => 'elective',
                'year_suggested' => 1,
                'term_suggested' => 2,
                'order_no' => 6,
            ],
            [
                'course_code' => 'MPH622',
                'course_name_th' => 'อนามัยสิ่งแวดล้อมและอาชีวอนามัยขั้นสูง',
                'course_name_en' => 'Advanced Environmental and Occupational Health',
                'credits' => 3,
                'lecture_hours' => 3,
                'lab_hours' => 0,
                'self_study_hours' => 6,
                'category' => 'elective',
                'year_suggested' => 1,
                'term_suggested' => 2,
                'order_no' => 7,
            ],
            [
                'course_code' => 'MPH623',
                'course_name_th' => 'การจัดการสุขภาพชุมชนและปฐมภูมิ',
                'course_name_en' => 'Community and Primary Healthcare Management',
                'credits' => 3,
                'lecture_hours' => 3,
                'lab_hours' => 0,
                'self_study_hours' => 6,
                'category' => 'elective',
                'year_suggested' => 2,
                'term_suggested' => 1,
                'order_no' => 8,
            ],
            [
                'course_code' => 'MPH624',
                'course_name_th' => 'การประเมินผลกระทบทางสุขภาพ',
                'course_name_en' => 'Health Impact Assessment (HIA)',
                'credits' => 3,
                'lecture_hours' => 3,
                'lab_hours' => 0,
                'self_study_hours' => 6,
                'category' => 'elective',
                'year_suggested' => 2,
                'term_suggested' => 1,
                'order_no' => 9,
            ],
            [
                'course_code' => 'MPH625',
                'course_name_th' => 'นวัตกรรมและเทคโนโลยีดิจิทัลทางสุขภาพ',
                'course_name_en' => 'Digital Health Innovations and Technology',
                'credits' => 3,
                'lecture_hours' => 3,
                'lab_hours' => 0,
                'self_study_hours' => 6,
                'category' => 'elective',
                'year_suggested' => 2,
                'term_suggested' => 1,
                'order_no' => 10,
            ],

            // หมวดวิทยานิพนธ์ (Thesis - 12 หน่วยกิต)
            [
                'course_code' => 'MPH701',
                'course_name_th' => 'วิทยานิพนธ์ 1 (โครงร่างวิทยานิพนธ์)',
                'course_name_en' => 'Thesis 1: Thesis Proposal',
                'credits' => 3,
                'lecture_hours' => 0,
                'lab_hours' => 0,
                'self_study_hours' => 12,
                'category' => 'thesis',
                'year_suggested' => 2,
                'term_suggested' => 1,
                'order_no' => 11,
            ],
            [
                'course_code' => 'MPH702',
                'course_name_th' => 'วิทยานิพนธ์ 2 (การดำเนินการวิจัยและรวบรวมข้อมูล)',
                'course_name_en' => 'Thesis 2: Research Execution and Data Collection',
                'credits' => 3,
                'lecture_hours' => 0,
                'lab_hours' => 0,
                'self_study_hours' => 12,
                'category' => 'thesis',
                'year_suggested' => 2,
                'term_suggested' => 1,
                'order_no' => 12,
            ],
            [
                'course_code' => 'MPH703',
                'course_name_th' => 'วิทยานิพนธ์ 3 (การวิเคราะห์ผลและการสอบวิทยานิพนธ์)',
                'course_name_en' => 'Thesis 3: Data Analysis and Thesis Defense',
                'credits' => 6,
                'lecture_hours' => 0,
                'lab_hours' => 0,
                'self_study_hours' => 24,
                'category' => 'thesis',
                'year_suggested' => 2,
                'term_suggested' => 2,
                'order_no' => 13,
            ],
        ];

        foreach ($coursesData as $course) {
            Course::updateOrCreate(
                [
                    'curriculum_id' => $curriculum->id,
                    'course_code' => $course['course_code'],
                ],
                $course
            );
        }

        // 3. สร้างเกรดตัวอย่างให้นักศึกษา User 1004 (น.ส.กัลยารัตน์)
        $student1 = User::with('studentProfile')->find(1004);
        if ($student1) {
            $courses = Course::where('curriculum_id', $curriculum->id)->get()->keyBy('course_code');

            $sampleGrades = [
                // ปีการศึกษา 2566 เทอม 1 (วิชาบังคับ 3 วิชา)
                ['code' => 'MPH601', 'year' => '2566', 'semester' => 1, 'grade' => 'A'],
                ['code' => 'MPH602', 'year' => '2566', 'semester' => 1, 'grade' => 'B+'],
                ['code' => 'MPH603', 'year' => '2566', 'semester' => 1, 'grade' => 'A'],

                // ปีการศึกษา 2566 เทอม 2 (วิชาบังคับ 2 วิชา + วิชาเลือก 1 วิชา)
                ['code' => 'MPH604', 'year' => '2566', 'semester' => 2, 'grade' => 'A'],
                ['code' => 'MPH605', 'year' => '2566', 'semester' => 2, 'grade' => 'B+'],
                ['code' => 'MPH621', 'year' => '2566', 'semester' => 2, 'grade' => 'A'],

                // ปีการศึกษา 2567 เทอม 1 (วิชาเลือก 2 วิชา + วิทยานิพนธ์ 1)
                ['code' => 'MPH623', 'year' => '2567', 'semester' => 1, 'grade' => 'B+'],
                ['code' => 'MPH625', 'year' => '2567', 'semester' => 1, 'grade' => 'A'],
                ['code' => 'MPH701', 'year' => '2567', 'semester' => 1, 'grade' => 'S'],
            ];

            foreach ($sampleGrades as $item) {
                if (isset($courses[$item['code']])) {
                    $c = $courses[$item['code']];
                    $eval = StudentCourseGrade::evaluateGrade($item['grade']);

                    StudentCourseGrade::updateOrCreate(
                        [
                            'user_id' => $student1->id,
                            'course_id' => $c->id,
                            'academic_year' => $item['year'],
                            'semester' => $item['semester'],
                        ],
                        [
                            'student_profile_id' => $student1->studentProfile?->id,
                            'grade' => $item['grade'],
                            'grade_point' => $eval['point'],
                            'is_passed' => $eval['passed'],
                            'remark' => 'ลงทะเบียนตามแผน',
                        ]
                    );
                }
            }
        }

        // 4. สร้างเกรดตัวอย่างให้นักศึกษา User 1005 (นายทดสอบ)
        $student2 = User::with('studentProfile')->find(1005);
        if ($student2) {
            $courses = Course::where('curriculum_id', $curriculum->id)->get()->keyBy('course_code');

            $sampleGrades2 = [
                ['code' => 'MPH601', 'year' => '2567', 'semester' => 1, 'grade' => 'B'],
                ['code' => 'MPH602', 'year' => '2567', 'semester' => 1, 'grade' => 'C+'],
                ['code' => 'MPH603', 'year' => '2567', 'semester' => 1, 'grade' => 'B+'],
            ];

            foreach ($sampleGrades2 as $item) {
                if (isset($courses[$item['code']])) {
                    $c = $courses[$item['code']];
                    $eval = StudentCourseGrade::evaluateGrade($item['grade']);

                    StudentCourseGrade::updateOrCreate(
                        [
                            'user_id' => $student2->id,
                            'course_id' => $c->id,
                            'academic_year' => $item['year'],
                            'semester' => $item['semester'],
                        ],
                        [
                            'student_profile_id' => $student2->studentProfile?->id,
                            'grade' => $item['grade'],
                            'grade_point' => $eval['point'],
                            'is_passed' => $eval['passed'],
                            'remark' => 'ลงทะเบียนตามแผน',
                        ]
                    );
                }
            }
        }
    }
}
