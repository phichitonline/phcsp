import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';
import {
    Card,
    CardBody,
    Row,
    Col,
    Table,
    Button,
    Badge,
    Form,
    Nav,
    Spinner,
} from 'react-bootstrap';

interface CourseItem {
    id: number;
    course_code: string;
    course_name_th: string;
    course_name_en: string | null;
    credits: number;
    category: string;
    year_suggested: number;
    term_suggested: number | null;
}

interface StudentItem {
    id: number;
    name: string;
    email: string;
    student_profile: {
        id: number;
        student_code: string | null;
        full_name_th: string;
        major: string | null;
        academic_year: string | null;
    } | null;
}

interface GradeRecord {
    id: number;
    user_id: number;
    course_id: number;
    academic_year: string;
    semester: number;
    grade: string | null;
    grade_point: number | null;
    is_passed: boolean;
    remark: string | null;
}

interface Props {
    curriculum: {
        id: number;
        code: string;
        name: string;
        total_credits: number;
    } | null;
    students: StudentItem[];
    courses: CourseItem[];
    academic_years: string[];
    selected_student_id: number | null;
    selected_course_id: number | null;
    selected_year: string;
    selected_semester: number;
    student_grades: { [courseId: number]: GradeRecord };
    course_grades: { [userId: number]: GradeRecord };
    mode: 'by_student' | 'by_course';
}

const GRADE_OPTIONS = [
    { value: '', label: '-- ยังไม่ระบุ --' },
    { value: 'A', label: 'A (4.00) - ยอดเยี่ยม' },
    { value: 'B+', label: 'B+ (3.50) - ดีมาก' },
    { value: 'B', label: 'B (3.00) - ดี' },
    { value: 'C+', label: 'C+ (2.50) - ปานกลาง' },
    { value: 'C', label: 'C (2.00) - พอใช้' },
    { value: 'D+', label: 'D+ (1.50)' },
    { value: 'D', label: 'D (1.00)' },
    { value: 'F', label: 'F (0.00) - ไม่ผ่าน' },
    { value: 'S', label: 'S (Satisfactory) - ผ่านเกณฑ์' },
    { value: 'U', label: 'U (Unsatisfactory) - ไม่ผ่าน' },
    { value: 'P', label: 'P (Pass) - ผ่าน' },
    { value: 'I', label: 'I (Incomplete) - รอประเมิน' },
    { value: 'IP', label: 'IP (In Progress) - อยู่ระหว่างเรียน' },
    { value: 'W', label: 'W (Withdrawn) - ถอนรายวิชา' },
];

