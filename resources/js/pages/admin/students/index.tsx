import React, { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    Card,
    CardBody,
    Col,
    Row,
    Button,
    Form,
    Badge,
    Table,
    ProgressBar,
    Modal,
    InputGroup,
    Nav,
    Tab
} from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';
import avatarDefault from '@/images/users/avatar-2.jpg';

export interface StudentProfileItem {
    id?: number | null;
    user_id: number;
    student_code: string;
    national_id: string;
    title_prefix: string;
    first_name_th: string;
    last_name_th: string;
    first_name_en: string;
    last_name_en: string;
    full_name_th: string;
    gender: string;
    birth_date: string;
    blood_group: string;
    religion: string;
    phone: string;
    line_id: string;
    faculty: string;
    major: string;
    academic_year: string;
    class_year: string;
    advisor_name: string;
    student_status: string;
    gpa: number | null;
    practicum_hospital: string;
    address: string;
    current_address: string;
    emergency_contact_name: string;
    emergency_relationship: string;
    emergency_phone: string;
    health_conditions: string;
    avatar_path: string | null;
    updated_at: string | null;
}

export interface StudentItem {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    created_at: string | null;
    profile: StudentProfileItem;
    profile_status: {
        is_updated: boolean;
        completeness: number;
        last_updated: string | null;
    };
    document_status: {
        uploaded_count: number;
        total_count: number;
        progress_percent: number;
        is_completed: boolean;
        current_category: string;
        uploaded_item_nos: number[];
    };
    personal_documents: {
        id: number;
        item_no: number;
        title: string;
        file_name: string;
        file_size: number;
        created_at: string;
        view_url: string;
        download_url: string;
    }[];
}

export interface StandardDocumentItem {
    id: number;
    item_no: number;
    title: string;
    description?: string | null;
    required: boolean;
    thesis_category_id?: number | null;
    thesis_category?: {
        id: number;
        category_no: number;
        name: string;
        suggested_name?: string | null;
        item_reference?: string | null;
    } | null;
}

export interface ThesisCategoryItem {
    id: number;
    category_no: number;
    name: string;
    suggested_name?: string | null;
    item_reference?: string | null;
}

interface Props {
    students: StudentItem[];
    standard_documents: StandardDocumentItem[];
    thesis_categories: ThesisCategoryItem[];
    stats: {
        total_students: number;
        profiles_updated: number;
        documents_completed: number;
        documents_in_progress: number;
    };
    filters?: {
        search?: string;
        profile_status?: string;
        doc_status?: string;
        class_year?: string;
    };
}

