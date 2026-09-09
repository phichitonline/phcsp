import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
    Form,
    InputGroup,
} from 'react-bootstrap';

interface StudentProfileItem {
    id: number;
    student_code: string | null;
    first_name_th: string | null;
    last_name_th: string | null;
    full_name_th: string;
    major: string | null;
    academic_year: string | null;
    class_year: string | null;
    advisor_name: string | null;
    gpa: number | string | null;
}

interface CreditSummary {
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
}

interface StudentItem {
    id: number;
    name: string;
    email: string;
    student_profile: StudentProfileItem | null;
    credit_summary: CreditSummary;
}

interface CurriculumItem {
    id: number;
    code: string;
    name: string;
    total_credits: number;
    core_credits_required: number;
    elective_credits_required: number;
    thesis_credits_required: number;
    min_gpa_graduate: number;
}

interface Props {
    curriculum: CurriculumItem | null;
    academic_years: string[];
    selected_year: string;
    search: string;
    credit_status: string;
    students: StudentItem[];
    stats: {
        total_students: number;
        completed_students: number;
        in_progress_students: number;
        at_risk_students: number;
        avg_progress: number;
    };
    is_admin: boolean;
}

const CreditOverviewPage: React.FC<Props> = ({
    curriculum,
    academic_years,
    selected_year,
    search: initialSearch,
    credit_status: initialStatus,
    students,
    stats,
    is_admin,
}) => {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [currentYear, setCurrentYear] = useState(selected_year);
    const [currentStatus, setCurrentStatus] = useState(initialStatus);

    // Filter submit
    const handleFilterChange = (year: string, status: string, q: string) => {
        router.get(
            '/credits',
            {
                academic_year: year,
                credit_status: status,
                search: q,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange(currentYear, currentStatus, searchTerm);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setCurrentYear('all');
        setCurrentStatus('all');
        router.get('/credits');
    };

    return (
        <MainLayout>
            <Head title="ภาพรวมหน่วยกิต ปริญญาโท วสส.สุพรรณบุรี" />
            <PageTitle title="ภาพรวมหน่วยกิต ปริญญาโท" subTitle="ระบบติดตามหน่วยกิตและผลการเรียน วสส.สุพรรณบุรี" />

            {/* Top Info Banner & Actions */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h4 className="mb-0 fw-bold text-dark fs-18">
                            {curriculum ? curriculum.name : 'หลักสูตรสาธารณสุขศาสตรมหาบัณฑิต (ส.ม.)'}
                        </h4>
                        <Badge bg="primary-subtle" className="text-primary border border-primary-subtle fs-12 px-2 py-1">
                            เกณฑ์จบ {curriculum?.total_credits || 36} หน่วยกิต (GPA ≥ {curriculum?.min_gpa_graduate || 3.00})
                        </Badge>
                    </div>
                    <small className="text-muted d-block mt-1">
                        ติดตามความก้าวหน้าการเรียน การสะสมหน่วยกิต และเกรดเฉลี่ยของนักศึกษาทุกรุ่น
                    </small>
                </div>

                {is_admin && (
                    <div className="d-flex align-items-center gap-2">
                        <Link href="/credits/entry" className="btn btn-primary d-inline-flex align-items-center gap-1 shadow-sm">
                            <IconifyIcon icon="tabler:edit" className="fs-18" />
                            <span>กรอกผลการเรียน / เกรด</span>
                        </Link>
                        <Link href="/credits/curriculum" className="btn btn-outline-secondary d-inline-flex align-items-center gap-1 shadow-sm bg-white">
                            <IconifyIcon icon="tabler:books" className="fs-18" />
                            <span>โครงสร้างหลักสูตร</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* 4 Quick Stat Cards */}
            <Row className="g-3 mb-4">
                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="tabler:users" className="fs-26" />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="text-muted fw-semibold mb-1 fs-12 text-uppercase">นักศึกษาทั้งหมด</h6>
                                <h3 className="mb-0 fw-bold text-dark">
                                    {stats.total_students} <span className="fs-13 fw-normal text-muted">คน</span>
                                </h3>
                                <small className="text-muted fs-11">
                                    {currentYear !== 'all' ? `ปีการศึกษา ${currentYear}` : 'ทุกปีการศึกษา'}
                                </small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="tabler:certificate" className="fs-26" />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="text-muted fw-semibold mb-1 fs-12 text-uppercase">ครบเกณฑ์ 100% (พร้อมจบ)</h6>
                                <h3 className="mb-0 fw-bold text-success">
                                    {stats.completed_students} <span className="fs-13 fw-normal text-muted">คน</span>
                                </h3>
                                <small className="text-muted fs-11">
                                    {stats.total_students > 0 ? `${Math.round((stats.completed_students / stats.total_students) * 100)}% ของนักศึกษาทั้งหมด` : '0%'}
                                </small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-3 bg-info-subtle text-info d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="tabler:chart-pie" className="fs-26" />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="text-muted fw-semibold mb-1 fs-12 text-uppercase">ความคืบหน้าเฉลี่ย</h6>
                                <h3 className="mb-0 fw-bold text-info">
                                    {stats.avg_progress}%
                                </h3>
                                <ProgressBar now={stats.avg_progress} variant="info" className="mt-1" style={{ height: '5px' }} />
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className={`avatar-md rounded-3 ${stats.at_risk_students > 0 ? 'bg-danger-subtle text-danger' : 'bg-light text-muted'} d-flex align-items-center justify-content-center me-3 flex-shrink-0`} style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="tabler:alert-triangle" className="fs-26" />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="text-muted fw-semibold mb-1 fs-12 text-uppercase">ต้องติดตามพิเศษ</h6>
                                <h3 className={`mb-0 fw-bold ${stats.at_risk_students > 0 ? 'text-danger' : 'text-muted'}`}>
                                    {stats.at_risk_students} <span className="fs-13 fw-normal text-muted">คน</span>
                                </h3>
                                <small className="text-muted fs-11">มีเกรดค้าง เช่น U, I หรือ F</small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Filter Card */}
            <Card className="shadow-sm border-0 mb-4">
                <CardBody className="p-3">
                    <Row className="g-2 align-items-center">
                        {/* ปีการศึกษา Dropdown */}
                        <Col lg={3} md={4} sm={6}>
                            <Form.Group>
                                <Form.Label className="fs-12 text-muted mb-1 fw-semibold">ปีการศึกษาที่เข้าศึกษา</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={currentYear}
                                    onChange={(e) => {
                                        setCurrentYear(e.target.value);
                                        handleFilterChange(e.target.value, currentStatus, searchTerm);
                                    }}
                                >
                                    <option value="all">ทุกปีการศึกษา</option>
                                    {academic_years.map((yr) => (
                                        <option key={yr} value={yr}>ปีการศึกษา {yr}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* สถานะหน่วยกิต */}
                        <Col lg={3} md={4} sm={6}>
                            <Form.Group>
                                <Form.Label className="fs-12 text-muted mb-1 fw-semibold">สถานะหน่วยกิต</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={currentStatus}
                                    onChange={(e) => {
                                        setCurrentStatus(e.target.value);
                                        handleFilterChange(currentYear, e.target.value, searchTerm);
                                    }}
                                >
                                    <option value="all">สถานะทั้งหมด</option>
                                    <option value="completed">ครบเกณฑ์ 100% (พร้อมจบ)</option>
                                    <option value="in_progress">อยู่ระหว่างเก็บหน่วยกิต</option>
                                    <option value="at_risk">ต้องติดตามพิเศษ (ติด U/I/F)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Search Box */}
                        <Col lg={4} md={4} sm={12}>
                            <Form.Group>
                                <Form.Label className="fs-12 text-muted mb-1 fw-semibold">ค้นหานักศึกษา</Form.Label>
                                <form onSubmit={handleSearchSubmit}>
                                    <InputGroup size="sm">
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <IconifyIcon icon="tabler:search" className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="ค้นหาชื่อ, รหัสนักศึกษา, สาขา..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="border-start-0"
                                        />
                                        <Button variant="primary" type="submit">ค้นหา</Button>
                                    </InputGroup>
                                </form>
                            </Form.Group>
                        </Col>

                        {/* Reset Button */}
                        <Col lg={2} md={12} className="text-lg-end mt-lg-4">
                            <Button variant="outline-secondary" size="sm" onClick={handleResetFilters} className="w-100">
                                <IconifyIcon icon="tabler:refresh" className="me-1" />
                                ล้างตัวกรอง
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Students Table Card */}
            <Card className="shadow-sm border-0 overflow-hidden mb-4">
                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <div className="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                            <IconifyIcon icon="tabler:list-details" className="fs-18" />
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold text-dark fs-16">
                                รายชื่อนักศึกษาและความก้าวหน้าหน่วยกิต ({students.length} คน)
                            </h5>
                            <small className="text-muted">
                                แสดงสัดส่วนหน่วยกิตที่ผ่านตามแผนการศึกษาและเกรดเฉลี่ยสะสม
                            </small>
                        </div>
                    </div>
                </div>

                <CardBody className="p-0">
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead className="bg-light-subtle text-muted text-uppercase fs-12">
                                <tr>
                                    <th style={{ width: 60 }} className="text-center">#</th>
                                    <th style={{ minWidth: 220 }}>ข้อมูลนักศึกษา</th>
                                    <th style={{ width: 140 }}>ปี / ชั้นปี</th>
                                    <th style={{ minWidth: 220 }}>ความคืบหน้าหน่วยกิตรวม</th>
                                    <th style={{ minWidth: 200 }}>หมวดวิชา (บังคับ / เลือก / วิทยานิพนธ์)</th>
                                    <th style={{ width: 90 }} className="text-center">GPA</th>
                                    <th style={{ width: 120 }} className="text-center">สถานะ</th>
                                    <th style={{ width: 160 }} className="text-center">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5 text-muted">
                                            <div className="avatar-lg mx-auto mb-2 text-muted opacity-50">
                                                <IconifyIcon icon="tabler:file-off" className="display-4" />
                                            </div>
                                            <p className="mb-0 fs-14">ไม่พบข้อมูลนักศึกษาที่ตรงกับเงื่อนไขการค้นหา</p>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student, idx) => {
                                        const summary = student.credit_summary;
                                        const profile = student.student_profile;
                                        const fullName = profile?.full_name_th || student.name;
                                        const studentCode = profile?.student_code;

                                        return (
                                            <tr key={student.id}>
                                                {/* ลำดับ */}
                                                <td className="text-center text-muted fw-semibold">
                                                    {idx + 1}
                                                </td>

                                                {/* ข้อมูลนักศึกษา */}
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar-sm rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold fs-14 flex-shrink-0" style={{ width: 38, height: 38 }}>
                                                            {fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/credits/student/${student.id}`}
                                                                className="fw-bold text-dark fs-14 text-decoration-none hover-primary d-block"
                                                            >
                                                                {fullName}
                                                            </Link>
                                                            <div className="d-flex align-items-center gap-1 text-muted fs-12 mt-1">
                                                                {studentCode ? (
                                                                    <Badge bg="light" className="text-primary border border-primary-subtle py-0 px-1">
                                                                        รหัส: {studentCode}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-muted">{student.email}</span>
                                                                )}
                                                                {profile?.major && (
                                                                    <span className="text-truncate" style={{ maxWidth: 140 }}>
                                                                        • {profile.major}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ปีการศึกษา / ชั้นปี */}
                                                <td>
                                                    <div className="fs-13">
                                                        <span className="fw-semibold">ปี {profile?.academic_year || '-'}</span>
                                                    </div>
                                                    <small className="text-muted d-block">
                                                        ชั้นปีที่ {profile?.class_year || '1'}
                                                    </small>
                                                </td>

                                                {/* ความคืบหน้ารวม Progress Bar */}
                                                <td>
                                                    <div className="d-flex justify-content-between align-items-center mb-1 fs-12">
                                                        <span className="fw-bold text-dark">
                                                            {summary.total_earned} <span className="text-muted fw-normal">/ {summary.total_required} หน่วยกิต</span>
                                                        </span>
                                                        <span className={`fw-bold ${summary.is_completed ? 'text-success' : 'text-primary'}`}>
                                                            {summary.progress_percent}%
                                                        </span>
                                                    </div>
                                                    <ProgressBar
                                                        now={summary.progress_percent}
                                                        variant={summary.is_completed ? 'success' : summary.progress_percent > 50 ? 'primary' : 'warning'}
                                                        style={{ height: '7px' }}
                                                        className="rounded-pill"
                                                    />
                                                </td>

                                                {/* แยกหมวดหมู่ */}
                                                <td>
                                                    <div className="d-flex flex-column gap-1 fs-11">
                                                        <div className="d-flex justify-content-between text-muted">
                                                            <span>วิชาบังคับ:</span>
                                                            <span className={`fw-semibold ${summary.core_earned >= summary.core_required ? 'text-success' : 'text-dark'}`}>
                                                                {summary.core_earned} / {summary.core_required}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex justify-content-between text-muted">
                                                            <span>วิชาเลือก:</span>
                                                            <span className={`fw-semibold ${summary.elective_earned >= summary.elective_required ? 'text-success' : 'text-dark'}`}>
                                                                {summary.elective_earned} / {summary.elective_required}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex justify-content-between text-muted">
                                                            <span>วิทยานิพนธ์:</span>
                                                            <span className={`fw-semibold ${summary.thesis_earned >= summary.thesis_required ? 'text-success' : 'text-dark'}`}>
                                                                {summary.thesis_earned} / {summary.thesis_required}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* GPA */}
                                                <td className="text-center">
                                                    <Badge
                                                        bg={summary.gpa >= 3.5 ? 'success-subtle' : summary.gpa >= 3.0 ? 'primary-subtle' : summary.gpa > 0 ? 'warning-subtle' : 'light'}
                                                        className={`border ${summary.gpa >= 3.5 ? 'text-success border-success-subtle' : summary.gpa >= 3.0 ? 'text-primary border-primary-subtle' : summary.gpa > 0 ? 'text-warning border-warning-subtle' : 'text-muted border'} fs-12 px-2 py-1 fw-bold`}
                                                    >
                                                        {summary.gpa > 0 ? Number(summary.gpa).toFixed(2) : '-'}
                                                    </Badge>
                                                </td>

                                                {/* สถานะ Badge */}
                                                <td className="text-center">
                                                    {summary.is_completed ? (
                                                        <Badge bg="success" className="px-2 py-1 fs-11">
                                                            ครบ 100%
                                                        </Badge>
                                                    ) : summary.has_risk ? (
                                                        <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-2 py-1 fs-11" title="มีผลการเรียนต้องติดตาม เช่น U, I, F">
                                                            ต้องติดตาม
                                                        </Badge>
                                                    ) : summary.total_earned > 0 ? (
                                                        <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-2 py-1 fs-11">
                                                            กำลังศึกษา
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg="light" className="text-muted border px-2 py-1 fs-11">
                                                            ยังไม่บันทึก
                                                        </Badge>
                                                    )}
                                                </td>

                                                {/* Action Buttons */}
                                                <td className="text-center">
                                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                                        <Link
                                                            href={`/credits/student/${student.id}`}
                                                            className="btn btn-sm btn-outline-primary px-2 py-1 fs-12 d-inline-flex align-items-center gap-1 shadow-sm"
                                                            title="ดูใบรวบรวมหน่วยกิต / Transcript"
                                                        >
                                                            <IconifyIcon icon="tabler:file-certificate" className="fs-15" />
                                                            <span>ดูผล</span>
                                                        </Link>

                                                        {is_admin && (
                                                            <Link
                                                                href={`/credits/entry?student_id=${student.id}`}
                                                                className="btn btn-sm btn-outline-secondary px-2 py-1 fs-12 d-inline-flex align-items-center shadow-sm"
                                                                title="กรอก/แก้ไขผลการเรียน"
                                                            >
                                                                <IconifyIcon icon="tabler:edit" className="fs-15 text-primary" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Card>
        </MainLayout>
    );
};

export default CreditOverviewPage;
