import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Button, Form, Badge, Modal, InputGroup, Table, Dropdown } from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';
import { QRCodeSVG } from 'qrcode.react';

interface RegistrationItem {
    id: number;
    activity_id: number;
    user_id: number;
    student_code?: string;
    registration_status: string;
    registered_at?: string;
    check_in_time?: string;
    check_out_time?: string;
    check_in_method?: string;
    check_in_distance?: number;
    check_in_photo?: string;
    actual_hours: number;
    attendance_type: 'full' | 'partial' | 'none';
    admin_override: boolean;
    override_reason?: string;
    notes?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        student_profile?: {
            student_code: string;
            first_name_th: string;
            last_name_th: string;
            title_prefix: string;
            faculty: string;
            major: string;
            class_year: string;
            phone?: string;
            avatar_path?: string;
        } | null;
    };
    override_user?: {
        id: number;
        name: string;
    } | null;
}

interface ActivityDetail {
    id: number;
    activity_code: string;
    academic_year: number;
    semester: number;
    activity_name: string;
    activity_type: 'mandatory' | 'elective';
    activity_date: string;
    start_time: string;
    end_time: string;
    total_hours: number;
    location_name: string;
    latitude: number;
    longitude: number;
    radius_limit: number;
    qr_refresh_interval?: number;
    status: string;
    description?: string;
    creator?: {
        id: number;
        name: string;
    };
    target_groups?: Array<{
        id: number;
        target_type: string;
        target_value?: string;
        required: boolean;
    }>;
}

interface PageProps {
    activity: ActivityDetail;
    registrations: RegistrationItem[];
    stats: {
        total_registered: number;
        attended_count: number;
        full_time_count: number;
        partial_time_count: number;
        absent_count: number;
        attendance_percent: number;
    };
    currentDynamicQr: string;
}

