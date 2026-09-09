import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
    Card,
    CardBody,
    Row,
    Col,
    Table,
    Button,
    Badge,
    ProgressBar,
} from 'react-bootstrap';

interface CourseItem {
    id: number;
    course_code: string;
    course_name_th: string;
    course_name_en: string | null;
    credits: number;
    year_suggested: number;
    term_suggested: number | null;
    grade: string | null;
    grade_point: number | null;
    is_passed: boolean;
    academic_year: string | null;
    semester: number | null;
    remark: string | null;
}

interface CategoryGroup {
    title: string;
    description: string;
    required_credits: number;
    earned_credits: number;
    percent: number;
    courses: CourseItem[];
}

interface SemesterBreakdown {
    key: string;
    academic_year: string;
    semester: number;
    term_credits: number;
    term_passed_credits: number;
    term_gpa: number;
    items: {
        id: number;
        course: {
            course_code: string;
            course_name_th: string;
            credits: number;
        } | null;
        grade: string | null;
        grade_point: number | null;
        is_passed: boolean;
        remark: string | null;
    }[];
}

interface Props {
    student: {
        id: number;
        name: string;
        email: string;
        student_profile: {
            id: number;
            student_code: string | null;
            full_name_th: string;
            full_name_en: string;
            major: string | null;
            faculty: string | null;
            academic_year: string | null;
            class_year: string | null;
            advisor_name: string | null;
            student_status: string | null;
            gpa: number | string | null;
        } | null;
    };
    curriculum: {
        id: number;
        code: string;
        name: string;
        total_credits: number;
        core_credits_required: number;
        elective_credits_required: number;
        thesis_credits_required: number;
        min_gpa_graduate: number;
    } | null;
    summary: {
        total_required: number;
        total_earned: number;
        progress_percent: number;
        core_required: number;
        core_earned: number;
        core_percent: number;
        elective_required: number;
        elective_earned: number;
        elective_percent: number;
        thesis_required: number;
        thesis_earned: number;
        thesis_percent: number;
        gpa: number;
        has_risk: boolean;
        is_completed: boolean;
        grades_count: number;
    };
    categorized_courses: {
        core: CategoryGroup;
        elective: CategoryGroup;
        thesis: CategoryGroup;
    };
    semesters: SemesterBreakdown[];
    is_admin: boolean;
}

