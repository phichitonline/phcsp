import React, { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
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
    Nav,
    Tab,
    InputGroup
} from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';

export interface StudentProfileData {
    id: number;
    user_id: number;
    student_code: string | null;
    national_id: string | null;
    title_prefix: string | null;
    first_name_th: string;
    last_name_th: string;
    first_name_en: string | null;
    last_name_en: string | null;
    gender: string | null;
    birth_date: string | null;
    blood_group: string | null;
    religion: string | null;
    ethnicity: string | null;
    nationality: string | null;
    phone: string | null;
    line_id: string | null;
    faculty: string | null;
    major: string | null;
    academic_year: string | null;
    class_year: string | null;
    advisor_name: string | null;
    student_status: string;
    gpa: number | null;
    practicum_hospital: string | null;
    address: string | null;
    current_address: string | null;
    emergency_contact_name: string | null;
    emergency_relationship: string | null;
    emergency_phone: string | null;
    health_conditions: string | null;
    avatar_path: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar?: string | null;
        role?: string;
    } | null;
}

export interface PersonalDocItem {
    id: number;
    item_no?: number | null;
    title: string;
    file_name: string;
    file_size: number;
    view_url?: string;
    created_at: string;
}

export interface ThesisCategoryItem {
    id: number;
    category_no: number;
    name: string;
    suggested_name?: string | null;
    description?: string | null;
    item_reference?: string | null;
}

export interface StandardDocItem {
    id?: number;
    item_no: number;
    title: string;
    description?: string | null;
    required: boolean;
    thesis_category_id?: number | null;
    thesis_category?: ThesisCategoryItem | null;
}

export interface CurriculumOption {
    id: number;
    code: string;
    name: string;
    degree_level?: string | null;
}

interface PageProps {
    student_profile: StudentProfileData;
    profile_user: {
        id: number;
        name: string;
        email: string;
        avatar?: string | null;
        role?: string;
        pid?: string | null;
    };
    auth_user: {
        id: number;
        name: string;
        email: string;
        role?: string;
    };
    is_admin?: boolean;
    personal_documents?: PersonalDocItem[];
    standard_documents?: StandardDocItem[];
    all_students?: StudentProfileData[];
    curriculums?: CurriculumOption[];
}