export default function ActivityShow({ activity, registrations, stats, currentDynamicQr }: PageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<RegistrationItem | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);

    // Override Form
    const overrideForm = useForm({
        registration_id: 0,
        attendance_type: 'full',
        actual_hours: activity.total_hours,
        check_in_time: '',
        check_out_time: '',
        override_reason: '',
        notes: '',
    });

    // Import Form
    const importForm = useForm({
        student_codes: '',
        required: true,
    });

    const handleOpenOverride = (reg: RegistrationItem) => {
        setSelectedRegistration(reg);
        overrideForm.setData({
            registration_id: reg.id,
            attendance_type: reg.attendance_type === 'none' ? 'full' : reg.attendance_type,
            actual_hours: reg.actual_hours > 0 ? reg.actual_hours : activity.total_hours,
            check_in_time: reg.check_in_time ? reg.check_in_time.replace(' ', 'T').substring(0, 16) : '',
            check_out_time: reg.check_out_time ? reg.check_out_time.replace(' ', 'T').substring(0, 16) : '',
            override_reason: reg.override_reason || '',
            notes: reg.notes || '',
        });
        setShowOverrideModal(true);
    };

    const handleSaveOverride = (e: React.FormEvent) => {
        e.preventDefault();
        overrideForm.post(`/activities/${activity.id}/override`, {
            onSuccess: () => {
                setShowOverrideModal(false);
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ',
                    text: 'ปรับแก้ผลการเข้าร่วมและคำนวณชั่วโมงใหม่เรียบร้อย',
                    timer: 1800,
                    showConfirmButton: false,
                });
            },
        });
    };

    const handleSaveImport = (e: React.FormEvent) => {
        e.preventDefault();
        importForm.post(`/activities/${activity.id}/import-students`, {
            onSuccess: () => {
                setShowImportModal(false);
                importForm.reset();
                Swal.fire({
                    icon: 'success',
                    title: 'นำเข้าสำเร็จ',
                    text: 'เพิ่มรายชื่อนักศึกษาเป้าหมายในกิจกรรมเรียบร้อยแล้ว',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    };

    // Filter registrations
    const filteredRegistrations = registrations.filter((reg) => {
        const profile = reg.user?.student_profile;
        const studentCode = profile?.student_code || reg.student_code || '';
        const name = profile ? `${profile.first_name_th} ${profile.last_name_th}` : (reg.user?.name || '');
        const matchesSearch = studentCode.includes(searchTerm) || name.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (!statusFilter) return true;
        if (statusFilter === 'full') return reg.attendance_type === 'full';
        if (statusFilter === 'partial') return reg.attendance_type === 'partial';
        if (statusFilter === 'absent') return !reg.check_in_time || reg.attendance_type === 'none';
        return true;
    });

    const qrCheckInUrl = `${window.location.origin}/student/activities/${activity.id}/check-in?token=${currentDynamicQr}`;

    return (
        <MainLayout>
            <Head title={`จัดการกิจกรรม: ${activity.activity_name}`} />
            <PageTitle title={activity.activity_name} subTitle="รายละเอียดและตรวจสอบผลการเข้าร่วม" />

            {/* Top Overview & Action Buttons */}
            <Row className="g-3 mb-4">
                <Col xl={8} lg={7}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span className="badge bg-primary fs-13 px-2 py-1">
                                            {activity.activity_code}
                                        </span>
                                        {activity.activity_type === 'mandatory' ? (
                                            <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-2 py-1">
                                                <IconifyIcon icon="tabler:lock" className="me-1 align-middle" /> กิจกรรมบังคับ
                                            </Badge>
                                        ) : (
                                            <Badge bg="info-subtle" className="text-info border border-info-subtle px-2 py-1">
                                                <IconifyIcon icon="tabler:thumb-up" className="me-1 align-middle" /> กิจกรรมเลือก
                                            </Badge>
                                        )}
                                        <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1">
                                            ปีการศึกษา {activity.academic_year} ภาค {activity.semester}
                                        </Badge>
                                    </div>
                                    <h4 className="fw-bold text-dark mb-1">{activity.activity_name}</h4>
                                    <p className="text-muted mb-0 fs-13">
                                        {activity.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับกิจกรรมนี้'}
                                    </p>
                                </div>

                                <div className="d-flex gap-2">
                                    <Link
                                        href={`/activities/${activity.id}/live`}
                                        target="_blank"
                                        className="btn btn-primary d-flex align-items-center gap-1 shadow-sm"
                                    >
                                        <IconifyIcon icon="tabler:screen-share" className="fs-18" /> เปิดจอสด Live Projector
                                    </Link>
                                    <a
                                        href={`/activities/${activity.id}/export`}
                                        className="btn btn-outline-success d-flex align-items-center gap-1"
                                    >
                                        <IconifyIcon icon="tabler:file-spreadsheet" className="fs-18" /> ส่งออก Excel
                                    </a>
                                </div>
                            </div>

                            <hr className="border-dashed my-3" />

                            <Row className="g-3">
                                <Col sm={4}>
                                    <div className="text-muted fs-12 mb-1">วันและเวลาที่จัดงาน</div>
                                    <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                                        <IconifyIcon icon="tabler:calendar" className="text-primary" />
                                        {new Date(activity.activity_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <small className="text-muted">
                                        {activity.start_time?.substring(0, 5)} - {activity.end_time?.substring(0, 5)} น.
                                    </small>
                                </Col>

                                <Col sm={4}>
                                    <div className="text-muted fs-12 mb-1">จำนวนชั่วโมงกิจกรรม</div>
                                    <div className="fw-bold text-primary fs-18 d-flex align-items-center gap-1">
                                        <IconifyIcon icon="tabler:clock" />
                                        {Number(activity.total_hours).toFixed(1)} ชั่วโมง
                                    </div>
                                    <small className="text-muted">ได้รับเมื่อเข้าร่วมครบตามเกณฑ์</small>
                                </Col>

                                <Col sm={4}>
                                    <div className="text-muted fs-12 mb-1">สถานที่จัดงาน & Geofencing</div>
                                    <div className="fw-semibold text-dark text-truncate d-flex align-items-center gap-1" title={activity.location_name}>
                                        <IconifyIcon icon="tabler:map-pin" className="text-danger" />
                                        {activity.location_name}
                                    </div>
                                    <small className="text-muted">
                                        รัศมี GPS: <strong>{activity.radius_limit}</strong> เมตร
                                    </small>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>

                {/* QR Quick Box */}
                <Col xl={4} lg={5}>
                    <Card className="border-0 shadow-sm h-100 bg-light">
                        <CardBody className="p-4 text-center d-flex flex-column align-items-center justify-content-center">
                            <div className="bg-white p-3 rounded-3 shadow-sm mb-2 d-inline-block">
                                <QRCodeSVG value={qrCheckInUrl} size={150} level="M" />
                            </div>
                            <div className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 mb-2">
                                <IconifyIcon icon="tabler:refresh" className="me-1" /> Dynamic QR หมุนเวียน ({activity.qr_refresh_interval || 60} วินาที)
                            </div>
                            <div className="fs-12 text-muted mb-2">
                                สแกนเพื่อเช็กอิน (ตรวจสอบพิกัด GPS อัตโนมัติในรัศมี {activity.radius_limit} ม.)
                            </div>
                            <div className="d-flex gap-2 w-100 justify-content-center">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="d-flex align-items-center gap-1"
                                    onClick={() => setShowImportModal(true)}
                                >
                                    <IconifyIcon icon="tabler:user-plus" /> นำเข้ารายชื่อนักศึกษา
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Attendance Stat Cards */}
            <Row className="g-3 mb-4">
                <Col lg={2} sm={4} xs={6}>
                    <Card className="border-0 shadow-sm text-center p-3">
                        <span className="text-muted fs-12 mb-1">กลุ่มเป้าหมาย/ลงทะเบียน</span>
                        <h3 className="mb-0 fw-bold text-dark">{stats.total_registered}</h3>
                        <small className="text-muted">คน</small>
                    </Card>
                </Col>
                <Col lg={2} sm={4} xs={6}>
                    <Card className="border-0 shadow-sm text-center p-3 bg-primary-subtle border-primary">
                        <span className="text-primary fs-12 mb-1">เช็กอินแล้ว</span>
                        <h3 className="mb-0 fw-bold text-primary">{stats.attended_count}</h3>
                        <small className="text-primary fw-semibold">{stats.attendance_percent}%</small>
                    </Card>
                </Col>
                <Col lg={2} sm={4} xs={6}>
                    <Card className="border-0 shadow-sm text-center p-3 bg-success-subtle">
                        <span className="text-success fs-12 mb-1">เต็มเวลา (Full)</span>
                        <h3 className="mb-0 fw-bold text-success">{stats.full_time_count}</h3>
                        <small className="text-muted">ครบ {activity.total_hours} ชม.</small>
                    </Card>
                </Col>
                <Col lg={2} sm={4} xs={6}>
                    <Card className="border-0 shadow-sm text-center p-3 bg-warning-subtle">
                        <span className="text-warning fs-12 mb-1">ไม่เต็มเวลา (Partial)</span>
                        <h3 className="mb-0 fw-bold text-warning">{stats.partial_time_count}</h3>
                        <small className="text-muted">คิดชั่วโมงตามจริง</small>
                    </Card>
                </Col>
                <Col lg={2} sm={4} xs={6}>
                    <Card className="border-0 shadow-sm text-center p-3 bg-danger-subtle">
                        <span className="text-danger fs-12 mb-1">ยังไม่เช็กอิน / ขาด</span>
                        <h3 className="mb-0 fw-bold text-danger">{stats.absent_count}</h3>
                        <small className="text-muted">0 ชม.</small>
                    </Card>
                </Col>
                <Col lg={2} sm={4} xs={6}>
                    <Card className="border-0 shadow-sm text-center p-3">
                        <span className="text-muted fs-12 mb-1">ปรับแก้โดยอาจารย์</span>
                        <h3 className="mb-0 fw-bold text-secondary">
                            {registrations.filter((r) => r.admin_override).length}
                        </h3>
                        <small className="text-muted">รายการ Override</small>
                    </Card>
                </Col>
            </Row>

            {/* Attendance Records Table */}
            <Card className="border-0 shadow-sm">
                <CardBody className="p-3 border-bottom">
                    <Row className="g-2 align-items-center">
                        <Col md={5}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0">
                                    <IconifyIcon icon="tabler:search" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="ค้นหารหัสนักศึกษา หรือ ชื่อ-นามสกุล..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-start-0"
                                />
                            </InputGroup>
                        </Col>

                        <Col md={3}>
                            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">ผลการเข้าร่วมทั้งหมด</option>
                                <option value="full">เต็มเวลา (ได้ชั่วโมงครบ)</option>
                                <option value="partial">ไม่เต็มเวลา (คิดตามจริง)</option>
                                <option value="absent">ยังไม่เช็กอิน / ขาด</option>
                            </Form.Select>
                        </Col>

                        <Col md={4} className="text-md-end">
                            <span className="text-muted fs-13">
                                แสดงผล {filteredRegistrations.length} จากทั้งหมด {registrations.length} คน
                            </span>
                        </Col>
                    </Row>
                </CardBody>

                <CardBody className="p-0">
                    <div className="table-responsive">
                        <Table hover className="table-nowrap mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '60px' }}>#</th>
                                    <th>รหัสนักศึกษา</th>
                                    <th>ชื่อ - สกุล</th>
                                    <th>สาขาวิชา / ชั้นปี</th>
                                    <th>เวลาเช็กอิน</th>
                                    <th>เวลาเช็กเอาต์</th>
                                    <th>วิธี / ระยะห่าง</th>
                                    <th className="text-center">ชั่วโมงที่ได้</th>
                                    <th>ผลการเข้าร่วม</th>
                                    <th className="text-center" style={{ width: '100px' }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-5 text-muted">
                                            <IconifyIcon icon="tabler:users" className="fs-48 text-secondary mb-2" />
                                            <div>ไม่พบข้อมูลการลงทะเบียนหรือเช็กอินตามเงื่อนไข</div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((reg, idx) => {
                                        const profile = reg.user?.student_profile;
                                        const fullName = profile
                                            ? `${profile.title_prefix || ''}${profile.first_name_th} ${profile.last_name_th}`
                                            : (reg.user?.name || '-');
                                        const studentCode = profile?.student_code || reg.student_code || '-';

                                        return (
                                            <tr key={reg.id}>
                                                <td>{idx + 1}</td>
                                                <td>
                                                    <span className="fw-bold text-dark">{studentCode}</span>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">{fullName}</div>
                                                    <small className="text-muted">{reg.user?.email}</small>
                                                </td>
                                                <td>
                                                    <div>{profile?.major || '-'}</div>
                                                    <small className="text-muted">{profile?.class_year || '-'}</small>
                                                </td>
                                                <td>
                                                    {reg.check_in_time ? (
                                                        <div>
                                                            <div className="text-success fw-semibold">
                                                                {new Date(reg.check_in_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                                            </div>
                                                            <small className="text-muted">
                                                                {new Date(reg.check_in_time).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                                            </small>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {reg.check_out_time ? (
                                                        <div>
                                                            <div className="text-primary fw-semibold">
                                                                {new Date(reg.check_out_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                                            </div>
                                                            <small className="text-muted">
                                                                {new Date(reg.check_out_time).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                                            </small>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {reg.check_in_method ? (
                                                        <div>
                                                            <Badge bg="light" className="text-dark border">
                                                                {reg.check_in_method}
                                                            </Badge>
                                                            {reg.check_in_distance !== null && reg.check_in_distance !== undefined && (
                                                                <small className="d-block text-muted">
                                                                    ห่าง {Number(reg.check_in_distance).toFixed(1)} ม.
                                                                </small>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge fs-13 px-2 py-1 ${reg.actual_hours > 0 ? 'bg-primary-subtle text-primary' : 'bg-light text-muted'}`}>
                                                        {Number(reg.actual_hours).toFixed(1)} ชม.
                                                    </span>
                                                </td>
                                                <td>
                                                    {reg.attendance_type === 'full' && (
                                                        <Badge bg="success-subtle" className="text-success border border-success-subtle rounded-pill px-2">
                                                            <IconifyIcon icon="tabler:check" className="me-1 align-middle" /> เต็มเวลา
                                                        </Badge>
                                                    )}
                                                    {reg.attendance_type === 'partial' && (
                                                        <Badge bg="warning-subtle" className="text-warning border border-warning-subtle rounded-pill px-2">
                                                            <IconifyIcon icon="tabler:alert-triangle" className="me-1 align-middle" /> ไม่เต็มเวลา
                                                        </Badge>
                                                    )}
                                                    {(!reg.attendance_type || reg.attendance_type === 'none') && (
                                                        <Badge bg="danger-subtle" className="text-danger border border-danger-subtle rounded-pill px-2">
                                                            <IconifyIcon icon="tabler:x" className="me-1 align-middle" /> ขาด / ยังไม่เช็กอิน
                                                        </Badge>
                                                    )}
                                                    {reg.admin_override && (
                                                        <small className="d-block text-danger mt-1" title={reg.override_reason || ''}>
                                                            <IconifyIcon icon="tabler:edit" /> ปรับแก้โดยอาจารย์
                                                        </small>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <Button
                                                        variant="soft-secondary"
                                                        size="sm"
                                                        onClick={() => handleOpenOverride(reg)}
                                                        title="ปรับแก้เวลาและชั่วโมง (Admin Override)"
                                                    >
                                                        <IconifyIcon icon="tabler:edit" /> ปรับแก้
                                                    </Button>
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

            {/* Modal: Admin Override Attendance */}
            <Modal show={showOverrideModal} onHide={() => setShowOverrideModal(false)} centered>
                <Form onSubmit={handleSaveOverride}>
                    <Modal.Header closeButton className="bg-light">
                        <Modal.Title className="fs-16 d-flex align-items-center gap-2">
                            <IconifyIcon icon="tabler:user-cog" className="text-primary fs-20" />
                            ปรับแก้ผลการเข้าร่วมกิจกรรม (Admin Override)
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        {selectedRegistration && (
                            <div className="alert alert-info py-2 px-3 mb-3 fs-13">
                                <strong>นักศึกษา:</strong> {selectedRegistration.user?.student_profile?.title_prefix}
                                {selectedRegistration.user?.student_profile?.first_name_th} {selectedRegistration.user?.student_profile?.last_name_th} ({selectedRegistration.student_code || selectedRegistration.user?.student_profile?.student_code})
                            </div>
                        )}

                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">สถานะการเข้าร่วม</Form.Label>
                                    <Form.Select
                                        value={overrideForm.data.attendance_type}
                                        onChange={(e) => {
                                            const type = e.target.value;
                                            overrideForm.setData('attendance_type', type as any);
                                            if (type === 'full') {
                                                overrideForm.setData('actual_hours', activity.total_hours);
                                            } else if (type === 'none') {
                                                overrideForm.setData('actual_hours', 0);
                                            }
                                        }}
                                    >
                                        <option value="full">เต็มเวลา (ได้ชั่วโมงเต็ม)</option>
                                        <option value="partial">ไม่เต็มเวลา (คิดตามจริง)</option>
                                        <option value="none">ไม่ผ่าน / ขาดกิจกรรม</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">จำนวนชั่วโมงที่ได้รับ (ชม.)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max={activity.total_hours}
                                        value={overrideForm.data.actual_hours}
                                        onChange={(e) => overrideForm.setData('actual_hours', parseFloat(e.target.value))}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">เวลาเช็กอิน</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={overrideForm.data.check_in_time}
                                        onChange={(e) => overrideForm.setData('check_in_time', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">เวลาเช็กเอาต์</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={overrideForm.data.check_out_time}
                                        onChange={(e) => overrideForm.setData('check_out_time', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">เหตุผลการปรับแก้ <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="เช่น อุปกรณ์มือถือมีปัญหา, ช่วยงานเจ้าหน้าที่, ได้รับมอบหมายภารกิจพิเศษ"
                                        value={overrideForm.data.override_reason}
                                        onChange={(e) => overrideForm.setData('override_reason', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="bg-light">
                        <Button variant="secondary" onClick={() => setShowOverrideModal(false)}>
                            ยกเลิก
                        </Button>
                        <Button variant="primary" type="submit" disabled={overrideForm.processing}>
                            บันทึกการปรับแก้
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal: Import Target Students */}
            <Modal show={showImportModal} onHide={() => setShowImportModal(false)} centered>
                <Form onSubmit={handleSaveImport}>
                    <Modal.Header closeButton className="bg-light">
                        <Modal.Title className="fs-16 d-flex align-items-center gap-2">
                            <IconifyIcon icon="tabler:file-import" className="text-success fs-20" />
                            นำเข้ารายชื่อนักศึกษาที่ต้องเข้าร่วม
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">รหัสนักศึกษา (Student IDs)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={6}
                                placeholder="คัดลอกจาก Excel หรือพิมพ์รหัสนักศึกษา เช่น:&#10;6612345601&#10;6612345602&#10;6612345603"
                                value={importForm.data.student_codes}
                                onChange={(e) => importForm.setData('student_codes', e.target.value)}
                                required
                            />
                            <small className="text-muted">
                                สามารถวางรายชื่อรหัสนักศึกษาคั่นด้วยการขึ้นบรรทัดใหม่ หรือเครื่องหมายจุลภาค (,)
                            </small>
                        </Form.Group>

                        <Form.Check
                            type="checkbox"
                            id="importRequired"
                            label="กำหนดเป็นกิจกรรมบังคับสำหรับกลุ่มนี้ (Required = True)"
                            checked={importForm.data.required}
                            onChange={(e) => importForm.setData('required', e.target.checked as boolean)}
                        />
                    </Modal.Body>
                    <Modal.Footer className="bg-light">
                        <Button variant="secondary" onClick={() => setShowImportModal(false)}>
                            ยกเลิก
                        </Button>
                        <Button variant="success" type="submit" disabled={importForm.processing}>
                            นำเข้ารายชื่อ
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </MainLayout>
    );
}
