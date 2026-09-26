import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Button, Form, Badge, Modal, InputGroup, Table, Dropdown } from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';
import LocationMapPickerModal from '@/components/LocationMapPickerModal';

interface ActivityItem {
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
    latitude?: number;
    longitude?: number;
    radius_limit: number;
    qr_refresh_interval?: number;
    status: string;
    max_participants?: number;
    description?: string;
    registrations_count: number;
    attended_count: number;
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
    activities: {
        data: ActivityItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        academic_year?: string;
        semester?: string;
        activity_type?: string;
        search?: string;
    };
    stats: {
        total_activities: number;
        mandatory_count: number;
        elective_count: number;
        total_hours: number;
        total_checkins: number;
    };
    academicYears: number[];
}

export default function ActivitiesIndex({ activities, filters, stats, academicYears }: PageProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [isLocatingDevice, setIsLocatingDevice] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedYear, setSelectedYear] = useState(filters.academic_year || '');
    const [selectedSemester, setSelectedSemester] = useState(filters.semester || '');
    const [selectedType, setSelectedType] = useState(filters.activity_type || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        activity_name: '',
        activity_code: '',
        academic_year: 2569,
        semester: 1,
        activity_type: 'mandatory',
        activity_date: new Date().toISOString().split('T')[0],
        start_time: '08:30',
        end_time: '16:30',
        total_hours: 8.0,
        location_name: 'วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี',
        latitude: 14.475685,
        longitude: 100.116528,
        radius_limit: 100,
        qr_refresh_interval: 60,
        status: 'published',
        max_participants: '',
        description: '',
        target_type: 'ALL',
        target_value: '',
    });

    const handleFilter = () => {
        router.get(
            '/activities',
            {
                search: searchQuery,
                academic_year: selectedYear,
                semester: selectedSemester,
                activity_type: selectedType,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilter = () => {
        setSearchQuery('');
        setSelectedYear('');
        setSelectedSemester('');
        setSelectedType('');
        router.get('/activities', {}, { replace: true });
    };

    const handleFetchCurrentDeviceLocation = () => {
        if (!navigator.geolocation) {
            Swal.fire('ข้อผิดพลาด', 'อุปกรณ์ของคุณไม่รองรับการระบุพิกัด GPS', 'warning');
            return;
        }

        setIsLocatingDevice(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const currentLat = parseFloat(pos.coords.latitude.toFixed(6));
                const currentLng = parseFloat(pos.coords.longitude.toFixed(6));
                setData((prev) => ({
                    ...prev,
                    latitude: currentLat,
                    longitude: currentLng,
                }));
                setIsLocatingDevice(false);
                Swal.fire({
                    icon: 'success',
                    title: 'ดึงพิกัดจากอุปกรณ์สำเร็จ',
                    text: `ละติจูด: ${currentLat}, ลองจิจูด: ${currentLng}`,
                    timer: 1800,
                    showConfirmButton: false,
                });
            },
            (err) => {
                setIsLocatingDevice(false);
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเข้าถึงพิกัด GPS ได้ โปรดตรวจสอบว่าได้เปิด GPS และอนุญาตสิทธิ์ Location ในเบราว์เซอร์แล้ว', 'error');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/activities', {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'สร้างกิจกรรมสำเร็จ',
                    text: 'กิจกรรมถูกบันทึกและพร้อมเปิดให้นักศึกษาเช็กอินแล้ว',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    };

    const handleDelete = (activity: ActivityItem) => {
        if (activity.attended_count > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'ไม่สามารถลบได้',
                text: 'กิจกรรมนี้มีนักศึกษาเช็กอินเข้าร่วมแล้ว ไม่สามารถลบได้',
            });
            return;
        }

        Swal.fire({
            title: `ลบกิจกรรม "${activity.activity_name}"?`,
            text: 'การกระทำนี้ไม่สามารถย้อนกลับได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6d43',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'ใช่, ต้องการลบ',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/activities/${activity.id}`, {
                    onSuccess: () => {
                        Swal.fire('ลบสำเร็จ', 'กิจกรรมถูกลบออกจากระบบแล้ว', 'success');
                    },
                });
            }
        });
    };

    return (
        <MainLayout>
            <PageTitle
                title="จัดการกิจกรรมนักศึกษา"
                subTitle="ระบบกิจกรรมนักศึกษา"
                titleSuffix={
                    <Link
                        href="/activities/guide"
                        className="btn btn-sm btn-outline-info rounded-pill d-inline-flex align-items-center gap-1 shadow-sm px-2 py-1 ms-1"
                        title="คู่มือขั้นตอนการใช้งานสำหรับอาจารย์และผู้ดูแลระบบ"
                    >
                        <IconifyIcon icon="tabler:help" className="fs-15" />
                        <span className="fs-12 fw-semibold">คู่มือสำหรับผู้ดูแล</span>
                    </Link>
                }
            />

            {/* Stat Cards */}
            <Row className="g-3 mb-4">
                <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm h-100 overflow-hidden">
                        <CardBody className="p-3">
                            <div className="d-flex align-items-center">
                                <div className="avatar-md rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48 }}>
                                    <IconifyIcon icon="tabler:calendar-event" className="fs-24" />
                                </div>
                                <div>
                                    <h6 className="text-muted fw-semibold mb-1 fs-13">กิจกรรมทั้งหมด</h6>
                                    <h3 className="mb-0 fw-bold">{stats.total_activities} <span className="fs-12 text-muted fw-normal">กิจกรรม</span></h3>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm h-100 overflow-hidden">
                        <CardBody className="p-3">
                            <div className="d-flex align-items-center">
                                <div className="avatar-md rounded-3 bg-danger-subtle text-danger d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48 }}>
                                    <IconifyIcon icon="tabler:alert-circle" className="fs-24" />
                                </div>
                                <div>
                                    <h6 className="text-muted fw-semibold mb-1 fs-13">กิจกรรมบังคับ</h6>
                                    <h3 className="mb-0 fw-bold">{stats.mandatory_count} <span className="fs-12 text-muted fw-normal">รายการ</span></h3>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm h-100 overflow-hidden">
                        <CardBody className="p-3">
                            <div className="d-flex align-items-center">
                                <div className="avatar-md rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48 }}>
                                    <IconifyIcon icon="tabler:clock" className="fs-24" />
                                </div>
                                <div>
                                    <h6 className="text-muted fw-semibold mb-1 fs-13">ชั่วโมงกิจกรรมรวม</h6>
                                    <h3 className="mb-0 fw-bold">{Number(stats.total_hours).toFixed(1)} <span className="fs-12 text-muted fw-normal">ชั่วโมง</span></h3>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm h-100 overflow-hidden">
                        <CardBody className="p-3">
                            <div className="d-flex align-items-center">
                                <div className="avatar-md rounded-3 bg-info-subtle text-info d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48 }}>
                                    <IconifyIcon icon="tabler:user-check" className="fs-24" />
                                </div>
                                <div>
                                    <h6 className="text-muted fw-semibold mb-1 fs-13">ยอดเช็กอินสะสม</h6>
                                    <h3 className="mb-0 fw-bold">{stats.total_checkins} <span className="fs-12 text-muted fw-normal">คน-ครั้ง</span></h3>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Filter and Action Bar */}
            <Card className="border-0 shadow-sm mb-4">
                <CardBody className="p-3">
                    <Row className="g-2 align-items-center">
                        <Col lg={4}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0">
                                    <IconifyIcon icon="tabler:search" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="ค้นหาชื่อกิจกรรม, รหัส, สถานที่..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="border-start-0"
                                />
                            </InputGroup>
                        </Col>

                        <Col lg={2} sm={4}>
                            <Form.Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                <option value="">ปีการศึกษาทั้งหมด</option>
                                {academicYears.map((y) => (
                                    <option key={y} value={y}>ปีการศึกษา {y}</option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Col lg={2} sm={4}>
                            <Form.Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                                <option value="">ภาคเรียนทั้งหมด</option>
                                <option value="1">ภาคเรียนที่ 1</option>
                                <option value="2">ภาคเรียนที่ 2</option>
                                <option value="3">ภาคฤดูร้อน</option>
                            </Form.Select>
                        </Col>

                        <Col lg={2} sm={4}>
                            <Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                <option value="">ประเภททั้งหมด</option>
                                <option value="mandatory">กิจกรรมหลัก / บังคับ</option>
                                <option value="elective">กิจกรรมเลือก / สมัครใจ</option>
                            </Form.Select>
                        </Col>

                        <Col lg={2} className="d-flex gap-2">
                            <Button variant="primary" className="flex-fill d-flex align-items-center justify-content-center gap-1" onClick={handleFilter}>
                                <IconifyIcon icon="tabler:filter" /> กรอง
                            </Button>
                            {(searchQuery || selectedYear || selectedSemester || selectedType) && (
                                <Button variant="outline-secondary" onClick={handleResetFilter} title="ล้างตัวกรอง">
                                    <IconifyIcon icon="tabler:reload" />
                                </Button>
                            )}
                            <Button variant="success" className="d-flex align-items-center justify-content-center gap-1 text-nowrap" onClick={() => setShowCreateModal(true)}>
                                <IconifyIcon icon="tabler:plus" /> สร้างกิจกรรม
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Activities Table Card */}
            <Card className="border-0 shadow-sm">
                <CardBody className="p-0">
                    <div className="table-responsive">
                        <Table hover className="table-nowrap mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '90px' }}>รหัส</th>
                                    <th>ชื่อกิจกรรม</th>
                                    <th>ประเภท</th>
                                    <th>วันและเวลากิจกรรม</th>
                                    <th className="text-center">จำนวนชั่วโมง</th>
                                    <th>สถานที่ / รัศมี GPS</th>
                                    <th className="text-center">ยอดเช็กอิน</th>
                                    <th className="text-center" style={{ width: '180px' }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5 text-muted">
                                            <IconifyIcon icon="tabler:calendar-off" className="fs-48 text-secondary mb-2" />
                                            <div>ยังไม่มีข้อมูลกิจกรรมที่ตรงกับเงื่อนไขการค้นหา</div>
                                            <Button variant="outline-primary" size="sm" className="mt-2" onClick={() => setShowCreateModal(true)}>
                                                สร้างกิจกรรมใหม่
                                            </Button>
                                        </td>
                                    </tr>
                                ) : (
                                    activities.data.map((act) => {
                                        const checkinPercent = act.registrations_count > 0
                                            ? Math.round((act.attended_count / act.registrations_count) * 100)
                                            : 0;

                                        return (
                                            <tr key={act.id}>
                                                <td>
                                                    <span className="badge bg-light text-dark fw-bold border">
                                                        {act.activity_code || `A${act.id}`}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link href={`/activities/${act.id}`} className="fw-semibold text-dark text-decoration-none d-block">
                                                        {act.activity_name}
                                                    </Link>
                                                    <small className="text-muted">
                                                        ปี {act.academic_year} ภาคเรียนที่ {act.semester}
                                                    </small>
                                                </td>
                                                <td>
                                                    {act.activity_type === 'mandatory' ? (
                                                        <Badge bg="danger-subtle" className="text-danger border border-danger-subtle rounded-pill px-2">
                                                            <IconifyIcon icon="tabler:lock" className="me-1 align-middle" /> กิจกรรมบังคับ
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg="info-subtle" className="text-info border border-info-subtle rounded-pill px-2">
                                                            <IconifyIcon icon="tabler:thumb-up" className="me-1 align-middle" /> กิจกรรมเลือก
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <IconifyIcon icon="tabler:calendar" className="text-muted" />
                                                        <span>{new Date(act.activity_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                                                    </div>
                                                    <small className="text-muted d-flex align-items-center gap-1">
                                                        <IconifyIcon icon="tabler:clock" />
                                                        {act.start_time?.substring(0, 5)} - {act.end_time?.substring(0, 5)} น.
                                                    </small>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-primary-subtle text-primary fs-12 px-2 py-1">
                                                        {Number(act.total_hours).toFixed(1)} ชม.
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-truncate" style={{ maxWidth: 200 }} title={act.location_name}>
                                                        <IconifyIcon icon="tabler:map-pin" className="text-danger me-1" />
                                                        {act.location_name || 'วสส.สุพรรณบุรี'}
                                                    </div>
                                                    <small className="text-muted">
                                                        รัศมีเช็กอิน: <strong>{act.radius_limit}</strong> ม. • QR: <strong>{act.qr_refresh_interval || 60}</strong>วิ
                                                    </small>
                                                </td>
                                                <td className="text-center">
                                                    <div className="fw-semibold">
                                                        {act.attended_count} <span className="text-muted fw-normal">/ {act.registrations_count}</span>
                                                    </div>
                                                    <div className="progress mt-1" style={{ height: 4 }}>
                                                        <div
                                                            className={`progress-bar ${checkinPercent >= 80 ? 'bg-success' : checkinPercent >= 50 ? 'bg-warning' : 'bg-primary'}`}
                                                            style={{ width: `${checkinPercent}%` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <Link
                                                            href={`/activities/${act.id}`}
                                                            className="btn btn-sm btn-soft-primary"
                                                            title="ตรวจสอบและจัดการผู้เข้าร่วม"
                                                        >
                                                            <IconifyIcon icon="tabler:eye" /> จัดการ
                                                        </Link>

                                                        <Link
                                                            href={`/activities/${act.id}/live`}
                                                            target="_blank"
                                                            className="btn btn-sm btn-soft-success"
                                                            title="เปิดจอ Live QR Projector"
                                                        >
                                                            <IconifyIcon icon="tabler:qrcode" /> จอสด
                                                        </Link>

                                                        <Button
                                                            variant="soft-danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(act)}
                                                            title="ลบกิจกรรม"
                                                            disabled={act.attended_count > 0}
                                                        >
                                                            <IconifyIcon icon="tabler:trash" />
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

                    {/* Pagination */}
                    {activities.last_page > 1 && (
                        <div className="p-3 border-top d-flex justify-content-between align-items-center">
                            <span className="text-muted fs-13">
                                ทั้งหมด {activities.total} กิจกรรม (หน้า {activities.current_page} จาก {activities.last_page})
                            </span>
                            <div className="d-flex gap-1">
                                {activities.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'primary' : 'outline-light'}
                                        size="sm"
                                        className={!link.active ? 'text-dark border' : ''}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Modal: Create Activity */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered backdrop="static">
                <Form onSubmit={handleSubmitCreate}>
                    <Modal.Header closeButton className="bg-light">
                        <Modal.Title className="fs-16 d-flex align-items-center gap-2">
                            <IconifyIcon icon="tabler:calendar-plus" className="text-primary fs-20" />
                            เพิ่มกิจกรรมนักศึกษาใหม่
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">ชื่อกิจกรรม <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="เช่น พิธีไหว้ครูและบายศรีสู่ขวัญ ประจำปีการศึกษา 2569"
                                        value={data.activity_name}
                                        onChange={(e) => setData('activity_name', e.target.value)}
                                        isInvalid={!!errors.activity_name}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.activity_name}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">รหัสกิจกรรม</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="เช่น A1, ACT-2569-001"
                                        value={data.activity_code}
                                        onChange={(e) => setData('activity_code', e.target.value)}
                                    />
                                    <small className="text-muted">เว้นว่างไว้เพื่อให้ระบบสร้างอัตโนมัติ</small>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">ปีการศึกษา <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={data.academic_year}
                                        onChange={(e) => setData('academic_year', parseInt(e.target.value))}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">ภาคเรียน <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={data.semester}
                                        onChange={(e) => setData('semester', parseInt(e.target.value))}
                                    >
                                        <option value={1}>ภาคเรียนที่ 1</option>
                                        <option value={2}>ภาคเรียนที่ 2</option>
                                        <option value={3}>ภาคฤดูร้อน</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">ประเภทกิจกรรม <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={data.activity_type}
                                        onChange={(e) => setData('activity_type', e.target.value as any)}
                                    >
                                        <option value="mandatory">กิจกรรมหลัก / บังคับ</option>
                                        <option value="elective">กิจกรรมเลือก / สมัครใจ</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">วันที่จัดกิจกรรม <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={data.activity_date}
                                        onChange={(e) => setData('activity_date', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">เวลาเริ่มต้น <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">เวลาสิ้นสุด <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">จำนวนชั่วโมงกิจกรรม <span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="number"
                                            step="0.5"
                                            min="0.5"
                                            value={data.total_hours}
                                            onChange={(e) => setData('total_hours', parseFloat(e.target.value))}
                                            required
                                        />
                                        <InputGroup.Text>ชม.</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>
                            </Col>

                            <Col md={7}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">สถานที่จัดกิจกรรม</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="เช่น หอประชุมใหญ่ อาคารอำนวยการ วสส.สุพรรณบุรี"
                                        value={data.location_name}
                                        onChange={(e) => setData('location_name', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={5}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold d-flex align-items-center gap-1">
                                        <IconifyIcon icon="tabler:clock-bolt" className="text-warning" /> รอบเปลี่ยน QR Code
                                    </Form.Label>
                                    <Form.Select
                                        value={data.qr_refresh_interval}
                                        onChange={(e) => setData('qr_refresh_interval', parseInt(e.target.value))}
                                    >
                                        <option value={15}>15 วินาที (ป้องกันการแชร์สูงสุด)</option>
                                        <option value={30}>30 วินาที (เร็ว)</option>
                                        <option value={45}>45 วินาที</option>
                                        <option value={60}>60 วินาที (มาตรฐาน - แนะนำ)</option>
                                        <option value={90}>90 วินาที (1 นาทีครึ่ง)</option>
                                        <option value={120}>120 วินาที (2 นาที)</option>
                                        <option value={180}>180 วินาที (3 นาที)</option>
                                        <option value={300}>300 วินาที (5 นาที - จอใหญ่)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* GPS Geofencing Setting */}
                            <Col md={12}>
                                <div className="p-3 bg-light rounded-3 border">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                                        <div className="fw-semibold text-primary d-flex align-items-center gap-1">
                                            <IconifyIcon icon="tabler:current-location" /> การกำหนดตำแหน่งและรัศมี GPS สำหรับเช็กอิน (Geofencing)
                                        </div>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={handleFetchCurrentDeviceLocation}
                                                disabled={isLocatingDevice}
                                                className="d-flex align-items-center gap-1 shadow-sm"
                                                type="button"
                                                title="ดึงพิกัด GPS ปัจจุบันจากอุปกรณ์มือถือหรือคอมพิวเตอร์นี้"
                                            >
                                                <IconifyIcon icon={isLocatingDevice ? 'tabler:loader' : 'tabler:device-mobile'} className={isLocatingDevice ? 'spin' : ''} />
                                                {isLocatingDevice ? 'กำลังดึงพิกัด...' : 'ดึงพิกัดปัจจุบันจากอุปกรณ์'}
                                            </Button>

                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => setShowMapPicker(true)}
                                                className="d-flex align-items-center gap-1 shadow-sm"
                                                type="button"
                                                title="เปิดแผนที่เพื่อคลิกเลือกจุดจัดงานหรือปักหมุด"
                                            >
                                                <IconifyIcon icon="tabler:map" />
                                                เปิดแผนที่เลือกพิกัด / ปักหมุด
                                            </Button>
                                        </div>
                                    </div>

                                    <Row className="g-2">
                                        <Col md={4}>
                                            <Form.Label className="fs-12 text-muted">ละติจูด (Latitude)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.000001"
                                                value={data.latitude}
                                                onChange={(e) => setData('latitude', parseFloat(e.target.value) || 0)}
                                            />
                                        </Col>
                                        <Col md={4}>
                                            <Form.Label className="fs-12 text-muted">ลองจิจูด (Longitude)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.000001"
                                                value={data.longitude}
                                                onChange={(e) => setData('longitude', parseFloat(e.target.value) || 0)}
                                            />
                                        </Col>
                                        <Col md={4}>
                                            <Form.Label className="fs-12 text-muted">รัศมีที่อนุญาต (เมตร)</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="number"
                                                    value={data.radius_limit}
                                                    onChange={(e) => setData('radius_limit', parseInt(e.target.value) || 50)}
                                                />
                                                <InputGroup.Text>ม.</InputGroup.Text>
                                            </InputGroup>
                                        </Col>
                                    </Row>

                                    <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-1">
                                        <small className="text-muted">
                                            * ค่าเริ่มต้นคือพิกัดวิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี (14.475685, 100.116528)
                                        </small>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="fs-12 text-decoration-none d-flex align-items-center gap-1 text-danger"
                                        >
                                            <IconifyIcon icon="tabler:brand-google-maps" /> ดูตำแหน่งนี้บน Google Maps &gt;
                                        </a>
                                    </div>
                                </div>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">รายละเอียดกิจกรรมเพิ่มเติม</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="ระบุวัตถุประสงค์ คำชี้แจงการแต่งกาย และรายละเอียดข้อกำหนด..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="bg-light">
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            ยกเลิก
                        </Button>
                        <Button variant="success" type="submit" disabled={processing} className="d-flex align-items-center gap-1">
                            <IconifyIcon icon="tabler:check" /> บันทึกและเปิดกิจกรรม
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal: Interactive Map Picker */}
            <LocationMapPickerModal
                show={showMapPicker}
                onHide={() => setShowMapPicker(false)}
                latitude={data.latitude}
                longitude={data.longitude}
                radius={data.radius_limit}
                locationName={data.location_name}
                onConfirm={(lat, lng, radius) => {
                    setData((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                        radius_limit: radius || prev.radius_limit,
                    }));
                }}
            />
        </MainLayout>
    );
}