const StudentCreditAuditPage: React.FC<Props> = ({
    student,
    curriculum,
    summary,
    categorized_courses,
    semesters,
    is_admin,
}) => {
    const profile = student.student_profile;
    const fullName = profile?.full_name_th || student.name;
    const studentCode = profile?.student_code || '-';

    const handlePrint = () => {
        window.print();
    };

    return (
        <MainLayout>
            <Head title={`ใบรวบรวมหน่วยกิต - ${fullName}`} />
            <PageTitle title="ความก้าวหน้าหน่วยกิตรายบุคคล" subTitle="ใบรวบรวมหน่วยกิตและผลการเรียนตามหลักสูตร" />

            {/* Top Navigation & Print Action */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 d-print-none">
                <div className="d-flex align-items-center gap-2">
                    {is_admin ? (
                        <Link href="/credits" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 bg-white shadow-sm">
                            <IconifyIcon icon="tabler:arrow-left" className="fs-16" />
                            <span>กลับไปหน้าภาพรวมหน่วยกิต</span>
                        </Link>
                    ) : (
                        <Link href="/" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 bg-white shadow-sm">
                            <IconifyIcon icon="tabler:arrow-left" className="fs-16" />
                            <span>กลับหน้าหลัก</span>
                        </Link>
                    )}
                </div>

                <div className="d-flex align-items-center gap-2">
                    {is_admin && (
                        <Link
                            href={`/credits/entry?student_id=${student.id}`}
                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                        >
                            <IconifyIcon icon="tabler:edit" className="fs-16" />
                            <span>กรอก / ปรับปรุงผลการเรียน</span>
                        </Link>
                    )}
                    <Button variant="outline-dark" size="sm" onClick={handlePrint} className="d-inline-flex align-items-center gap-1 shadow-sm bg-white">
                        <IconifyIcon icon="tabler:printer" className="fs-16" />
                        <span>พิมพ์รายงาน (Print)</span>
                    </Button>
                </div>
            </div>

            {/* Student Profile Info Card */}
            <Card className="shadow-sm border-0 mb-4 overflow-hidden">
                <CardBody className="p-4">
                    <Row className="align-items-center g-3">
                        <Col lg={8} md={7}>
                            <div className="d-flex align-items-start gap-3">
                                <div className="avatar-lg rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-22 shadow-sm flex-shrink-0" style={{ width: 56, height: 56 }}>
                                    {fullName.charAt(0)}
                                </div>
                                <div>
                                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                        <h4 className="mb-0 fw-bold text-dark fs-18">{fullName}</h4>
                                        <Badge bg="primary" className="fs-12 px-2 py-1">
                                            รหัสนักศึกษา: {studentCode}
                                        </Badge>
                                        {profile?.student_status && (
                                            <Badge bg="success-subtle" className="text-success border border-success-subtle fs-12 px-2 py-1">
                                                สถานะ: {profile.student_status}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-muted fs-13 mb-1">
                                        <span>หลักสูตร: <strong>{curriculum?.name || 'สาธารณสุขศาสตรมหาบัณฑิต (ส.ม.)'}</strong></span>
                                        {profile?.major && <span> • สาขาวิชา: {profile.major}</span>}
                                    </div>
                                    <div className="text-muted fs-12 d-flex align-items-center gap-3 flex-wrap">
                                        <span>ปีการศึกษาที่เข้าศึกษา: <strong>{profile?.academic_year || '-'}</strong></span>
                                        <span>ชั้นปี: <strong>ปีที่ {profile?.class_year || '1'}</strong></span>
                                        {profile?.advisor_name && (
                                            <span>อาจารย์ที่ปรึกษา: <strong>{profile.advisor_name}</strong></span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Grand Total Summary Card */}
                        <Col lg={4} md={5} className="text-md-end border-start-md ps-md-4">
                            <div className="bg-light-subtle p-3 rounded-3 border">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="text-muted fs-12 fw-semibold text-uppercase">หน่วยกิตสะสมรวม</span>
                                    <span className={`badge ${summary.is_completed ? 'bg-success' : 'bg-primary'} fs-12`}>
                                        {summary.progress_percent}%
                                    </span>
                                </div>
                                <div className="d-flex align-items-baseline gap-1 mb-2">
                                    <h2 className="mb-0 fw-bold text-dark">{summary.total_earned}</h2>
                                    <span className="text-muted fs-14">/ {summary.total_required} หน่วยกิต</span>
                                </div>
                                <ProgressBar
                                    now={summary.progress_percent}
                                    variant={summary.is_completed ? 'success' : summary.progress_percent > 50 ? 'primary' : 'warning'}
                                    style={{ height: '7px' }}
                                    className="rounded-pill mb-2"
                                />
                                <div className="d-flex justify-content-between align-items-center fs-12">
                                    <span className="text-muted">เกรดเฉลี่ยสะสม (GPA):</span>
                                    <span className="fw-bold fs-14 text-dark">{summary.gpa > 0 ? Number(summary.gpa).toFixed(2) : '-'}</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* 3 Categories Progress Cards */}
            <Row className="g-3 mb-4">
                {/* 1. หมวดวิชาบังคับ */}
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <CardBody className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="avatar-xs rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold fs-12">
                                        1
                                    </div>
                                    <h6 className="mb-0 fw-bold text-dark fs-14">หมวดวิชาบังคับ</h6>
                                </div>
                                <Badge bg={summary.core_earned >= summary.core_required ? 'success-subtle' : 'primary-subtle'} className={`border ${summary.core_earned >= summary.core_required ? 'text-success border-success-subtle' : 'text-primary border-primary-subtle'} fs-11`}>
                                    {summary.core_earned >= summary.core_required ? 'ครบแล้ว' : 'กำลังเก็บ'}
                                </Badge>
                            </div>
                            <div className="d-flex align-items-baseline gap-1 mb-2">
                                <h3 className="mb-0 fw-bold text-dark">{summary.core_earned}</h3>
                                <span className="text-muted fs-13">/ {summary.core_required} หน่วยกิต</span>
                                <span className="ms-auto fw-bold fs-13 text-primary">{summary.core_percent}%</span>
                            </div>
                            <ProgressBar now={summary.core_percent} variant={summary.core_earned >= summary.core_required ? 'success' : 'primary'} style={{ height: '5px' }} className="rounded-pill" />
                        </CardBody>
                    </Card>
                </Col>

                {/* 2. หมวดวิชาเลือก */}
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <CardBody className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="avatar-xs rounded bg-info-subtle text-info d-flex align-items-center justify-content-center fw-bold fs-12">
                                        2
                                    </div>
                                    <h6 className="mb-0 fw-bold text-dark fs-14">หมวดวิชาเลือก</h6>
                                </div>
                                <Badge bg={summary.elective_earned >= summary.elective_required ? 'success-subtle' : 'info-subtle'} className={`border ${summary.elective_earned >= summary.elective_required ? 'text-success border-success-subtle' : 'text-info border-info-subtle'} fs-11`}>
                                    {summary.elective_earned >= summary.elective_required ? 'ครบแล้ว' : 'กำลังเก็บ'}
                                </Badge>
                            </div>
                            <div className="d-flex align-items-baseline gap-1 mb-2">
                                <h3 className="mb-0 fw-bold text-dark">{summary.elective_earned}</h3>
                                <span className="text-muted fs-13">/ {summary.elective_required} หน่วยกิต</span>
                                <span className="ms-auto fw-bold fs-13 text-info">{summary.elective_percent}%</span>
                            </div>
                            <ProgressBar now={summary.elective_percent} variant={summary.elective_earned >= summary.elective_required ? 'success' : 'info'} style={{ height: '5px' }} className="rounded-pill" />
                        </CardBody>
                    </Card>
                </Col>

                {/* 3. หมวดวิทยานิพนธ์ */}
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <CardBody className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="avatar-xs rounded bg-warning-subtle text-warning d-flex align-items-center justify-content-center fw-bold fs-12">
                                        3
                                    </div>
                                    <h6 className="mb-0 fw-bold text-dark fs-14">หมวดวิทยานิพนธ์</h6>
                                </div>
                                <Badge bg={summary.thesis_earned >= summary.thesis_required ? 'success-subtle' : 'warning-subtle'} className={`border ${summary.thesis_earned >= summary.thesis_required ? 'text-success border-success-subtle' : 'text-warning border-warning-subtle'} fs-11`}>
                                    {summary.thesis_earned >= summary.thesis_required ? 'ครบแล้ว' : 'กำลังเก็บ'}
                                </Badge>
                            </div>
                            <div className="d-flex align-items-baseline gap-1 mb-2">
                                <h3 className="mb-0 fw-bold text-dark">{summary.thesis_earned}</h3>
                                <span className="text-muted fs-13">/ {summary.thesis_required} หน่วยกิต</span>
                                <span className="ms-auto fw-bold fs-13 text-warning">{summary.thesis_percent}%</span>
                            </div>
                            <ProgressBar now={summary.thesis_percent} variant={summary.thesis_earned >= summary.thesis_required ? 'success' : 'warning'} style={{ height: '5px' }} className="rounded-pill" />
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Checklist รายวิชาตามโครงสร้างหลักสูตร (3 หมวด) */}
            <Card className="shadow-sm border-0 mb-4 overflow-hidden">
                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <IconifyIcon icon="tabler:list-check" className="text-primary fs-20" />
                        <h5 className="mb-0 fw-bold text-dark fs-16">
                            โครงสร้างรายวิชาและสถานะการเก็บหน่วยกิต
                        </h5>
                    </div>
                </div>

                <CardBody className="p-0">
                    {(['core', 'elective', 'thesis'] as const).map((catKey) => {
                        const group = categorized_courses[catKey];

                        return (
                            <div key={catKey} className="border-bottom">
                                {/* แถบหัวข้อหมวด */}
                                <div className="bg-light-subtle px-4 py-2 d-flex align-items-center justify-content-between flex-wrap gap-2 border-top">
                                    <div>
                                        <span className="fw-bold text-dark fs-14 me-2">{group.title}</span>
                                        <small className="text-muted">({group.description})</small>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <Badge bg={group.earned_credits >= group.required_credits ? 'success' : 'secondary'} className="fs-12 px-2 py-1">
                                            เก็บแล้ว {group.earned_credits} / {group.required_credits} หน่วยกิต ({group.percent}%)
                                        </Badge>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <Table hover className="align-middle mb-0">
                                        <thead className="text-muted fs-11 text-uppercase">
                                            <tr>
                                                <th style={{ width: 120 }}>รหัสวิชา</th>
                                                <th>ชื่อรายวิชา</th>
                                                <th style={{ width: 100 }} className="text-center">หน่วยกิต</th>
                                                <th style={{ width: 120 }} className="text-center">แผนการเรียน</th>
                                                <th style={{ width: 120 }} className="text-center">ปี/เทอมที่เรียน</th>
                                                <th style={{ width: 100 }} className="text-center">เกรด</th>
                                                <th style={{ width: 120 }} className="text-center">สถานะ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.courses.map((course) => {
                                                const hasGrade = !!course.grade;
                                                const isPassed = course.is_passed;

                                                return (
                                                    <tr key={course.id} className={isPassed ? 'table-success-subtle' : ''}>
                                                        <td className="fw-bold text-primary fs-13">
                                                            {course.course_code}
                                                        </td>
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
                                                        <td className="text-center fw-bold fs-13">
                                                            {course.credits}
                                                        </td>
                                                        <td className="text-center text-muted fs-12">
                                                            ปี {course.year_suggested} เทอม {course.term_suggested || '-'}
                                                        </td>
                                                        <td className="text-center fs-12">
                                                            {course.academic_year ? (
                                                                <span>{course.semester}/{course.academic_year}</span>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {hasGrade ? (
                                                                <Badge
                                                                    bg={['A', 'B+', 'B', 'S', 'P'].includes(course.grade || '') ? 'success' : ['C+', 'C'].includes(course.grade || '') ? 'primary' : 'danger'}
                                                                    className="fs-13 px-2 py-1 fw-bold"
                                                                >
                                                                    {course.grade}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {isPassed ? (
                                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-11 d-inline-flex align-items-center gap-1">
                                                                    <IconifyIcon icon="tabler:check" className="fs-13" /> ผ่าน
                                                                </span>
                                                            ) : hasGrade ? (
                                                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fs-11">
                                                                    ยังไม่ผ่าน
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-light text-muted border px-2 py-1 fs-11">
                                                                    ยังไม่ลงทะเบียน
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        );
                    })}
                </CardBody>
            </Card>

            {/* ประวัติผลการเรียนรายภาคการศึกษา (Semesters Breakdown) */}
            {semesters.length > 0 && (
                <Card className="shadow-sm border-0 mb-4 overflow-hidden">
                    <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                            <IconifyIcon icon="tabler:calendar-stats" className="text-primary fs-20" />
                            <h5 className="mb-0 fw-bold text-dark fs-16">
                                ประวัติผลการเรียนจำแนกตามภาคการศึกษา (Transcript by Semester)
                            </h5>
                        </div>
                    </div>

                    <CardBody className="p-0">
                        {semesters.map((sem) => (
                            <div key={sem.key} className="border-bottom">
                                <div className="bg-light px-4 py-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
                                    <span className="fw-bold text-dark fs-13">
                                        ภาคเรียนที่ {sem.semester} ปีการศึกษา {sem.academic_year}
                                    </span>
                                    <div className="d-flex align-items-center gap-3 fs-12">
                                        <span>หน่วยกิตลงทะเบียน: <strong>{sem.term_credits}</strong></span>
                                        <span>หน่วยกิตที่ได้: <strong>{sem.term_passed_credits}</strong></span>
                                        {sem.term_gpa > 0 && (
                                            <span className="text-primary">GPA ประจำภาค: <strong>{Number(sem.term_gpa).toFixed(2)}</strong></span>
                                        )}
                                    </div>
                                </div>

                                <Table hover className="align-middle mb-0 fs-12">
                                    <thead>
                                        <tr className="text-muted">
                                            <th style={{ width: 120 }}>รหัสวิชา</th>
                                            <th>ชื่อรายวิชา</th>
                                            <th style={{ width: 100 }} className="text-center">หน่วยกิต</th>
                                            <th style={{ width: 100 }} className="text-center">เกรด</th>
                                            <th style={{ width: 100 }} className="text-center">แต้มคะแนน</th>
                                            <th style={{ width: 100 }} className="text-center">ผลการเรียน</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sem.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="fw-bold text-primary">{item.course?.course_code}</td>
                                                <td>{item.course?.course_name_th}</td>
                                                <td className="text-center">{item.course?.credits}</td>
                                                <td className="text-center fw-bold">{item.grade}</td>
                                                <td className="text-center">{item.grade_point !== null ? Number(item.grade_point).toFixed(2) : '-'}</td>
                                                <td className="text-center">
                                                    {item.is_passed ? (
                                                        <span className="text-success fw-bold">P</span>
                                                    ) : (
                                                        <span className="text-danger fw-bold">F</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        ))}
                    </CardBody>
                </Card>
            )}
        </MainLayout>
    );
};

export default StudentCreditAuditPage;