const GradeEntryPage: React.FC<Props> = ({
    curriculum,
    students,
    courses,
    academic_years,
    selected_student_id,
    selected_course_id,
    selected_year,
    selected_semester,
    student_grades,
    course_grades,
    mode: initialMode,
}) => {
    const [mode, setMode] = useState<'by_student' | 'by_course'>(initialMode);
    const [isSaving, setIsSaving] = useState(false);

    // State สำหรับโหมดกรอกรายบุคคล
    const [studentId, setStudentId] = useState<number | ''>(selected_student_id || (students[0]?.id ?? ''));
    const [formStudentGrades, setFormStudentGrades] = useState<{
        [courseId: number]: {
            grade: string;
            academic_year: string;
            semester: number;
            remark: string;
        };
    }>(() => {
        const initial: any = {};
        courses.forEach((c) => {
            const existing = student_grades[c.id];
            initial[c.id] = {
                grade: existing?.grade || '',
                academic_year: existing?.academic_year || selected_year,
                semester: existing?.semester || c.term_suggested || 1,
                remark: existing?.remark || '',
            };
        });
        return initial;
    });

    // State สำหรับโหมดกรอกตามรายวิชา
    const [courseId, setCourseId] = useState<number | ''>(selected_course_id || (courses[0]?.id ?? ''));
    const [courseYear, setCourseYear] = useState<string>(selected_year);
    const [courseSemester, setCourseSemester] = useState<number>(selected_semester);
    const [formCourseGrades, setFormCourseGrades] = useState<{
        [userId: number]: {
            grade: string;
            remark: string;
        };
    }>(() => {
        const initial: any = {};
        students.forEach((s) => {
            const existing = course_grades[s.id];
            initial[s.id] = {
                grade: existing?.grade || '',
                remark: existing?.remark || '',
            };
        });
        return initial;
    });

    // เมื่อเปลี่ยนเลือกนักศึกษาในโหมดรายบุคคล
    const handleStudentChange = (newStudentId: number) => {
        setStudentId(newStudentId);
        router.get(
            '/credits/entry',
            {
                mode: 'by_student',
                student_id: newStudentId,
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const loadedGrades: any = page.props.student_grades || {};
                    const newForm: any = {};
                    courses.forEach((c) => {
                        const existing = loadedGrades[c.id];
                        newForm[c.id] = {
                            grade: existing?.grade || '',
                            academic_year: existing?.academic_year || selected_year,
                            semester: existing?.semester || c.term_suggested || 1,
                            remark: existing?.remark || '',
                        };
                    });
                    setFormStudentGrades(newForm);
                },
            }
        );
    };

    // เมื่อเปลี่ยนวิชาในโหมดตามวิชา
    const handleCourseOrTermChange = (newCourseId: number, year: string, sem: number) => {
        setCourseId(newCourseId);
        setCourseYear(year);
        setCourseSemester(sem);

        router.get(
            '/credits/entry',
            {
                mode: 'by_course',
                course_id: newCourseId,
                academic_year: year,
                semester: sem,
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const loadedGrades: any = page.props.course_grades || {};
                    const newForm: any = {};
                    students.forEach((s) => {
                        const existing = loadedGrades[s.id];
                        newForm[s.id] = {
                            grade: existing?.grade || '',
                            remark: existing?.remark || '',
                        };
                    });
                    setFormCourseGrades(newForm);
                },
            }
        );
    };

    // บันทึกผลการเรียนรายบุคคล
    const handleSaveStudentGrades = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId) return;

        setIsSaving(true);
        const gradesPayload = Object.entries(formStudentGrades).map(([cId, data]) => ({
            course_id: Number(cId),
            grade: data.grade,
            academic_year: data.academic_year,
            semester: data.semester,
            remark: data.remark,
        }));

        router.post(
            '/credits/save-student-grades',
            {
                user_id: studentId,
                grades: gradesPayload,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'บันทึกสำเร็จ!',
                        text: 'บันทึกผลการเรียนและคำนวณหน่วยกิตสะสมเรียบร้อยแล้ว',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                onError: (err) => {
                    setIsSaving(false);
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: Object.values(err)[0] || 'ไม่สามารถบันทึกข้อมูลได้',
                    });
                },
            }
        );
    };

    // บันทึกผลการเรียนตามรายวิชาแบบกลุ่ม
    const handleSaveBatchGrades = (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId) return;

        setIsSaving(true);
        const gradesPayload = Object.entries(formCourseGrades).map(([uId, data]) => ({
            user_id: Number(uId),
            grade: data.grade,
            remark: data.remark,
        }));

        router.post(
            '/credits/save-batch-grades',
            {
                course_id: courseId,
                academic_year: courseYear,
                semester: courseSemester,
                grades: gradesPayload,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'บันทึกสำเร็จ!',
                        text: 'บันทึกผลการเรียนของนักศึกษาทั้งกลุ่มเรียบร้อยแล้ว',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                onError: (err) => {
                    setIsSaving(false);
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: Object.values(err)[0] || 'ไม่สามารถบันทึกข้อมูลได้',
                    });
                },
            }
        );
    };

    const currentSelectedStudent = students.find((s) => s.id === studentId);
    const currentSelectedCourse = courses.find((c) => c.id === courseId);

    return (
        <MainLayout>
            <Head title="กรอกผลการเรียน / เกรด - ปริญญาโท วสส.สุพรรณบุรี" />
            <PageTitle title="กรอกและจัดการผลการเรียน" subTitle="ระบบบันทึกหน่วยกิตและผลการเรียน ปริญญาโท วสส.สุพรรณบุรี" />

            {/* Top Navigation */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                <div className="d-flex align-items-center gap-2">
                    <Link href="/credits" className="btn btn-outline-secondary btn-sm bg-white shadow-sm d-inline-flex align-items-center gap-1">
                        <IconifyIcon icon="tabler:arrow-left" className="fs-16" />
                        <span>กลับไปหน้าภาพรวมหน่วยกิต</span>
                    </Link>
                </div>

                {/* Mode Selector Tabs */}
                <Nav variant="pills" className="bg-light p-1 rounded-pill border">
                    <Nav.Item>
                        <Nav.Link
                            active={mode === 'by_student'}
                            onClick={() => setMode('by_student')}
                            className="rounded-pill px-3 py-1 fs-13 fw-semibold cursor-pointer"
                        >
                            <IconifyIcon icon="tabler:user" className="me-1" />
                            โหมดกรอกรายบุคคล
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={mode === 'by_course'}
                            onClick={() => setMode('by_course')}
                            className="rounded-pill px-3 py-1 fs-13 fw-semibold cursor-pointer"
                        >
                            <IconifyIcon icon="tabler:books" className="me-1" />
                            โหมดกรอกตามรายวิชา (ทั้งรุ่น)
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>

            {/* ========================================================================= */}
            {/* โหมดที่ 1: กรอกรายบุคคล (By Student) */}
            {/* ========================================================================= */}
            {mode === 'by_student' && (
                <div>
                    {/* Header Filter Card */}
                    <Card className="shadow-sm border-0 mb-4">
                        <CardBody className="p-3">
                            <Row className="align-items-center g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold text-dark fs-13 mb-1">
                                            เลือกนักศึกษาที่ต้องการกรอกผลการเรียน
                                        </Form.Label>
                                        <Form.Select
                                            value={studentId}
                                            onChange={(e) => handleStudentChange(Number(e.target.value))}
                                            className="fw-bold"
                                        >
                                            {students.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.student_profile?.student_code ? `[${s.student_profile.student_code}] ` : ''}
                                                    {s.student_profile?.full_name_th || s.name}
                                                    {s.student_profile?.academic_year ? ` (ปีเข้า ${s.student_profile.academic_year})` : ''}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6} className="text-md-end">
                                    {currentSelectedStudent && (
                                        <div className="d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
                                            <span className="text-muted fs-13">
                                                GPA ปัจจุบัน: <strong>{currentSelectedStudent.student_profile?.gpa ? Number(currentSelectedStudent.student_profile.gpa).toFixed(2) : '-'}</strong>
                                            </span>
                                            <Link
                                                href={`/credits/student/${currentSelectedStudent.id}`}
                                                target="_blank"
                                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm"
                                            >
                                                <IconifyIcon icon="tabler:external-link" className="fs-15" />
                                                <span>ดูใบรวบรวมหน่วยกิต</span>
                                            </Link>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    {/* Grade Entry Table Form */}
                    <form onSubmit={handleSaveStudentGrades}>
                        <Card className="shadow-sm border-0 overflow-hidden mb-4">
                            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-2">
                                    <IconifyIcon icon="tabler:certificate" className="text-primary fs-20" />
                                    <h5 className="mb-0 fw-bold text-dark fs-16">
                                        รายวิชาตามหลักสูตร ({courses.length} วิชา)
                                    </h5>
                                </div>
                                <div>
                                    <Button variant="primary" type="submit" disabled={isSaving} className="d-inline-flex align-items-center gap-1 shadow-sm px-4">
                                        {isSaving ? (
                                            <>
                                                <Spinner animation="border" size="sm" />
                                                <span>กำลังบันทึก...</span>
                                            </>
                                        ) : (
                                            <>
                                                <IconifyIcon icon="tabler:device-floppy" className="fs-18" />
                                                <span>บันทึกผลการเรียน</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <CardBody className="p-0">
                                <div className="table-responsive">
                                    <Table hover className="align-middle mb-0">
                                        <thead className="bg-light-subtle text-muted text-uppercase fs-12">
                                            <tr>
                                                <th style={{ width: 110 }}>รหัสวิชา</th>
                                                <th>ชื่อรายวิชา</th>
                                                <th style={{ width: 80 }} className="text-center">หน่วยกิต</th>
                                                <th style={{ width: 100 }}>หมวด</th>
                                                <th style={{ width: 130 }}>ปีการศึกษา</th>
                                                <th style={{ width: 110 }}>ภาคเรียน</th>
                                                <th style={{ width: 180 }}>ผลการเรียน (เกรด)</th>
                                                <th style={{ minWidth: 150 }}>หมายเหตุ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map((course) => {
                                                const rowData = formStudentGrades[course.id] || {
                                                    grade: '',
                                                    academic_year: selected_year,
                                                    semester: 1,
                                                    remark: '',
                                                };

                                                return (
                                                    <tr key={course.id} className={rowData.grade ? 'table-primary-subtle' : ''}>
                                                        {/* รหัสวิชา */}
                                                        <td className="fw-bold text-primary fs-13">
                                                            {course.course_code}
                                                        </td>

                                                        {/* ชื่อวิชา */}
                                                        <td>
                                                            <div className="fw-medium text-dark fs-13">
                                                                {course.course_name_th}
                                                            </div>
                                                            {course.course_name_en && (
                                                                <small className="text-muted d-block fs-11">
                                                                    {course.course_name_en}
                                                                </small>
                                                            )}
                                                        </td>

                                                        {/* หน่วยกิต */}
                                                        <td className="text-center fw-bold fs-13">
                                                            {course.credits}
                                                        </td>

                                                        {/* หมวด */}
                                                        <td>
                                                            <Badge
                                                                bg={course.category === 'core' ? 'primary-subtle' : course.category === 'elective' ? 'info-subtle' : 'warning-subtle'}
                                                                className={`border ${course.category === 'core' ? 'text-primary border-primary-subtle' : course.category === 'elective' ? 'text-info border-info-subtle' : 'text-warning border-warning-subtle'} fs-11 py-1 px-2`}
                                                            >
                                                                {course.category === 'core' ? 'วิชาบังคับ' : course.category === 'elective' ? 'วิชาเลือก' : 'วิทยานิพนธ์'}
                                                            </Badge>
                                                        </td>

                                                        {/* ปีการศึกษา */}
                                                        <td>
                                                            <Form.Control
                                                                size="sm"
                                                                type="text"
                                                                value={rowData.academic_year}
                                                                placeholder="เช่น 2567"
                                                                onChange={(e) => {
                                                                    setFormStudentGrades({
                                                                        ...formStudentGrades,
                                                                        [course.id]: {
                                                                            ...rowData,
                                                                            academic_year: e.target.value,
                                                                        },
                                                                    });
                                                                }}
                                                            />
                                                        </td>

                                                        {/* ภาคเรียน */}
                                                        <td>
                                                            <Form.Select
                                                                size="sm"
                                                                value={rowData.semester}
                                                                onChange={(e) => {
                                                                    setFormStudentGrades({
                                                                        ...formStudentGrades,
                                                                        [course.id]: {
                                                                            ...rowData,
                                                                            semester: Number(e.target.value),
                                                                        },
                                                                    });
                                                                }}
                                                            >
                                                                <option value="1">ภาคเรียนที่ 1</option>
                                                                <option value="2">ภาคเรียนที่ 2</option>
                                                                <option value="3">ภาคฤดูร้อน</option>
                                                            </Form.Select>
                                                        </td>

                                                        {/* เกรด Dropdown */}
                                                        <td>
                                                            <Form.Select
                                                                size="sm"
                                                                value={rowData.grade}
                                                                className={`fw-bold ${rowData.grade ? 'border-primary text-primary' : ''}`}
                                                                onChange={(e) => {
                                                                    setFormStudentGrades({
                                                                        ...formStudentGrades,
                                                                        [course.id]: {
                                                                            ...rowData,
                                                                            grade: e.target.value,
                                                                        },
                                                                    });
                                                                }}
                                                            >
                                                                {GRADE_OPTIONS.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </td>

                                                        {/* หมายเหตุ */}
                                                        <td>
                                                            <Form.Control
                                                                size="sm"
                                                                type="text"
                                                                placeholder="หมายเหตุเพิ่มเติม..."
                                                                value={rowData.remark}
                                                                onChange={(e) => {
                                                                    setFormStudentGrades({
                                                                        ...formStudentGrades,
                                                                        [course.id]: {
                                                                            ...rowData,
                                                                            remark: e.target.value,
                                                                        },
                                                                    });
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>

                            <div className="card-footer bg-light-subtle py-3 border-top text-end">
                                <Button variant="primary" type="submit" disabled={isSaving} className="px-4 shadow-sm">
                                    <IconifyIcon icon="tabler:device-floppy" className="me-1 fs-18" />
                                    บันทึกผลการเรียนของนักศึกษา
                                </Button>
                            </div>
                        </Card>
                    </form>
                </div>
            )}

            {/* ========================================================================= */}
            {/* โหมดที่ 2: กรอกตามรายวิชาทั้งรุ่น (By Course / Batch) */}
            {/* ========================================================================= */}
            {mode === 'by_course' && (
                <div>
                    {/* Header Selection Card */}
                    <Card className="shadow-sm border-0 mb-4">
                        <CardBody className="p-3">
                            <Row className="g-3 align-items-end">
                                <Col lg={5} md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold text-dark fs-13 mb-1">
                                            เลือกรายวิชาที่ต้องการกรอกเกรด
                                        </Form.Label>
                                        <Form.Select
                                            value={courseId}
                                            onChange={(e) => handleCourseOrTermChange(Number(e.target.value), courseYear, courseSemester)}
                                            className="fw-bold"
                                        >
                                            {courses.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.course_code} - {c.course_name_th} ({c.credits} หน่วยกิต)
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col lg={3} md={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold text-dark fs-13 mb-1">
                                            ปีการศึกษาที่ลงทะเบียน
                                        </Form.Label>
                                        <Form.Select
                                            value={courseYear}
                                            onChange={(e) => handleCourseOrTermChange(Number(courseId), e.target.value, courseSemester)}
                                        >
                                            {academic_years.map((yr) => (
                                                <option key={yr} value={yr}>ปีการศึกษา {yr}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col lg={2} md={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold text-dark fs-13 mb-1">
                                            ภาคเรียน
                                        </Form.Label>
                                        <Form.Select
                                            value={courseSemester}
                                            onChange={(e) => handleCourseOrTermChange(Number(courseId), courseYear, Number(e.target.value))}
                                        >
                                            <option value="1">ภาคเรียนที่ 1</option>
                                            <option value="2">ภาคเรียนที่ 2</option>
                                            <option value="3">ภาคฤดูร้อน</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col lg={2} className="text-lg-end">
                                    <Badge bg="primary-subtle" className="text-primary border border-primary-subtle fs-12 p-2 w-100 text-center">
                                        นักศึกษา {students.length} คน
                                    </Badge>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    {/* Batch Students Grade Form */}
                    <form onSubmit={handleSaveBatchGrades}>
                        <Card className="shadow-sm border-0 overflow-hidden mb-4">
                            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div>
                                    <h5 className="mb-0 fw-bold text-dark fs-16">
                                        กรอกผลการเรียนวิชา {currentSelectedCourse?.course_code} - {currentSelectedCourse?.course_name_th}
                                    </h5>
                                    <small className="text-muted">
                                        ประจำภาคเรียนที่ {courseSemester} ปีการศึกษา {courseYear} (จำนวน {currentSelectedCourse?.credits} หน่วยกิต)
                                    </small>
                                </div>
                                <div>
                                    <Button variant="primary" type="submit" disabled={isSaving} className="d-inline-flex align-items-center gap-1 shadow-sm px-4">
                                        {isSaving ? (
                                            <>
                                                <Spinner animation="border" size="sm" />
                                                <span>กำลังบันทึก...</span>
                                            </>
                                        ) : (
                                            <>
                                                <IconifyIcon icon="tabler:device-floppy" className="fs-18" />
                                                <span>บันทึกเกรดทั้งรุ่น</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <CardBody className="p-0">
                                <div className="table-responsive">
                                    <Table hover className="align-middle mb-0">
                                        <thead className="bg-light-subtle text-muted text-uppercase fs-12">
                                            <tr>
                                                <th style={{ width: 60 }} className="text-center">#</th>
                                                <th style={{ width: 140 }}>รหัสนักศึกษา</th>
                                                <th style={{ minWidth: 200 }}>ชื่อ-นามสกุล</th>
                                                <th style={{ width: 140 }}>สาขาวิชา / ปีเข้า</th>
                                                <th style={{ width: 220 }}>ผลการเรียน (เกรด)</th>
                                                <th style={{ minWidth: 200 }}>หมายเหตุ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student, idx) => {
                                                const profile = student.student_profile;
                                                const rowData = formCourseGrades[student.id] || { grade: '', remark: '' };

                                                return (
                                                    <tr key={student.id} className={rowData.grade ? 'table-primary-subtle' : ''}>
                                                        <td className="text-center text-muted fw-semibold">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="fw-bold text-primary fs-13">
                                                            {profile?.student_code || '-'}
                                                        </td>
                                                        <td className="fw-medium text-dark fs-13">
                                                            {profile?.full_name_th || student.name}
                                                        </td>
                                                        <td className="fs-12 text-muted">
                                                            {profile?.major || '-'} {profile?.academic_year ? `(${profile.academic_year})` : ''}
                                                        </td>
                                                        <td>
                                                            <Form.Select
                                                                size="sm"
                                                                value={rowData.grade}
                                                                className={`fw-bold ${rowData.grade ? 'border-primary text-primary' : ''}`}
                                                                onChange={(e) => {
                                                                    setFormCourseGrades({
                                                                        ...formCourseGrades,
                                                                        [student.id]: {
                                                                            ...rowData,
                                                                            grade: e.target.value,
                                                                        },
                                                                    });
                                                                }}
                                                            >
                                                                {GRADE_OPTIONS.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                size="sm"
                                                                type="text"
                                                                placeholder="หมายเหตุเพิ่มเติม..."
                                                                value={rowData.remark}
                                                                onChange={(e) => {
                                                                    setFormCourseGrades({
                                                                        ...formCourseGrades,
                                                                        [student.id]: {
                                                                            ...rowData,
                                                                            remark: e.target.value,
                                                                        },
                                                                    });
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>

                            <div className="card-footer bg-light-subtle py-3 border-top text-end">
                                <Button variant="primary" type="submit" disabled={isSaving} className="px-4 shadow-sm">
                                    <IconifyIcon icon="tabler:device-floppy" className="me-1 fs-18" />
                                    บันทึกเกรดทั้งรุ่น
                                </Button>
                            </div>
                        </Card>
                    </form>
                </div>
            )}
        </MainLayout>
    );
};

export default GradeEntryPage;