const StudentManagementPage = ({
    students = [],
    standard_documents = [],
    thesis_categories = [],
    stats = {
        total_students: 0,
        profiles_updated: 0,
        documents_completed: 0,
        documents_in_progress: 0,
    },
    filters = {},
}: Props) => {
    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterProfileStatus, setFilterProfileStatus] = useState(filters.profile_status || 'all');
    const [filterDocStatus, setFilterDocStatus] = useState(filters.doc_status || 'all');
    const [filterClassYear, setFilterClassYear] = useState(filters.class_year || 'all');

    // Modals state
    const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit Form Data
    const [formData, setFormData] = useState<StudentProfileItem>({
        user_id: 0,
        student_code: '',
        national_id: '',
        title_prefix: 'นาย',
        first_name_th: '',
        last_name_th: '',
        first_name_en: '',
        last_name_en: '',
        full_name_th: '',
        gender: 'ชาย',
        birth_date: '',
        blood_group: 'B',
        religion: 'พุทธ',
        phone: '',
        line_id: '',
        faculty: 'วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี',
        major: 'สาธารณสุขศาสตรบัณฑิต (สาธารณสุขชุมชน)',
        academic_year: '2567',
        class_year: 'ชั้นปีที่ 2',
        advisor_name: '',
        student_status: 'กำลังศึกษา',
        gpa: null,
        practicum_hospital: '',
        address: '',
        current_address: '',
        emergency_contact_name: '',
        emergency_relationship: '',
        emergency_phone: '',
        health_conditions: '',
        avatar_path: null,
        updated_at: null,
    });

    // Handle open Edit Modal
    const handleOpenEdit = (student: StudentItem) => {
        setSelectedStudent(student);
        setFormData({
            ...student.profile,
            user_id: student.id,
            first_name_th: student.profile.first_name_th || student.name.split(' ')[0] || '',
            last_name_th: student.profile.last_name_th || student.name.split(' ')[1] || '',
        });
        setShowEditModal(true);
    };

    // Handle open View Details Modal
    const handleOpenView = (student: StudentItem) => {
        setSelectedStudent(student);
        setShowViewModal(true);
    };

    // Submit Edit Profile Form
    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setIsSaving(true);
        router.post(
            route('admin.students.update-profile', selectedStudent.id),
            formData as any,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    setShowEditModal(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'บันทึกสำเร็จ!',
                        text: `อัปเดตข้อมูลทะเบียนประวัติของ ${formData.first_name_th} เรียบร้อยแล้ว`,
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                onError: (err) => {
                    setIsSaving(false);
                    const msg = Object.values(err)[0] || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: String(msg),
                        confirmButtonColor: '#465dff',
                    });
                },
            }
        );
    };

    // Filter Students Client-side for Instant Response
    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            // Profile Status Filter
            if (filterProfileStatus === 'updated' && !s.profile_status.is_updated) return false;
            if (filterProfileStatus === 'pending' && s.profile_status.is_updated) return false;

            // Document Status Filter
            if (filterDocStatus === 'completed' && !s.document_status.is_completed) return false;
            if (filterDocStatus === 'in_progress' && (s.document_status.uploaded_count === 0 || s.document_status.is_completed)) return false;
            if (filterDocStatus === 'not_started' && s.document_status.uploaded_count > 0) return false;

            // Class Year Filter
            if (filterClassYear !== 'all') {
                const year = s.profile.class_year || '';
                if (!year.includes(filterClassYear)) return false;
            }

            // Search Term
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase().trim();
                const matchesName = s.name.toLowerCase().includes(q) || s.profile.full_name_th.toLowerCase().includes(q);
                const matchesCode = (s.profile.student_code || '').toLowerCase().includes(q);
                const matchesNationalId = (s.profile.national_id || '').includes(q);
                const matchesEmail = s.email.toLowerCase().includes(q);
                const matchesPhone = (s.profile.phone || '').includes(q);
                const matchesMajor = (s.profile.major || '').toLowerCase().includes(q);
                return matchesName || matchesCode || matchesNationalId || matchesEmail || matchesPhone || matchesMajor;
            }

            return true;
        });
    }, [students, searchTerm, filterProfileStatus, filterDocStatus, filterClassYear]);

    // Reset Filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterProfileStatus('all');
        setFilterDocStatus('all');
        setFilterClassYear('all');
    };

    return (
        <MainLayout>
            <PageTitle title="รายชื่อนักศึกษา" subTitle="ระบบจัดการและติดตามสถานะทะเบียนประวัติและเอกสารนักศึกษา" />

            {/* Quick Stats Cards */}
            <Row className="g-3 mt-1 mb-4">
                {/* 1. นักศึกษาทั้งหมด */}
                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div
                                className="avatar-md rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                style={{ width: 50, height: 50 }}
                            >
                                <IconifyIcon icon="tabler:users-group" className="fs-26" />
                            </div>
                            <div>
                                <h6 className="text-muted fw-semibold mb-1 fs-13">นักศึกษาทั้งหมด</h6>
                                <h3 className="mb-0 fw-bold text-dark fs-22">
                                    {stats.total_students} <span className="fs-13 fw-normal text-muted">คน</span>
                                </h3>
                                <small className="text-muted">ในระบบสารสนเทศวิทยาลัย</small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* 2. ทะเบียนประวัติอัปเดตแล้ว */}
                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div
                                className="avatar-md rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                style={{ width: 50, height: 50 }}
                            >
                                <IconifyIcon icon="tabler:id-badge-2" className="fs-26" />
                            </div>
                            <div>
                                <h6 className="text-muted fw-semibold mb-1 fs-13">อัปเดตทะเบียนประวัติแล้ว</h6>
                                <h3 className="mb-0 fw-bold text-success fs-22">
                                    {stats.profiles_updated}{' '}
                                    <span className="fs-13 fw-normal text-muted">
                                        / {stats.total_students} (
                                        {stats.total_students > 0
                                            ? Math.round((stats.profiles_updated / stats.total_students) * 100)
                                            : 0}
                                        %)
                                    </span>
                                </h3>
                                <small className="text-muted">ข้อมูลประวัติสมบูรณ์</small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* 3. เอกสารครบถ้วน */}
                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div
                                className="avatar-md rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                style={{ width: 50, height: 50 }}
                            >
                                <IconifyIcon icon="tabler:file-check" className="fs-26" />
                            </div>
                            <div>
                                <h6 className="text-muted fw-semibold mb-1 fs-13">อัปโหลดเอกสารครบถ้วน</h6>
                                <h3 className="mb-0 fw-bold text-info fs-22">
                                    {stats.documents_completed}{' '}
                                    <span className="fs-13 fw-normal text-muted">
                                        / {stats.total_students} คน
                                    </span>
                                </h3>
                                <small className="text-muted">ครบ 27 รายการมาตรฐาน</small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* 4. กำลังดำเนินการ */}
                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div
                                className="avatar-md rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                style={{ width: 50, height: 50 }}
                            >
                                <IconifyIcon icon="tabler:clock-hour-4" className="fs-26" />
                            </div>
                            <div>
                                <h6 className="text-muted fw-semibold mb-1 fs-13">กำลังดำเนินการ</h6>
                                <h3 className="mb-0 fw-bold text-warning fs-22">
                                    {stats.documents_in_progress}{' '}
                                    <span className="fs-13 fw-normal text-muted">คน</span>
                                </h3>
                                <small className="text-muted">เริ่มอัปโหลดเอกสารแล้ว</small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Filter & Search Bar */}
            <Card className="shadow-sm border-0 mb-4">
                <CardBody className="p-3">
                    <Row className="g-2 align-items-center">
                        {/* Search box */}
                        <Col lg={4} md={12}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0">
                                    <IconifyIcon icon="solar:magnifer-linear" className="fs-16 text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    className="border-start-0 ps-0"
                                    placeholder="ค้นหาชื่อ, รหัสนักศึกษา, เลขบัตร ปชช., อีเมล..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <Button
                                        variant="link"
                                        className="text-muted border-0 p-1 position-absolute end-0 me-2"
                                        style={{ zIndex: 5 }}
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <IconifyIcon icon="solar:close-circle-bold" className="fs-16" />
                                    </Button>
                                )}
                            </InputGroup>
                        </Col>

                        {/* Filter Profile Status */}
                        <Col lg={2} sm={4}>
                            <Form.Select
                                value={filterProfileStatus}
                                onChange={(e) => setFilterProfileStatus(e.target.value)}
                                className="fs-13"
                            >
                                <option value="all">สถานะประวัติ: ทั้งหมด</option>
                                <option value="updated">✓ อัปเดตแล้ว</option>
                                <option value="pending">⏳ ยังไม่อัปเดต</option>
                            </Form.Select>
                        </Col>

                        {/* Filter Document Status */}
                        <Col lg={2} sm={4}>
                            <Form.Select
                                value={filterDocStatus}
                                onChange={(e) => setFilterDocStatus(e.target.value)}
                                className="fs-13"
                            >
                                <option value="all">สถานะเอกสาร: ทั้งหมด</option>
                                <option value="completed">✓ ครบถ้วน (27 ข้อ)</option>
                                <option value="in_progress">⏳ กำลังดำเนินการ</option>
                                <option value="not_started">✕ ยังไม่อัปโหลด</option>
                            </Form.Select>
                        </Col>

                        {/* Filter Class Year */}
                        <Col lg={2} sm={4}>
                            <Form.Select
                                value={filterClassYear}
                                onChange={(e) => setFilterClassYear(e.target.value)}
                                className="fs-13"
                            >
                                <option value="all">ชั้นปี: ทั้งหมด</option>
                                <option value="ปีที่ 1">ชั้นปีที่ 1</option>
                                <option value="ปีที่ 2">ชั้นปีที่ 2</option>
                                <option value="ปีที่ 3">ชั้นปีที่ 3</option>
                                <option value="ปีที่ 4">ชั้นปีที่ 4</option>
                            </Form.Select>
                        </Col>

                        {/* Reset Filters */}
                        <Col lg={2} className="text-lg-end">
                            <Button
                                variant="light"
                                size="sm"
                                onClick={handleResetFilters}
                                className="d-inline-flex align-items-center gap-1 border px-3"
                                title="ล้างตัวกรองทั้งหมด"
                            >
                                <IconifyIcon icon="solar:restart-bold" className="fs-14 text-muted" />
                                <span>ล้างตัวกรอง</span>
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Students Table */}
            <Card className="shadow-sm border-0">
                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <IconifyIcon icon="tabler:users" className="fs-20 text-primary" />
                        <h5 className="mb-0 fw-bold text-dark fs-16">
                            รายชื่อนักศึกษา ({filteredStudents.length} คน)
                        </h5>
                    </div>
                    <div className="text-muted fs-12">
                        คลิก <span className="badge bg-primary-subtle text-primary border">ดูเอกสาร</span> เพื่อดูและจัดการเอกสารของนักศึกษาแต่ละคน
                    </div>
                </div>

                <CardBody className="p-0">
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead className="table-light text-muted fs-13 text-nowrap">
                                <tr>
                                    <th style={{ width: 60 }} className="text-center">#</th>
                                    <th style={{ minWidth: 260 }}>ข้อมูลนักศึกษา</th>
                                    <th style={{ minWidth: 200 }}>สาขา / ชั้นปี / ที่ปรึกษา</th>
                                    <th style={{ minWidth: 180 }} className="text-center">สถานะทะเบียนประวัติ</th>
                                    <th style={{ minWidth: 200 }} className="text-center">สถานะการอัปโหลดเอกสาร</th>
                                    <th style={{ width: 170 }} className="text-center">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5 text-muted">
                                            <div className="avatar-lg mx-auto mb-2 text-muted opacity-50">
                                                <IconifyIcon icon="solar:user-cross-broken" className="display-4" />
                                            </div>
                                            <p className="mb-0 fs-14">ไม่พบข้อมูลนักศึกษาที่ตรงกับเงื่อนไขการค้นหา</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student, idx) => {
                                        const profile = student.profile;
                                        const docStatus = student.document_status;
                                        const profStatus = student.profile_status;

                                        return (
                                            <tr key={student.id} style={{ transition: 'all 0.15s ease' }}>
                                                {/* ลำดับที่ */}
                                                <td className="text-center text-muted fw-semibold">
                                                    {idx + 1}
                                                </td>

                                                {/* ข้อมูลนักศึกษา */}
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src={profile.avatar_path || student.avatar || avatarDefault}
                                                            alt={student.name}
                                                            className="rounded-circle object-fit-cover shadow-sm border flex-shrink-0"
                                                            style={{ width: 44, height: 44 }}
                                                        />
                                                        <div>
                                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                                <span className="fw-bold text-dark fs-14">
                                                                    {profile.title_prefix || ''}
                                                                    {profile.first_name_th || student.name}{' '}
                                                                    {profile.last_name_th || ''}
                                                                </span>
                                                                {profile.student_code && (
                                                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-11 py-0 px-2">
                                                                        รหัส {profile.student_code}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {profile.first_name_en && (
                                                                <div className="text-muted fs-12">
                                                                    {profile.first_name_en} {profile.last_name_en}
                                                                </div>
                                                            )}
                                                            <div className="d-flex align-items-center gap-3 text-muted fs-11 mt-1 flex-wrap">
                                                                <span className="d-inline-flex align-items-center gap-1">
                                                                    <IconifyIcon icon="solar:letter-linear" />
                                                                    {student.email}
                                                                </span>
                                                                {profile.phone && (
                                                                    <span className="d-inline-flex align-items-center gap-1">
                                                                        <IconifyIcon icon="solar:phone-linear" />
                                                                        {profile.phone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* สาขา / ชั้นปี / อาจารย์ที่ปรึกษา */}
                                                <td>
                                                    <div className="fs-13">
                                                        <span className="fw-semibold text-dark d-block">
                                                            {profile.major || 'สาธารณสุขศาสตรบัณฑิต'}
                                                        </span>
                                                        <div className="d-flex align-items-center gap-1 text-muted fs-12 mt-1">
                                                            <span className="badge bg-light text-dark border fs-11">
                                                                {profile.class_year || 'ชั้นปีที่ 2'}
                                                            </span>
                                                            <span className="badge bg-light text-muted border fs-11">
                                                                ปีการศึกษา {profile.academic_year || '2567'}
                                                            </span>
                                                        </div>
                                                        {profile.advisor_name && (
                                                            <small className="text-muted d-block mt-1 fs-11">
                                                                ที่ปรึกษา: {profile.advisor_name}
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* สถานะทะเบียนประวัติ */}
                                                <td className="text-center">
                                                    {profStatus.is_updated ? (
                                                        <div>
                                                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-12 d-inline-flex align-items-center gap-1 mb-1">
                                                                <IconifyIcon icon="solar:check-circle-bold" className="fs-14" />
                                                                อัปเดตแล้ว
                                                            </span>
                                                            <div className="d-flex align-items-center justify-content-center gap-2 mt-1">
                                                                <ProgressBar
                                                                    now={profStatus.completeness}
                                                                    variant={profStatus.completeness >= 80 ? 'success' : 'primary'}
                                                                    style={{ height: '5px', width: '80px' }}
                                                                />
                                                                <span className="fs-11 text-muted fw-semibold">{profStatus.completeness}%</span>
                                                            </div>
                                                            {profStatus.last_updated && (
                                                                <small className="text-muted d-block fs-11 mt-1">
                                                                    {profStatus.last_updated}
                                                                </small>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fs-12 d-inline-flex align-items-center gap-1 mb-1">
                                                                <IconifyIcon icon="solar:clock-circle-bold" className="fs-14" />
                                                                ยังไม่อัปเดต
                                                            </span>
                                                            <small className="text-muted d-block fs-11">
                                                                รอนักศึกษาบันทึกข้อมูล
                                                            </small>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* สถานะการอัปโหลดเอกสาร */}
                                                <td className="text-center">
                                                    <div>
                                                        <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                                                            <span
                                                                className={`badge ${
                                                                    docStatus.is_completed
                                                                        ? 'bg-success text-white'
                                                                        : docStatus.uploaded_count > 0
                                                                        ? 'bg-primary text-white'
                                                                        : 'bg-light text-muted border'
                                                                } fs-12 px-2 py-1 fw-semibold`}
                                                            >
                                                                {docStatus.uploaded_count} / {docStatus.total_count} รายการ
                                                            </span>
                                                            <span className="fs-12 fw-bold text-dark">
                                                                {docStatus.progress_percent}%
                                                            </span>
                                                        </div>

                                                        <ProgressBar
                                                            now={docStatus.progress_percent}
                                                            variant={docStatus.is_completed ? 'success' : 'primary'}
                                                            className="mx-auto"
                                                            style={{ height: '6px', maxWidth: '120px' }}
                                                        />

                                                        <small className="text-muted d-block fs-11 mt-1 text-truncate mx-auto" style={{ maxWidth: 180 }}>
                                                            {docStatus.current_category}
                                                        </small>
                                                    </div>
                                                </td>

                                                {/* การจัดการ (Actions) */}
                                                <td className="text-center">
                                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                                        {/* ปุ่มแก้ไขทะเบียนประวัติ */}
                                                        <Button
                                                            variant="soft-warning"
                                                            size="sm"
                                                            className="btn-icon"
                                                            title="แก้ไขข้อมูลทะเบียนประวัตินักศึกษา"
                                                            onClick={() => handleOpenEdit(student)}
                                                        >
                                                            <IconifyIcon icon="solar:pen-bold" className="fs-16" />
                                                        </Button>

                                                        {/* ปุ่มคลิกเข้าไปดูเอกสารของนักศึกษา */}
                                                        <Link
                                                            href={`/personal-documents?user_id=${student.id}`}
                                                            className="btn btn-sm btn-soft-primary btn-icon"
                                                            title="คลิกเข้าไปดูเอกสารประจำตัวของนักศึกษาคนนี้"
                                                        >
                                                            <IconifyIcon icon="solar:folder-with-files-bold" className="fs-16" />
                                                        </Link>

                                                        {/* ปุ่มดูรายละเอียดสรุป / เช็คลิสต์เอกสาร */}
                                                        <Button
                                                            variant="soft-info"
                                                            size="sm"
                                                            className="btn-icon"
                                                            title="ดูข้อมูลสรุปและเช็คลิสต์เอกสาร"
                                                            onClick={() => handleOpenView(student)}
                                                        >
                                                            <IconifyIcon icon="solar:eye-bold" className="fs-16" />
                                                        </Button>
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

            {/* ========================================================================= */}
            {/* Modal: แก้ไขทะเบียนประวัตินักศึกษา (Admin Edit Modal) */}
            {/* ========================================================================= */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light-subtle py-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <div className="avatar-sm rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                            <IconifyIcon icon="solar:pen-bold" className="fs-18" />
                        </div>
                        <div>
                            <Modal.Title as="h5" className="fw-bold text-dark fs-16 mb-0">
                                แก้ไขทะเบียนประวัตินักศึกษา
                            </Modal.Title>
                            <small className="text-muted">
                                รหัสนักศึกษา: {formData.student_code || '-'} | บัญชีผู้ใช้: {selectedStudent?.name} ({selectedStudent?.email})
                            </small>
                        </div>
                    </div>
                </Modal.Header>

                <Form onSubmit={handleSaveProfile}>
                    <Modal.Body className="p-4">
                        <Tab.Container defaultActiveKey="general">
                            <Nav variant="pills" className="nav-justified bg-light p-1 rounded-3 mb-3">
                                <Nav.Item>
                                    <Nav.Link eventKey="general" className="fs-13 fw-semibold py-1">
                                        <IconifyIcon icon="solar:user-bold" className="me-1" /> ข้อมูลทั่วไป
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="academic" className="fs-13 fw-semibold py-1">
                                        <IconifyIcon icon="solar:square-academic-cap-bold" className="me-1" /> ข้อมูลการศึกษาและการติดต่อ
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="contact" className="fs-13 fw-semibold py-1">
                                        <IconifyIcon icon="solar:home-2-bold" className="me-1" /> ที่อยู่และการติดต่อฉุกเฉิน
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content>
                                {/* Tab 1: ข้อมูลทั่วไป */}
                                <Tab.Pane eventKey="general">
                                    <Row className="g-3">
                                        <Col md={3}>
                                            <Form.Group controlId="editPrefix">
                                                <Form.Label className="fs-13 fw-semibold text-dark">คำนำหน้า</Form.Label>
                                                <Form.Select
                                                    value={formData.title_prefix || 'นาย'}
                                                    onChange={(e) => setFormData({ ...formData, title_prefix: e.target.value })}
                                                >
                                                    <option value="นาย">นาย</option>
                                                    <option value="นางสาว">นางสาว</option>
                                                    <option value="นาง">นาง</option>
                                                    <option value="ดร.">ดร.</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group controlId="editFirstNameTh">
                                                <Form.Label className="fs-13 fw-semibold text-dark">
                                                    ชื่อ (ภาษาไทย) <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.first_name_th || ''}
                                                    onChange={(e) => setFormData({ ...formData, first_name_th: e.target.value })}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={5}>
                                            <Form.Group controlId="editLastNameTh">
                                                <Form.Label className="fs-13 fw-semibold text-dark">
                                                    นามสกุล (ภาษาไทย) <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.last_name_th || ''}
                                                    onChange={(e) => setFormData({ ...formData, last_name_th: e.target.value })}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="editStudentCode">
                                                <Form.Label className="fs-13 fw-semibold text-dark">รหัสนักศึกษา</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.student_code || ''}
                                                    onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                                                    placeholder="เช่น 66010001"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="editNationalId">
                                                <Form.Label className="fs-13 fw-semibold text-dark">เลขประจำตัวประชาชน</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.national_id || ''}
                                                    onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                                                    placeholder="เลขประจำตัวประชาชน 13 หลัก"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group controlId="editGender">
                                                <Form.Label className="fs-13 fw-semibold text-dark">เพศ</Form.Label>
                                                <Form.Select
                                                    value={formData.gender || 'ชาย'}
                                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                >
                                                    <option value="ชาย">ชาย</option>
                                                    <option value="หญิง">หญิง</option>
                                                    <option value="อื่นๆ">อื่นๆ</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group controlId="editBloodGroup">
                                                <Form.Label className="fs-13 fw-semibold text-dark">หมู่โลหิต</Form.Label>
                                                <Form.Select
                                                    value={formData.blood_group || 'B'}
                                                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                                >
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="AB">AB</option>
                                                    <option value="O">O</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group controlId="editReligion">
                                                <Form.Label className="fs-13 fw-semibold text-dark">ศาสนา</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.religion || 'พุทธ'}
                                                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                {/* Tab 2: ข้อมูลการศึกษาและการติดต่อ */}
                                <Tab.Pane eventKey="academic">
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group controlId="editFaculty">
                                                <Form.Label className="fs-13 fw-semibold text-dark">คณะ / สถาบัน</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.faculty || ''}
                                                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="editMajor">
                                                <Form.Label className="fs-13 fw-semibold text-dark">สาขาวิชา</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.major || ''}
                                                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group controlId="editClassYear">
                                                <Form.Label className="fs-13 fw-semibold text-dark">ชั้นปี</Form.Label>
                                                <Form.Select
                                                    value={formData.class_year || 'ชั้นปีที่ 2'}
                                                    onChange={(e) => setFormData({ ...formData, class_year: e.target.value })}
                                                >
                                                    <option value="ชั้นปีที่ 1">ชั้นปีที่ 1</option>
                                                    <option value="ชั้นปีที่ 2">ชั้นปีที่ 2</option>
                                                    <option value="ชั้นปีที่ 3">ชั้นปีที่ 3</option>
                                                    <option value="ชั้นปีที่ 4">ชั้นปีที่ 4</option>
                                                    <option value="สำเร็จการศึกษา">สำเร็จการศึกษา</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group controlId="editAcademicYear">
                                                <Form.Label className="fs-13 fw-semibold text-dark">ปีการศึกษา</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.academic_year || '2567'}
                                                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group controlId="editGpa">
                                                <Form.Label className="fs-13 fw-semibold text-dark">เกรดเฉลี่ยสะสม (GPA)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="4.00"
                                                    value={formData.gpa || ''}
                                                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value ? parseFloat(e.target.value) : null })}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="editAdvisorName">
                                                <Form.Label className="fs-13 fw-semibold text-dark">อาจารย์ที่ปรึกษา</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.advisor_name || ''}
                                                    onChange={(e) => setFormData({ ...formData, advisor_name: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="editStudentStatus">
                                                <Form.Label className="fs-13 fw-semibold text-dark">สถานภาพนักศึกษา</Form.Label>
                                                <Form.Select
                                                    value={formData.student_status || 'กำลังศึกษา'}
                                                    onChange={(e) => setFormData({ ...formData, student_status: e.target.value })}
                                                >
                                                    <option value="กำลังศึกษา">กำลังศึกษา</option>
                                                    <option value="รักษาสภาพ">รักษาสภาพ</option>
                                                    <option value="สำเร็จการศึกษา">สำเร็จการศึกษา</option>
                                                    <option value="พ้นสภาพ">พ้นสภาพ</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="editPhone">
                                                <Form.Label className="fs-13 fw-semibold text-dark">เบอร์โทรศัพท์</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.phone || ''}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="editLineId">
                                                <Form.Label className="fs-13 fw-semibold text-dark">Line ID</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.line_id || ''}
                                                    onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                {/* Tab 3: ที่อยู่และการติดต่อฉุกเฉิน */}
                                <Tab.Pane eventKey="contact">
                                    <Row className="g-3">
                                        <Col md={12}>
                                            <Form.Group controlId="editAddress">
                                                <Form.Label className="fs-13 fw-semibold text-dark">ที่อยู่ตามทะเบียนบ้าน</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={formData.address || ''}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group controlId="editCurrentAddress">
                                                <Form.Label className="fs-13 fw-semibold text-dark">ที่อยู่ปัจจุบัน / หอพัก</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={formData.current_address || ''}
                                                    onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={5}>
                                            <Form.Group controlId="editEmergName">
                                                <Form.Label className="fs-13 fw-semibold text-dark">ผู้ติดต่อฉุกเฉิน</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.emergency_contact_name || ''}
                                                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={3}>
                                            <Form.Group controlId="editEmergRel">
                                                <Form.Label className="fs-13 fw-semibold text-dark">ความสัมพันธ์</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.emergency_relationship || ''}
                                                    onChange={(e) => setFormData({ ...formData, emergency_relationship: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group controlId="editEmergPhone">
                                                <Form.Label className="fs-13 fw-semibold text-dark">เบอร์โทรติดต่อฉุกเฉิน</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.emergency_phone || ''}
                                                    onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Modal.Body>

                    <Modal.Footer className="bg-light-subtle py-2 border-top">
                        <div className="d-flex align-items-center justify-content-between w-100">
                            {selectedStudent && (
                                <Link
                                    href={`/student-profile?user_id=${selectedStudent.id}`}
                                    className="btn btn-sm btn-link text-primary p-0 d-inline-flex align-items-center gap-1"
                                >
                                    <IconifyIcon icon="solar:square-top-down-linear" />
                                    <span>เปิดหน้าฟอร์มทะเบียนประวัติเต็ม</span>
                                </Link>
                            )}
                            <div className="d-flex align-items-center gap-2 ms-auto">
                                <Button variant="light" size="sm" onClick={() => setShowEditModal(false)}>
                                    ยกเลิก
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    type="submit"
                                    disabled={isSaving}
                                    className="d-inline-flex align-items-center gap-1 shadow-sm px-3"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                            <span>กำลังบันทึก...</span>
                                        </>
                                    ) : (
                                        <>
                                            <IconifyIcon icon="solar:diskette-bold" className="fs-16" />
                                            <span>บันทึกการแก้ไข</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* ========================================================================= */}
            {/* Modal: ดูข้อมูลสรุป & เช็คลิสต์เอกสาร (Quick View Modal) */}
            {/* ========================================================================= */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light-subtle py-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <div className="avatar-sm rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                            <IconifyIcon icon="solar:eye-bold" className="fs-18" />
                        </div>
                        <div>
                            <Modal.Title as="h5" className="fw-bold text-dark fs-16 mb-0">
                                สรุปข้อมูลและเอกสารนักศึกษา
                            </Modal.Title>
                            <small className="text-muted">
                                {selectedStudent?.profile.full_name_th || selectedStudent?.name} ({selectedStudent?.email})
                            </small>
                        </div>
                    </div>
                </Modal.Header>

                <Modal.Body className="p-4">
                    {selectedStudent && (
                        <div>
                            {/* Header info */}
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-4">
                                <img
                                    src={selectedStudent.profile.avatar_path || selectedStudent.avatar || avatarDefault}
                                    alt={selectedStudent.name}
                                    className="rounded-circle border shadow-sm object-fit-cover flex-shrink-0"
                                    style={{ width: 60, height: 60 }}
                                />
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <h5 className="mb-0 fw-bold text-dark">
                                            {selectedStudent.profile.title_prefix || ''}
                                            {selectedStudent.profile.first_name_th || selectedStudent.name}{' '}
                                            {selectedStudent.profile.last_name_th || ''}
                                        </h5>
                                        <span className="badge bg-primary fs-12 px-2 py-1">
                                            รหัส {selectedStudent.profile.student_code || '-'}
                                        </span>
                                    </div>
                                    <div className="text-muted fs-13 mt-1">
                                        {selectedStudent.profile.major || 'สาธารณสุขศาสตรบัณฑิต'} • {selectedStudent.profile.class_year || 'ชั้นปีที่ 2'} (ปีการศึกษา {selectedStudent.profile.academic_year || '2567'})
                                    </div>
                                    <div className="text-muted fs-12 mt-1">
                                        อีเมล: {selectedStudent.email} {selectedStudent.profile.phone ? `• โทร: ${selectedStudent.profile.phone}` : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Status overview cards */}
                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <div className="p-3 border rounded-3 bg-white h-100">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="fw-bold text-dark fs-13">สถานะทะเบียนประวัติ</span>
                                            {selectedStudent.profile_status.is_updated ? (
                                                <Badge bg="success-subtle" className="text-success border border-success-subtle">
                                                    ✓ อัปเดตแล้ว
                                                </Badge>
                                            ) : (
                                                <Badge bg="warning-subtle" className="text-warning border border-warning-subtle">
                                                    ⏳ ยังไม่อัปเดต
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between text-muted fs-12 mb-1">
                                            <span>ความสมบูรณ์ของข้อมูล</span>
                                            <span className="fw-bold">{selectedStudent.profile_status.completeness}%</span>
                                        </div>
                                        <ProgressBar now={selectedStudent.profile_status.completeness} variant="success" style={{ height: '6px' }} />
                                    </div>
                                </Col>

                                <Col md={6}>
                                    <div className="p-3 border rounded-3 bg-white h-100">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="fw-bold text-dark fs-13">สถานะการอัปโหลดเอกสาร</span>
                                            <Badge bg={selectedStudent.document_status.is_completed ? 'success' : 'primary'}>
                                                {selectedStudent.document_status.uploaded_count} / {selectedStudent.document_status.total_count} ข้อ
                                            </Badge>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between text-muted fs-12 mb-1">
                                            <span>ความคืบหน้า</span>
                                            <span className="fw-bold">{selectedStudent.document_status.progress_percent}%</span>
                                        </div>
                                        <ProgressBar now={selectedStudent.document_status.progress_percent} variant="primary" style={{ height: '6px' }} />
                                    </div>
                                </Col>
                            </Row>

                            {/* Document Checklist Accordion / List */}
                            <div className="border rounded-3 overflow-hidden">
                                <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
                                    <span className="fw-bold text-dark fs-14">
                                        เช็คลิสต์เอกสารมาตรฐาน (27 รายการ)
                                    </span>
                                    <Link
                                        href={`/personal-documents?user_id=${selectedStudent.id}`}
                                        className="btn btn-sm btn-primary py-0 px-2 fs-12 d-inline-flex align-items-center gap-1"
                                    >
                                        <IconifyIcon icon="solar:folder-with-files-bold" />
                                        <span>เปิดหน้าระบบเอกสารของนักศึกษา</span>
                                    </Link>
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <Table size="sm" hover className="mb-0 align-middle">
                                        <tbody>
                                            {standard_documents.map((stdDoc) => {
                                                const uploaded = selectedStudent.personal_documents.find(d => d.item_no === stdDoc.item_no);
                                                return (
                                                    <tr key={stdDoc.item_no}>
                                                        <td style={{ width: 40 }} className="text-center">
                                                            <div
                                                                className={`rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-11 mx-auto ${
                                                                    uploaded ? 'bg-success' : 'bg-light text-muted border'
                                                                }`}
                                                                style={{ width: 24, height: 24 }}
                                                            >
                                                                {uploaded ? '✓' : stdDoc.item_no}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="fs-13">
                                                                <span className={uploaded ? 'fw-bold text-dark' : 'text-muted'}>
                                                                    {stdDoc.title}
                                                                </span>
                                                                {stdDoc.required && (
                                                                    <span className="badge bg-danger-subtle text-danger fs-10 py-0 px-1 border ms-1">
                                                                        จำเป็น
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td style={{ width: 140 }} className="text-end pe-3">
                                                            {uploaded ? (
                                                                <div className="d-inline-flex align-items-center gap-1">
                                                                    <span className="badge bg-success-subtle text-success border border-success-subtle fs-11 py-0 px-2">
                                                                        อัปโหลดแล้ว
                                                                    </span>
                                                                    <a
                                                                        href={uploaded.view_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-sm btn-soft-primary p-0 px-1"
                                                                        title="เปิดดู PDF"
                                                                    >
                                                                        <IconifyIcon icon="solar:eye-bold" className="fs-14" />
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <span className="badge bg-light text-muted border fs-11 py-0 px-2">
                                                                    รอดำเนินการ
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
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer className="bg-light-subtle py-2 border-top">
                    {selectedStudent && (
                        <div className="d-flex align-items-center justify-content-between w-100">
                            <Link
                                href={`/personal-documents?user_id=${selectedStudent.id}`}
                                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                            >
                                <IconifyIcon icon="solar:folder-with-files-bold" className="fs-16" />
                                <span>คลิกเข้าไปดูเอกสารของนักศึกษา</span>
                            </Link>
                            <Button variant="light" size="sm" onClick={() => setShowViewModal(false)}>
                                ปิด
                            </Button>
                        </div>
                    )}
                </Modal.Footer>
            </Modal>
        </MainLayout>
    );
};

export default StudentManagementPage;