const StudentProfilePage = ({
    student_profile,
    profile_user,
    auth_user,
    is_admin = false,
    personal_documents = [],
    standard_documents = [],
    all_students = [],
    curriculums = [],
}: PageProps) => {
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');

    // Form data for editing student profile
    const [formData, setFormData] = useState({
        student_code: student_profile?.student_code || '',
        national_id: student_profile?.national_id || profile_user?.pid || '',
        title_prefix: student_profile?.title_prefix || 'นาย',
        first_name_th: student_profile?.first_name_th || '',
        last_name_th: student_profile?.last_name_th || '',
        first_name_en: student_profile?.first_name_en || '',
        last_name_en: student_profile?.last_name_en || '',
        gender: student_profile?.gender || 'ชาย',
        birth_date: student_profile?.birth_date ? String(student_profile.birth_date).substring(0, 10) : '',
        blood_group: student_profile?.blood_group || 'B',
        religion: student_profile?.religion || 'พุทธ',
        ethnicity: student_profile?.ethnicity || 'ไทย',
        nationality: student_profile?.nationality || 'ไทย',
        phone: student_profile?.phone || '',
        line_id: student_profile?.line_id || '',
        faculty: student_profile?.faculty || 'วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี',
        major: student_profile?.major || (curriculums.length > 0 ? curriculums[0].name : 'หลักสูตรสาธารณสุขศาสตรมหาบัณฑิต (ส.ม.)'),
        academic_year: student_profile?.academic_year || '2567',
        class_year: student_profile?.class_year || 'ชั้นปีที่ 1',
        advisor_name: student_profile?.advisor_name || '',
        student_status: student_profile?.student_status || 'กำลังศึกษา',
        gpa: student_profile?.gpa ? String(student_profile.gpa) : '3.50',
        practicum_hospital: student_profile?.practicum_hospital || '',
        address: student_profile?.address || '',
        current_address: student_profile?.current_address || '',
        emergency_contact_name: student_profile?.emergency_contact_name || '',
        emergency_relationship: student_profile?.emergency_relationship || '',
        emergency_phone: student_profile?.emergency_phone || '',
        health_conditions: student_profile?.health_conditions || '',
    });

    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Calculate age from birth_date
    const calculateAge = (birthDateStr: string | null) => {
        if (!birthDateStr) return '-';
        const birth = new Date(birthDateStr);
        if (isNaN(birth.getTime())) return '-';
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return `${age} ปี`;
    };

    // Format Thai Date
    const formatThaiDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Map uploaded personal documents by item_no
    const uploadedDocsMap: { [key: number]: PersonalDocItem } = {};
    personal_documents.forEach((doc) => {
        if (doc.item_no) {
            uploadedDocsMap[doc.item_no] = doc;
        }
    });

    // Calculate completeness score
    const calculateCompleteness = () => {
        let filled = 0;
        const total = 14;
        if (student_profile.student_code) filled++;
        if (student_profile.national_id) filled++;
        if (student_profile.first_name_th && student_profile.last_name_th) filled++;
        if (student_profile.birth_date) filled++;
        if (student_profile.blood_group) filled++;
        if (student_profile.phone) filled++;
        if (student_profile.major) filled++;
        if (student_profile.class_year) filled++;
        if (student_profile.advisor_name) filled++;
        if (student_profile.gpa) filled++;
        if (student_profile.address) filled++;
        if (student_profile.emergency_contact_name) filled++;
        if (student_profile.emergency_phone) filled++;
        if (student_profile.avatar_path || profile_user.avatar) filled++;
        return Math.round((filled / total) * 100);
    };

    const completeness = calculateCompleteness();
    const uploadedDocsCount = personal_documents.length;
    const totalStandardDocs = standard_documents.length || 27;

    // Handle avatar file selection
    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'ชนิดไฟล์ไม่ถูกต้อง',
                    text: 'กรุณาเลือกไฟล์รูปภาพ (JPEG, PNG, WebP)',
                    confirmButtonColor: '#465dff',
                });
                return;
            }
            if (file.size > 3 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'ขนาดไฟล์เกินกำหนด',
                    text: 'รูปถ่ายต้องมีขนาดไม่เกิน 3 MB',
                    confirmButtonColor: '#465dff',
                });
                return;
            }
            setNewAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Handle save profile
    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const submitData = new FormData();
        Object.entries(formData).forEach(([key, val]) => {
            submitData.append(key, val !== null && val !== undefined ? String(val) : '');
        });

        if (profile_user?.id) {
            submitData.append('user_id', String(profile_user.id));
        }

        if (newAvatarFile) {
            submitData.append('avatar', newAvatarFile);
        }

        router.post('/student-profile', submitData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                setShowEditModal(false);
                setNewAvatarFile(null);
                setAvatarPreview(null);
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ!',
                    text: 'ข้อมูลทะเบียนประวัตินักศึกษาได้รับการอัปเดตเรียบร้อยแล้ว',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
            onError: (err) => {
                setIsSaving(false);
                const firstErr = Object.values(err)[0] || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: String(firstErr),
                    confirmButtonColor: '#465dff',
                });
            },
        });
    };

    // Filter students for admin directory
    const filteredStudents = all_students.filter((st) => {
        if (!studentSearch.trim()) return true;
        const q = studentSearch.toLowerCase().trim();
        const code = (st.student_code || '').toLowerCase();
        const nameTh = `${st.first_name_th} ${st.last_name_th}`.toLowerCase();
        const major = (st.major || '').toLowerCase();
        const id = (st.national_id || '').toLowerCase();
        return code.includes(q) || nameTh.includes(q) || major.includes(q) || id.includes(q);
    });

    const displayAvatar = avatarPreview
        || (student_profile.avatar_path ? `/storage/${student_profile.avatar_path}` : null)
        || profile_user?.avatar
        || '/images/users/avatar-1.jpg';

    return (
        <MainLayout>
            <PageTitle title="ทะเบียนประวัตินักศึกษา" subTitle="ระบบจัดเก็บข้อมูลประวัตินักศึกษาและเอกสารประจำตัว" />

            {/* Profile Header Banner */}
            <Card className="shadow-sm border-0 overflow-hidden mb-4 position-relative">
                <div
                    style={{
                        height: '140px',
                        background: 'linear-gradient(135deg, #465dff 0%, #1e3a8a 50%, #0ea5e9 100%)',
                        position: 'relative',
                    }}
                >
                    <div className="position-absolute end-0 bottom-0 p-3 opacity-25">
                        <IconifyIcon icon="solar:diploma-bold-duotone" className="text-white" style={{ fontSize: '110px' }} />
                    </div>
                </div>

                <CardBody className="pt-0 px-4 pb-4">
                    <Row className="align-items-end">
                        <Col lg={8} md={12}>
                            <div className="d-flex flex-wrap align-items-end gap-3" style={{ marginTop: '-60px' }}>
                                {/* Avatar */}
                                <div className="position-relative">
                                    <img
                                        src={displayAvatar}
                                        alt={student_profile.first_name_th}
                                        className="rounded-circle border border-4 border-white shadow bg-white"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            (e.target as HTMLElement).setAttribute('src', 'https://ui-avatars.com/api/?name=' + encodeURIComponent(student_profile.first_name_th || 'Student') + '&background=465dff&color=fff&size=128');
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0 shadow-sm p-1 d-flex align-items-center justify-content-center"
                                        style={{ width: '32px', height: '32px' }}
                                        title="เปลี่ยนรูปประจำตัว"
                                    >
                                        <IconifyIcon icon="solar:camera-bold" className="fs-15 text-white" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => {
                                            handleAvatarSelect(e);
                                            setShowEditModal(true);
                                        }}
                                    />
                                </div>

                                {/* Main Titles */}
                                <div className="flex-grow-1 pb-2">
                                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                        <h3 className="fw-bold text-dark mb-0 fs-22">
                                            {student_profile.title_prefix} {student_profile.first_name_th} {student_profile.last_name_th}
                                        </h3>
                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-12 px-2 py-1">
                                            รหัส: {student_profile.student_code || 'ยังไม่กำหนด'}
                                        </span>
                                        <span className={`badge ${student_profile.student_status === 'กำลังศึกษา' ? 'bg-success' : 'bg-secondary'} text-white fs-12 px-2 py-1`}>
                                            ● {student_profile.student_status}
                                        </span>
                                    </div>
                                    <p className="text-muted mb-1 fs-14">
                                        {student_profile.first_name_en} {student_profile.last_name_en}
                                        <span className="mx-2">•</span>
                                        <span className="fw-semibold text-dark">{student_profile.major}</span>
                                        <span className="mx-2">•</span>
                                        <span>{student_profile.class_year}</span>
                                    </p>
                                    <small className="text-muted d-flex align-items-center gap-2 flex-wrap">
                                        <span><IconifyIcon icon="solar:letter-linear" className="me-1" />{profile_user?.email}</span>
                                        <span>•</span>
                                        <span><IconifyIcon icon="solar:phone-linear" className="me-1" />{student_profile.phone || 'ยังไม่ระบุเบอร์โทร'}</span>
                                        <span>•</span>
                                        <span><IconifyIcon icon="solar:buildings-2-linear" className="me-1" />{student_profile.faculty}</span>
                                    </small>
                                </div>
                            </div>
                        </Col>

                        {/* Action Buttons */}
                        <Col lg={4} md={12} className="text-lg-end mt-3 mt-lg-0 pb-2">
                            <div className="d-flex justify-content-lg-end gap-2 flex-wrap">
                                <Button
                                    variant="primary"
                                    className="d-inline-flex align-items-center gap-1 shadow-sm px-3"
                                    onClick={() => setShowEditModal(true)}
                                >
                                    <IconifyIcon icon="solar:pen-new-square-bold" className="fs-16" />
                                    <span>แก้ไขข้อมูลทะเบียนประวัติ</span>
                                </Button>

                                <a
                                    href="/personal-documents"
                                    className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                                >
                                    <IconifyIcon icon="tabler:id-badge-2" className="fs-16" />
                                    <span>เอกสารประจำตัว ({uploadedDocsCount}/{totalStandardDocs})</span>
                                </a>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Overview Metric Cards */}
            <Row className="g-3 mb-4">
                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="solar:user-check-bold-duotone" className="fs-24" />
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="text-muted fs-12 fw-semibold">ความสมบูรณ์ของประวัติ</span>
                                    <span className="badge bg-primary fs-11">{completeness}%</span>
                                </div>
                                <h4 className="fw-bold mb-2 text-dark">{completeness === 100 ? 'ครบถ้วนสมบูรณ์' : 'กรอกแล้ว ' + completeness + '%'}</h4>
                                <ProgressBar now={completeness} variant={completeness === 100 ? 'success' : 'primary'} style={{ height: '5px' }} />
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="solar:file-check-bold-duotone" className="fs-24" />
                            </div>
                            <div>
                                <span className="text-muted fs-12 fw-semibold">เอกสารประจำตัวที่อัปโหลด</span>
                                <h4 className="fw-bold mb-0 text-dark">
                                    {uploadedDocsCount} <span className="fs-13 fw-normal text-muted">/ {totalStandardDocs} รายการ</span>
                                </h4>
                                <small className="text-success">
                                    {uploadedDocsCount >= totalStandardDocs ? '✓ ครบทุกเอกสารมาตรฐาน' : `รออัปโหลดอีก ${totalStandardDocs - uploadedDocsCount} รายการ`}
                                </small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="solar:chart-square-bold-duotone" className="fs-24" />
                            </div>
                            <div>
                                <span className="text-muted fs-12 fw-semibold">เกรดเฉลี่ยสะสม (GPAX)</span>
                                <h4 className="fw-bold mb-0 text-dark">
                                    {student_profile.gpa ? Number(student_profile.gpa).toFixed(2) : '-'}
                                </h4>
                                <small className="text-muted">ปีการศึกษา {student_profile.academic_year || '2567'}</small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="solar:hospital-bold-duotone" className="fs-24" />
                            </div>
                            <div className="overflow-hidden">
                                <span className="text-muted fs-12 fw-semibold">แหล่งฝึกปฏิบัติงาน</span>
                                <h6 className="fw-bold mb-0 text-dark text-truncate" title={student_profile.practicum_hospital || 'ยังไม่กำหนด'}>
                                    {student_profile.practicum_hospital || 'ยังไม่กำหนด'}
                                </h6>
                                <small className="text-muted">อาจารย์ที่ปรึกษา: {student_profile.advisor_name || '-'}</small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Main Tabs Navigation */}
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'personal')}>
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom p-0">
                        <Nav variant="tabs" className="nav-bordered px-3 pt-2">
                            <Nav.Item>
                                <Nav.Link eventKey="personal" className="d-flex align-items-center gap-2 py-3 px-3 fw-semibold">
                                    <IconifyIcon icon="solar:user-id-bold-duotone" className="fs-18" />
                                    <span>ข้อมูลประวัติส่วนตัว</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="academic" className="d-flex align-items-center gap-2 py-3 px-3 fw-semibold">
                                    <IconifyIcon icon="solar:diploma-bold-duotone" className="fs-18" />
                                    <span>ข้อมูลการศึกษาและฝึกงาน</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="address" className="d-flex align-items-center gap-2 py-3 px-3 fw-semibold">
                                    <IconifyIcon icon="solar:home-smile-bold-duotone" className="fs-18" />
                                    <span>ที่อยู่และติดต่อฉุกเฉิน</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="documents" className="d-flex align-items-center gap-2 py-3 px-3 fw-semibold">
                                    <IconifyIcon icon="solar:folder-check-bold-duotone" className="fs-18" />
                                    <span>เอกสารประจำตัว ({uploadedDocsCount}/{totalStandardDocs})</span>
                                </Nav.Link>
                            </Nav.Item>
                            {is_admin && (
                                <Nav.Item>
                                    <Nav.Link eventKey="all_students" className="d-flex align-items-center gap-2 py-3 px-3 fw-semibold text-warning">
                                        <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="fs-18" />
                                        <span>ทำเนียบนักศึกษาทั้งหมด (Admin)</span>
                                    </Nav.Link>
                                </Nav.Item>
                            )}
                        </Nav>
                    </Card.Header>

                    <CardBody className="p-4">
                        <Tab.Content>
                            {/* Tab 1: ข้อมูลส่วนตัว */}
                            <Tab.Pane eventKey="personal">
                                <Row className="g-4">
                                    <Col lg={6}>
                                        <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                                            <IconifyIcon icon="solar:user-bold-duotone" className="text-primary fs-20" />
                                            ข้อมูลระบุตัวตน
                                        </h5>
                                        <Table borderless responsive className="mb-0 fs-14">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted fw-semibold" style={{ width: 180 }}>คำนำหน้า - ชื่อ - สกุล (ไทย):</td>
                                                    <td className="fw-bold text-dark">{student_profile.title_prefix} {student_profile.first_name_th} {student_profile.last_name_th}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">ชื่อ - สกุล (อังกฤษ):</td>
                                                    <td className="text-dark">{student_profile.first_name_en || '-'} {student_profile.last_name_en || ''}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">เลขบัตรประจำตัวประชาชน:</td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border px-2 py-1 fs-13 font-monospace">
                                                            {student_profile.national_id || profile_user.pid || 'ยังไม่ระบุ'}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">เพศ:</td>
                                                    <td className="text-dark">{student_profile.gender || '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">วัน/เดือน/ปี เกิด:</td>
                                                    <td className="text-dark">
                                                        {formatThaiDate(student_profile.birth_date)}
                                                        {student_profile.birth_date && (
                                                            <span className="text-muted ms-2">(อายุ {calculateAge(student_profile.birth_date)})</span>
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">หมู่เลือด:</td>
                                                    <td>
                                                        <Badge bg="danger-subtle" className="text-danger border border-danger-subtle fs-12 px-2">
                                                            {student_profile.blood_group || 'ไม่ระบุ'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>

                                    <Col lg={6}>
                                        <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                                            <IconifyIcon icon="solar:phone-bold-duotone" className="text-primary fs-20" />
                                            สัญชาติ ข้อมูลติดต่อ และสุขภาพ
                                        </h5>
                                        <Table borderless responsive className="mb-0 fs-14">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted fw-semibold" style={{ width: 180 }}>สัญชาติ / เชื้อชาติ:</td>
                                                    <td className="text-dark">{student_profile.nationality || 'ไทย'} / {student_profile.ethnicity || 'ไทย'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">ศาสนา:</td>
                                                    <td className="text-dark">{student_profile.religion || 'พุทธ'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">เบอร์โทรศัพท์:</td>
                                                    <td className="fw-bold text-primary">{student_profile.phone || '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">Line ID:</td>
                                                    <td className="text-dark">{student_profile.line_id || '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">อีเมลบัญชีผู้ใช้งาน:</td>
                                                    <td className="text-dark">{profile_user.email}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">โรคประจำตัว / ประวัติการแพ้:</td>
                                                    <td>
                                                        <span className="text-danger fw-medium">
                                                            {student_profile.health_conditions || 'ไม่มีข้อมูลโรคประจำตัวหรือประวัติแพ้'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            {/* Tab 2: ข้อมูลการศึกษาและการฝึกงาน */}
                            <Tab.Pane eventKey="academic">
                                <Row className="g-4">
                                    <Col lg={6}>
                                        <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                                            <IconifyIcon icon="solar:diploma-verified-bold-duotone" className="text-primary fs-20" />
                                            ข้อมูลหลักสูตรและการศึกษา
                                        </h5>
                                        <Table borderless responsive className="mb-0 fs-14">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted fw-semibold" style={{ width: 180 }}>สถาบันการศึกษา:</td>
                                                    <td className="fw-bold text-dark">{student_profile.faculty || '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">สาขาวิชา / หลักสูตร:</td>
                                                    <td className="fw-bold text-primary">{student_profile.major || '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">รหัสนักศึกษา:</td>
                                                    <td>
                                                        <span className="badge bg-primary fs-13 font-monospace px-2 py-1">
                                                            {student_profile.student_code || 'ยังไม่กำหนด'}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">ปีการศึกษาที่เข้าศึกษา / รุ่น:</td>
                                                    <td className="text-dark">{student_profile.academic_year || '2567'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">ชั้นปีปัจจุบัน:</td>
                                                    <td>
                                                        <Badge bg="info-subtle" className="text-info border border-info-subtle fs-12 px-2">
                                                            {student_profile.class_year || 'ชั้นปีที่ 1'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">สถานะภาพนักศึกษา:</td>
                                                    <td>
                                                        <Badge bg={student_profile.student_status === 'กำลังศึกษา' ? 'success' : 'secondary'} className="fs-12 px-2">
                                                            {student_profile.student_status || 'กำลังศึกษา'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>

                                    <Col lg={6}>
                                        <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                                            <IconifyIcon icon="solar:hospital-bold-duotone" className="text-primary fs-20" />
                                            ผลการเรียน แหล่งฝึกงาน และที่ปรึกษา
                                        </h5>
                                        <Table borderless responsive className="mb-0 fs-14">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted fw-semibold" style={{ width: 180 }}>เกรดเฉลี่ยสะสม (GPAX):</td>
                                                    <td>
                                                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle fs-14 fw-bold px-3 py-1">
                                                            {student_profile.gpa ? Number(student_profile.gpa).toFixed(2) : '3.50'}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">อาจารย์ที่ปรึกษา:</td>
                                                    <td className="fw-bold text-dark">{student_profile.advisor_name || 'ยังไม่ระบุอาจารย์ที่ปรึกษา'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">แหล่งฝึกปฏิบัติงาน / โรงพยาบาล:</td>
                                                    <td className="fw-bold text-info">{student_profile.practicum_hospital || 'ยังไม่ระบุแหล่งฝึกปฏิบัติงาน'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">บันทึกประวัติเมื่อ:</td>
                                                    <td className="text-muted fs-13">{formatThaiDate(student_profile.created_at)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">ปรับปรุงข้อมูลล่าสุด:</td>
                                                    <td className="text-muted fs-13">{formatThaiDate(student_profile.updated_at)}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            {/* Tab 3: ที่อยู่และติดต่อฉุกเฉิน */}
                            <Tab.Pane eventKey="address">
                                <Row className="g-4">
                                    <Col lg={6}>
                                        <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                                            <IconifyIcon icon="solar:home-bold-duotone" className="text-primary fs-20" />
                                            ข้อมูลที่อยู่อาศัย
                                        </h5>
                                        <div className="mb-3">
                                            <label className="text-muted fw-semibold fs-13 d-block mb-1">ที่อยู่ตามทะเบียนบ้าน:</label>
                                            <div className="p-3 bg-light rounded-3 border fs-14 text-dark">
                                                {student_profile.address || 'ยังไม่มีการระบุที่อยู่ตามทะเบียนบ้าน'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-muted fw-semibold fs-13 d-block mb-1">ที่อยู่ปัจจุบัน / หอพักนักศึกษา:</label>
                                            <div className="p-3 bg-light rounded-3 border fs-14 text-dark">
                                                {student_profile.current_address || 'ยังไม่มีการระบุที่อยู่ปัจจุบัน'}
                                            </div>
                                        </div>
                                    </Col>

                                    <Col lg={6}>
                                        <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                                            <IconifyIcon icon="solar:shield-warning-bold-duotone" className="text-danger fs-20" />
                                            ผู้ติดต่อกรณีฉุกเฉิน
                                        </h5>
                                        <Table borderless responsive className="mb-0 fs-14">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted fw-semibold" style={{ width: 180 }}>ชื่อผู้ติดต่อฉุกเฉิน:</td>
                                                    <td className="fw-bold text-dark">{student_profile.emergency_contact_name || 'ยังไม่ระบุ'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">ความสัมพันธ์:</td>
                                                    <td className="text-dark">{student_profile.emergency_relationship || 'ผู้ปกครอง'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">เบอร์โทรติดต่อฉุกเฉิน:</td>
                                                    <td>
                                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle fs-14 px-3 py-1 fw-bold">
                                                            {student_profile.emergency_phone || 'ยังไม่ระบุเบอร์โทรฉุกเฉิน'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            {/* Tab 4: เอกสารประจำตัว */}
                            <Tab.Pane eventKey="documents">
                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                    <div>
                                        <h5 className="fw-bold text-dark mb-1">
                                            สถานะการส่งเอกสารประจำตัวตามมาตรฐาน
                                        </h5>
                                        <small className="text-muted">
                                            แสดงความคืบหน้าการส่งเอกสาร 27 รายการของนักศึกษา
                                        </small>
                                    </div>
                                    <a href="/personal-documents" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1">
                                        <IconifyIcon icon="solar:upload-track-2-bold" className="fs-16" />
                                        <span>ไปยังหน้าอัปโหลดเอกสารประจำตัว</span>
                                    </a>
                                </div>

                                <div className="table-responsive">
                                    <Table hover className="align-middle mb-0">
                                        <thead className="bg-light text-muted fs-12 text-uppercase">
                                            <tr>
                                                <th style={{ width: 70 }} className="text-center">ลำดับ</th>
                                                <th>ชื่อเอกสารมาตรฐาน</th>
                                                <th style={{ width: 120 }} className="text-center">ประเภท</th>
                                                <th style={{ minWidth: 160 }}>สถานะการอัปโหลด</th>
                                                <th style={{ width: 120 }} className="text-center">การดำเนินการ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {standard_documents.map((stdDoc) => {
                                                const uploaded = uploadedDocsMap[stdDoc.item_no];
                                                return (
                                                    <tr key={stdDoc.item_no}>
                                                        <td className="text-center fw-bold text-muted">
                                                            {stdDoc.item_no}
                                                        </td>
                                                        <td>
                                                            <div className="fw-semibold text-dark fs-14">
                                                                {stdDoc.title}
                                                            </div>
                                                            {stdDoc.thesis_category && (
                                                                <div className="d-flex align-items-center gap-1 my-1 flex-wrap">
                                                                    <span
                                                                        className="badge bg-primary-subtle text-primary border border-primary-subtle fs-11 py-0 px-2 d-inline-flex align-items-center gap-1"
                                                                        title={stdDoc.thesis_category.description || ''}
                                                                    >
                                                                        <IconifyIcon icon="solar:folder-with-files-bold" className="fs-12" />
                                                                        หมวด {stdDoc.thesis_category.category_no}: {stdDoc.thesis_category.name}
                                                                    </span>
                                                                    {stdDoc.thesis_category.suggested_name && (
                                                                        <span className="text-muted fs-11">
                                                                            (เสนอแนะ: {stdDoc.thesis_category.suggested_name})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {stdDoc.description && (
                                                                <small className="text-muted d-block">{stdDoc.description}</small>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {stdDoc.required ? (
                                                                <Badge bg="danger-subtle" className="text-danger border border-danger-subtle">
                                                                    จำเป็น
                                                                </Badge>
                                                            ) : (
                                                                <Badge bg="light" className="text-muted border">
                                                                    ทางเลือก
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {uploaded ? (
                                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-12 d-inline-flex align-items-center gap-1">
                                                                    <IconifyIcon icon="solar:check-circle-bold" className="fs-14" />
                                                                    อัปโหลดแล้ว ({uploaded.file_name})
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-secondary-subtle text-secondary border px-2 py-1 fs-12 d-inline-flex align-items-center gap-1">
                                                                    <IconifyIcon icon="solar:clock-circle-linear" className="fs-14" />
                                                                    ยังไม่ได้อัปโหลด
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {uploaded ? (
                                                                <a
                                                                    href={uploaded.view_url || `/personal-documents/${uploaded.id}/view`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm btn-soft-primary btn-icon"
                                                                    title="เปิดดูเอกสาร PDF"
                                                                >
                                                                    <IconifyIcon icon="solar:eye-bold" className="fs-15" />
                                                                </a>
                                                            ) : (
                                                                <a
                                                                    href="/personal-documents"
                                                                    className="btn btn-sm btn-outline-primary btn-icon"
                                                                    title="คลิกเพื่อไปอัปโหลด"
                                                                >
                                                                    <IconifyIcon icon="solar:upload-track-2-bold" className="fs-15" />
                                                                </a>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </Tab.Pane>

                            {/* Tab 5: ทำเนียบนักศึกษาทั้งหมด (Admin Only) */}
                            {is_admin && (
                                <Tab.Pane eventKey="all_students">
                                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                        <div>
                                            <h5 className="fw-bold text-dark mb-1">
                                                ทำเนียบประวัตินักศึกษาทั้งหมด ({all_students.length} รายการ)
                                            </h5>
                                            <small className="text-muted">
                                                สามารถคลิกเลือกนักศึกษาเพื่อดูข้อมูลทะเบียนประวัติและเอกสารของแต่ละบุคคลได้
                                            </small>
                                        </div>
                                        <div style={{ minWidth: 260 }}>
                                            <InputGroup size="sm">
                                                <InputGroup.Text className="bg-light">
                                                    <IconifyIcon icon="solar:magnifer-linear" className="text-muted" />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="ค้นหารหัสนักศึกษา, ชื่อ-สกุล..."
                                                    value={studentSearch}
                                                    onChange={(e) => setStudentSearch(e.target.value)}
                                                />
                                            </InputGroup>
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <Table hover className="align-middle mb-0">
                                            <thead className="bg-light text-muted fs-12 text-uppercase">
                                                <tr>
                                                    <th style={{ width: 60 }} className="text-center">#</th>
                                                    <th>รหัสนักศึกษา</th>
                                                    <th>ชื่อ - นามสกุล</th>
                                                    <th>สาขาวิชา / ชั้นปี</th>
                                                    <th>สถานะ</th>
                                                    <th>อาจารย์ที่ปรึกษา</th>
                                                    <th style={{ width: 140 }} className="text-center">การดำเนินการ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredStudents.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="text-center py-4 text-muted">
                                                            ไม่พบข้อมูลนักศึกษาที่ค้นหา
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredStudents.map((st, i) => (
                                                        <tr
                                                            key={st.id}
                                                            className={st.user_id === profile_user.id ? 'table-primary-subtle' : ''}
                                                        >
                                                            <td className="text-center text-muted">{i + 1}</td>
                                                            <td>
                                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace px-2 py-1 fs-12">
                                                                    {st.student_code || '-'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="fw-semibold text-dark fs-14">
                                                                    {st.title_prefix} {st.first_name_th} {st.last_name_th}
                                                                </div>
                                                                <small className="text-muted">{st.user?.email || '-'}</small>
                                                            </td>
                                                            <td>
                                                                <div className="text-dark fs-13">{st.major}</div>
                                                                <small className="text-muted">{st.class_year} (รุ่น {st.academic_year})</small>
                                                            </td>
                                                            <td>
                                                                <Badge bg={st.student_status === 'กำลังศึกษา' ? 'success' : 'secondary'} className="fs-12">
                                                                    {st.student_status}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <span className="text-dark fs-13">{st.advisor_name || '-'}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                <a
                                                                    href={`/student-profile?user_id=${st.user_id}`}
                                                                    className="btn btn-sm btn-soft-primary d-inline-flex align-items-center gap-1"
                                                                >
                                                                    <IconifyIcon icon="solar:eye-bold" className="fs-14" />
                                                                    <span>เปิดดูประวัติ</span>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Tab.Pane>
                            )}
                        </Tab.Content>
                    </CardBody>
                </Card>
            </Tab.Container>

            {/* Modal: แก้ไขข้อมูลทะเบียนประวัตินักศึกษา */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl" centered>
                <Modal.Header closeButton className="bg-light-subtle py-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <div className="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                            <IconifyIcon icon="solar:pen-bold" className="fs-18" />
                        </div>
                        <div>
                            <Modal.Title as="h5" className="fw-bold text-dark fs-16 mb-0">
                                แก้ไขข้อมูลทะเบียนประวัตินักศึกษา
                            </Modal.Title>
                            <small className="text-muted">
                                อัปเดตข้อมูลระบุตัวตน การศึกษา แหล่งฝึกงาน และผู้ติดต่อฉุกเฉิน
                            </small>
                        </div>
                    </div>
                </Modal.Header>

                <Form onSubmit={handleSaveProfile}>
                    <Modal.Body className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                        {/* Section 1: ข้อมูลส่วนตัว */}
                        <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom d-flex align-items-center gap-2">
                            <IconifyIcon icon="solar:user-bold" className="fs-16" />
                            1. ข้อมูลประวัติส่วนตัวและระบุตัวตน
                        </h6>

                        <Row className="g-3 mb-4">
                            <Col md={2}>
                                <Form.Group controlId="modalPrefix">
                                    <Form.Label className="fw-semibold text-dark fs-13">คำนำหน้าชื่อ</Form.Label>
                                    <Form.Select
                                        value={formData.title_prefix}
                                        onChange={(e) => setFormData({ ...formData, title_prefix: e.target.value })}
                                    >
                                        <option value="นาย">นาย</option>
                                        <option value="นางสาว">นางสาว</option>
                                        <option value="นาง">นาง</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={5}>
                                <Form.Group controlId="modalFirstNameTh">
                                    <Form.Label className="fw-semibold text-dark fs-13">
                                        ชื่อภาษาไทย <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.first_name_th}
                                        onChange={(e) => setFormData({ ...formData, first_name_th: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={5}>
                                <Form.Group controlId="modalLastNameTh">
                                    <Form.Label className="fw-semibold text-dark fs-13">
                                        นามสกุลภาษาไทย <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.last_name_th}
                                        onChange={(e) => setFormData({ ...formData, last_name_th: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="modalFirstNameEn">
                                    <Form.Label className="fw-semibold text-dark fs-13">ชื่อภาษาอังกฤษ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.first_name_en}
                                        onChange={(e) => setFormData({ ...formData, first_name_en: e.target.value })}
                                        placeholder="เช่น Somchai"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="modalLastNameEn">
                                    <Form.Label className="fw-semibold text-dark fs-13">นามสกุลภาษาอังกฤษ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.last_name_en}
                                        onChange={(e) => setFormData({ ...formData, last_name_en: e.target.value })}
                                        placeholder="เช่น Raksukphap"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group controlId="modalNationalId">
                                    <Form.Label className="fw-semibold text-dark fs-13">เลขประจำตัวประชาชน (13 หลัก)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        maxLength={13}
                                        value={formData.national_id}
                                        onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                                        placeholder="xxxxxxxxxxxxx"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group controlId="modalBirthDate">
                                    <Form.Label className="fw-semibold text-dark fs-13">วัน/เดือน/ปี เกิด</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={2}>
                                <Form.Group controlId="modalGender">
                                    <Form.Label className="fw-semibold text-dark fs-13">เพศ</Form.Label>
                                    <Form.Select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="ชาย">ชาย</option>
                                        <option value="หญิง">หญิง</option>
                                        <option value="อื่นๆ">อื่นๆ</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={2}>
                                <Form.Group controlId="modalBlood">
                                    <Form.Label className="fw-semibold text-dark fs-13">หมู่เลือด</Form.Label>
                                    <Form.Select
                                        value={formData.blood_group}
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
                                <Form.Group controlId="modalPhone">
                                    <Form.Label className="fw-semibold text-dark fs-13">เบอร์โทรศัพท์มือถือ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="08x-xxx-xxxx"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group controlId="modalLineId">
                                    <Form.Label className="fw-semibold text-dark fs-13">Line ID</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.line_id}
                                        onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
                                        placeholder="ไอดีไลน์..."
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group controlId="modalReligion">
                                    <Form.Label className="fw-semibold text-dark fs-13">ศาสนา</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.religion}
                                        onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Section 2: ข้อมูลการศึกษา */}
                        <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom d-flex align-items-center gap-2">
                            <IconifyIcon icon="solar:diploma-bold" className="fs-16" />
                            2. ข้อมูลหลักสูตร ผลการเรียน และการฝึกงาน
                        </h6>

                        <Row className="g-3 mb-4">
                            <Col md={4}>
                                <Form.Group controlId="modalStudentCode">
                                    <Form.Label className="fw-semibold text-dark fs-13">รหัสนักศึกษา</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.student_code}
                                        onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                                        placeholder="เช่น 6601234567"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={8}>
                                <Form.Group controlId="modalMajor">
                                    <Form.Label className="fw-semibold text-dark fs-13">สาขาวิชา / หลักสูตร <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={formData.major}
                                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                    >
                                        <option value="">-- เลือกสาขาวิชา / หลักสูตร --</option>
                                        {curriculums && curriculums.length > 0 ? (
                                            curriculums.map((c) => (
                                                <option key={c.id} value={c.name}>
                                                    {c.code ? `[${c.code}] ` : ''}{c.name}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="หลักสูตรสาธารณสุขศาสตรมหาบัณฑิต (ส.ม.)">หลักสูตรสาธารณสุขศาสตรมหาบัณฑิต (ส.ม.)</option>
                                                <option value="สาธารณสุขศาสตรบัณฑิต (สาธารณสุขชุมชน)">สาธารณสุขศาสตรบัณฑิต (สาธารณสุขชุมชน)</option>
                                                <option value="สาธารณสุขศาสตรบัณฑิต (ทันตสาธารณสุข)">สาธารณสุขศาสตรบัณฑิต (ทันตสาธารณสุข)</option>
                                                <option value="การแพทย์แผนไทยบัณฑิต">การแพทย์แผนไทยบัณฑิต</option>
                                            </>
                                        )}
                                        {formData.major &&
                                            (!curriculums || !curriculums.some(c => c.name === formData.major)) &&
                                            !["หลักสูตรสาธารณสุขศาสตรมหาบัณฑิต (ส.ม.)", "สาธารณสุขศาสตรบัณฑิต (สาธารณสุขชุมชน)", "สาธารณสุขศาสตรบัณฑิต (ทันตสาธารณสุข)", "การแพทย์แผนไทยบัณฑิต"].includes(formData.major) && (
                                                <option value={formData.major}>{formData.major}</option>
                                        )}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group controlId="modalClassYear">
                                    <Form.Label className="fw-semibold text-dark fs-13">ชั้นปี</Form.Label>
                                    <Form.Select
                                        value={formData.class_year}
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
                                <Form.Group controlId="modalAcademicYear">
                                    <Form.Label className="fw-semibold text-dark fs-13">ปีการศึกษาที่เข้าศึกษา</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.academic_year}
                                        onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                        placeholder="เช่น 2567"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group controlId="modalGpa">
                                    <Form.Label className="fw-semibold text-dark fs-13">เกรดเฉลี่ยสะสม (GPAX)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="4"
                                        value={formData.gpa}
                                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="modalAdvisor">
                                    <Form.Label className="fw-semibold text-dark fs-13">อาจารย์ที่ปรึกษา</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.advisor_name}
                                        onChange={(e) => setFormData({ ...formData, advisor_name: e.target.value })}
                                        placeholder="ระบุชื่อ-สกุล อาจารย์ที่ปรึกษา"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="modalHospital">
                                    <Form.Label className="fw-semibold text-dark fs-13">แหล่งฝึกปฏิบัติงาน / โรงพยาบาล</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.practicum_hospital}
                                        onChange={(e) => setFormData({ ...formData, practicum_hospital: e.target.value })}
                                        placeholder="เช่น รพ.สต. หรือ โรงพยาบาลศูนย์..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Section 3: ที่อยู่และติดต่อฉุกเฉิน */}
                        <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom d-flex align-items-center gap-2">
                            <IconifyIcon icon="solar:home-bold" className="fs-16" />
                            3. ที่อยู่ ข้อมูลติดต่อฉุกเฉิน และสุขภาพ
                        </h6>

                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group controlId="modalAddress">
                                    <Form.Label className="fw-semibold text-dark fs-13">ที่อยู่ตามทะเบียนบ้าน</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="modalCurrentAddress">
                                    <Form.Label className="fw-semibold text-dark fs-13">ที่อยู่ปัจจุบัน / หอพัก</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.current_address}
                                        onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group controlId="modalEmergencyName">
                                    <Form.Label className="fw-semibold text-dark fs-13">ชื่อผู้ติดต่อกรณีฉุกเฉิน</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.emergency_contact_name}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group controlId="modalEmergencyRel">
                                    <Form.Label className="fw-semibold text-dark fs-13">ความสัมพันธ์</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.emergency_relationship}
                                        onChange={(e) => setFormData({ ...formData, emergency_relationship: e.target.value })}
                                        placeholder="เช่น บิดา, มารดา, พี่สาว"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group controlId="modalEmergencyPhone">
                                    <Form.Label className="fw-semibold text-dark fs-13">เบอร์โทรศัพท์ฉุกเฉิน</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.emergency_phone}
                                        onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group controlId="modalHealth">
                                    <Form.Label className="fw-semibold text-dark fs-13">
                                        โรคประจำตัว / ประวัติการแพ้ยาและอาหาร
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.health_conditions}
                                        onChange={(e) => setFormData({ ...formData, health_conditions: e.target.value })}
                                        placeholder="เช่น ไม่มีโรคประจำตัว หรือ แพ้ยาเพนิซิลลิน..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>

                    <Modal.Footer className="bg-light-subtle py-2 border-top">
                        <Button variant="light" onClick={() => setShowEditModal(false)} disabled={isSaving}>
                            ยกเลิก
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSaving} className="px-4 fw-semibold">
                            {isSaving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    กำลังบันทึกข้อมูล...
                                </>
                            ) : (
                                <>
                                    <IconifyIcon icon="solar:check-circle-bold" className="me-1 fs-16" />
                                    บันทึกข้อมูลทะเบียนประวัติ
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default StudentProfilePage;
