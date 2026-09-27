import React, { useState } from 'react';
import { Badge, Button, Row, Col, Modal } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Link, usePage } from '@inertiajs/react';
import { formatThaiDate } from '@/utils/date';

export interface ActivityItem {
    id: number;
    activity_code: string;
    activity_name: string;
    activity_type: string;
    activity_date: string;
    start_time: string | null;
    end_time: string | null;
    total_hours: number;
    location_name: string | null;
    status: string;
    max_participants: number | null;
    description: string | null;
    registrations_count?: number;
    creator?: {
        id: number;
        name: string;
    } | null;
}

interface Props {
    activities: ActivityItem[];
    totalCount?: number;
}

const UpcomingActivitiesSection: React.FC<Props> = ({ activities = [], totalCount }) => {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isStaff = user?.role === 'admin' || user?.role === 'staff' || user?.role === 'teacher';
    const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

    const count = totalCount !== undefined ? totalCount : activities.length;

    // Helper: ตรวจสอบว่าเป็นกิจกรรมของวันนี้หรือไม่
    const isToday = (dateStr: string) => {
        if (!dateStr) return false;
        const today = new Date();
        const actDate = new Date(dateStr);
        return (
            today.getFullYear() === actDate.getFullYear() &&
            today.getMonth() === actDate.getMonth() &&
            today.getDate() === actDate.getDate()
        );
    };

    // Helper: แปลงเวลา
    const formatTimeRange = (start?: string | null, end?: string | null) => {
        if (!start && !end) return 'ไม่ระบุเวลา';
        const s = start ? start.substring(0, 5) : '';
        const e = end ? end.substring(0, 5) : '';
        if (s && e) return `${s} - ${e} น.`;
        if (s) return `ตั้งแต่ ${s} น.`;
        return `ถึง ${e} น.`;
    };

    // Helper: ประเภทกิจกรรม
    const getActivityTypeBadge = (type: string) => {
        switch (type) {
            case 'mandatory':
                return <Badge bg="danger-subtle" className="text-danger border border-danger-subtle fs-11 px-2 py-1">กิจกรรมบังคับ</Badge>;
            case 'elective':
                return <Badge bg="info-subtle" className="text-info border border-info-subtle fs-11 px-2 py-1">กิจกรรมเลือก</Badge>;
            default:
                return <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle fs-11 px-2 py-1">กิจกรรมทั่วไป</Badge>;
        }
    };

    // Helper: สถานะกิจกรรม
    const getStatusBadge = (status: string, dateStr: string) => {
        if (status === 'ongoing') {
            return (
                <Badge bg="success" className="d-inline-flex align-items-center gap-1 fs-11 px-2 py-1 shadow-sm">
                    <span className="spinner-grow spinner-grow-sm" style={{ width: '6px', height: '6px' }} />
                    กำลังดำเนินการ
                </Badge>
            );
        }
        if (isToday(dateStr)) {
            return (
                <Badge bg="warning" className="text-dark d-inline-flex align-items-center gap-1 fs-11 px-2 py-1 shadow-sm fw-bold">
                    <IconifyIcon icon="tabler:bell-ringing" className="fs-12" />
                    วันนี้
                </Badge>
            );
        }
        return (
            <Badge bg="primary-subtle" className="text-primary border border-primary-subtle fs-11 px-2 py-1">
                เปิดรับ / กำหนดการ
            </Badge>
        );
    };

    // แยกวัน เดือน ปี ภาษาไทย
    const parseThaiDayMonth = (dateStr: string) => {
        if (!dateStr) return { day: '-', month: '-', year: '-' };
        const clean = dateStr.split('T')[0].split(' ')[0];
        const parts = clean.split('-');
        if (parts.length === 3) {
            const day = parseInt(parts[2], 10);
            const monthIdx = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[0], 10);
            const thaiMonths = [
                'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
            ];
            return {
                day: String(day),
                month: thaiMonths[monthIdx] || '-',
                year: String(year > 2400 ? year : year + 543),
            };
        }
        return { day: '-', month: '-', year: '-' };
    };

    return (
        <div className="mb-4">
            {/* Header (No outer card frame) */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-3">
                    <div 
                        className="d-flex align-items-center justify-content-center text-primary rounded-3 bg-white shadow-sm border"
                        style={{ width: '44px', height: '44px' }}
                    >
                        <IconifyIcon icon="solar:calendar-date-bold-duotone" className="fs-24 text-primary" />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <h5 className="mb-0 fw-bold text-dark fs-18">
                                กิจกรรมที่กำลังจะเกิดขึ้น
                            </h5>
                            <Badge bg="primary" className="rounded-pill fs-12 px-2.5 py-1">
                                {count} กิจกรรม
                            </Badge>
                        </div>
                        <small className="text-muted fs-12">
                            กำหนดการและกิจกรรมพัฒนานักศึกษาที่กำลังจะมาถึง
                        </small>
                    </div>
                </div>

                <div>
                    <Link
                        href={isStaff ? '/activities' : '/student/activities'}
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 d-inline-flex align-items-center gap-1 shadow-sm"
                    >
                        <span>{isStaff ? 'จัดการกิจกรรมทั้งหมด' : 'ดูกิจกรรมทั้งหมด / เช็กอิน'}</span>
                        <IconifyIcon icon="tabler:arrow-right" className="fs-14" />
                    </Link>
                </div>
            </div>

            {/* Activities List - 3 Cards per Row Grid */}
            {activities.length === 0 ? (
                <div className="bg-white rounded-3 border p-5 text-center shadow-sm">
                    <div 
                        className="d-inline-flex align-items-center justify-content-center text-muted rounded-circle mb-3"
                        style={{ width: '64px', height: '64px', backgroundColor: '#f3f4f6' }}
                    >
                        <IconifyIcon icon="tabler:calendar-smile" className="fs-32 text-secondary" />
                    </div>
                    <h6 className="fw-semibold text-dark fs-15 mb-1">ยังไม่มีกิจกรรมที่กำลังจะเกิดขึ้นในเร็วๆ นี้</h6>
                    <p className="text-muted fs-13 mb-3">สามารถติดตามข่าวสารหรือตรวจสอบประวัติกิจกรรมที่ผ่านมาได้</p>
                    <Link
                        href={isStaff ? '/activities' : '/student/activity-history'}
                        className="btn btn-sm btn-light border px-3"
                    >
                        <IconifyIcon icon="tabler:history" className="me-1" />
                        ดูประวัติกิจกรรมที่ผ่านมา
                    </Link>
                </div>
            ) : (
                <Row className="g-3">
                    {activities.map((act) => {
                        const dateInfo = parseThaiDayMonth(act.activity_date);
                        const actIsToday = isToday(act.activity_date);

                        return (
                            <Col key={act.id} xs={12} md={6} lg={4}>
                                <div 
                                    className={`h-100 rounded-3 border d-flex flex-column justify-content-between transition-all bg-white p-3 ${
                                        actIsToday ? 'border-warning' : 'hover-shadow'
                                    }`}
                                    style={{ 
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        borderLeft: actIsToday ? '5px solid #f59e0b' : '5px solid #3b82f6',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                    }}
                                >
                                    <div>
                                        {/* Top: Calendar Date + Badges */}
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            {/* Calendar Date Block */}
                                            <div 
                                                className={`d-flex flex-column align-items-center justify-content-center rounded-3 text-center flex-shrink-0 ${
                                                    actIsToday 
                                                        ? 'bg-warning text-dark shadow-sm' 
                                                        : 'bg-primary-subtle text-primary border border-primary-subtle'
                                                }`}
                                                style={{ width: '56px', height: '62px' }}
                                            >
                                                <span className="fs-18 fw-bolder lh-1">{dateInfo.day}</span>
                                                <span className="fs-11 fw-semibold mt-1">{dateInfo.month}</span>
                                                <span className="fs-10 opacity-75">{dateInfo.year}</span>
                                            </div>

                                            {/* Badges Column: 2 Balanced Rows matching Date block height */}
                                            <div className="flex-grow-1 min-w-0 d-flex flex-column justify-content-between" style={{ height: '62px' }}>
                                                {/* Row 1: Code (left) + Status (right) */}
                                                <div className="d-flex align-items-center justify-content-between gap-1.5">
                                                    <span className="badge bg-light text-secondary border fs-11 font-monospace px-2 py-1">
                                                        {act.activity_code || 'ACT'}
                                                    </span>
                                                    {getStatusBadge(act.status, act.activity_date)}
                                                </div>

                                                {/* Row 2: Type (left) + Hours (right) */}
                                                <div className="d-flex align-items-center justify-content-between gap-1.5">
                                                    {getActivityTypeBadge(act.activity_type)}
                                                    {act.total_hours > 0 ? (
                                                        <Badge bg="light" className="text-dark border fs-11 px-2 py-1 d-inline-flex align-items-center">
                                                            <IconifyIcon icon="tabler:clock" className="me-1 fs-11 text-muted" />
                                                            {act.total_hours} ชม.
                                                        </Badge>
                                                    ) : (
                                                        <span />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity Title */}
                                        <h5 
                                            className="fw-bold text-dark fs-15 mb-2.5 cursor-pointer lh-base hover-text-primary"
                                            onClick={() => setSelectedActivity(act)}
                                            title={act.activity_name}
                                            style={{ 
                                                minHeight: '44px',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {act.activity_name}
                                        </h5>

                                        {/* Meta Info: Time, Location, Participants */}
                                        <div className="d-flex flex-column gap-2 text-muted fs-12 mb-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <IconifyIcon icon="tabler:clock-hour-4" className="text-primary flex-shrink-0 fs-15" />
                                                <span className="text-truncate">{formatTimeRange(act.start_time, act.end_time)}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <IconifyIcon icon="tabler:map-pin" className="text-danger flex-shrink-0 fs-15" />
                                                <span className="text-truncate" title={act.location_name || 'ไม่ระบุสถานที่'}>
                                                    {act.location_name || 'สถาบันฯ / ออนไลน์'}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between gap-2">
                                                <div className="d-flex align-items-center gap-1.5">
                                                    <IconifyIcon icon="tabler:users" className="text-info flex-shrink-0 fs-15" />
                                                    <span>ผู้เข้าร่วม:</span>
                                                </div>
                                                <span className="fw-semibold text-dark">
                                                    {act.registrations_count || 0}
                                                    {act.max_participants ? `/${act.max_participants}` : ''} คน
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-2 d-flex align-items-center justify-content-between gap-2 mt-auto">
                                        <Button 
                                            variant="light" 
                                            size="sm" 
                                            className="border py-1.5 px-2.5 fs-12 text-muted d-inline-flex align-items-center gap-1"
                                            onClick={() => setSelectedActivity(act)}
                                        >
                                            <IconifyIcon icon="tabler:info-circle" className="fs-14" />
                                            <span>รายละเอียด</span>
                                        </Button>

                                        {isStaff ? (
                                            <Link
                                                href={`/activities/${act.id}`}
                                                className="btn btn-sm btn-primary py-1.5 px-3 fs-12 d-inline-flex align-items-center gap-1 shadow-sm"
                                            >
                                                <IconifyIcon icon="tabler:settings" className="fs-14" />
                                                <span>จัดการ</span>
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/student/activities/${act.id}/check-in`}
                                                className="btn btn-sm btn-success py-1.5 px-3 fs-12 d-inline-flex align-items-center gap-1 shadow-sm"
                                            >
                                                <IconifyIcon icon="tabler:qrcode" className="fs-14" />
                                                <span>เช็กอิน</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* Activity Detail Modal */}
            <Modal show={!!selectedActivity} onHide={() => setSelectedActivity(null)} centered size="lg">
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="fs-16 fw-bold text-dark d-flex align-items-center gap-2">
                        <IconifyIcon icon="solar:calendar-date-bold-duotone" className="text-primary fs-20" />
                        <span>รายละเอียดกิจกรรม</span>
                    </Modal.Title>
                </Modal.Header>
                {selectedActivity && (
                    <Modal.Body className="p-4">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="badge bg-light text-secondary border font-monospace">
                                {selectedActivity.activity_code}
                            </span>
                            {getActivityTypeBadge(selectedActivity.activity_type)}
                            {getStatusBadge(selectedActivity.status, selectedActivity.activity_date)}
                        </div>

                        <h4 className="fw-bold text-dark fs-18 mb-3">
                            {selectedActivity.activity_name}
                        </h4>

                        <Row className="g-3 mb-4 bg-light p-3 rounded-3 border">
                            <Col sm={6} md={3}>
                                <small className="text-muted d-block mb-1">วันที่จัดกิจกรรม</small>
                                <strong className="text-dark fs-13 d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:calendar" className="text-primary" />
                                    {formatThaiDate(selectedActivity.activity_date)}
                                </strong>
                            </Col>
                            <Col sm={6} md={3}>
                                <small className="text-muted d-block mb-1">เวลา</small>
                                <strong className="text-dark fs-13 d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:clock" className="text-primary" />
                                    {formatTimeRange(selectedActivity.start_time, selectedActivity.end_time)}
                                </strong>
                            </Col>
                            <Col sm={6} md={3}>
                                <small className="text-muted d-block mb-1">จำนวนชั่วโมงกิจกรรม</small>
                                <strong className="text-dark fs-13 d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:hourglass-high" className="text-warning" />
                                    {selectedActivity.total_hours} ชั่วโมง
                                </strong>
                            </Col>
                            <Col sm={6} md={3}>
                                <small className="text-muted d-block mb-1">สถานที่</small>
                                <strong className="text-dark fs-13 d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:map-pin" className="text-danger" />
                                    {selectedActivity.location_name || 'ไม่ระบุสถานที่'}
                                </strong>
                            </Col>
                        </Row>

                        {selectedActivity.description && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-dark fs-14 mb-2">คำอธิบายและรายละเอียด:</h6>
                                <div className="p-3 bg-white border rounded-3 fs-13 text-secondary" style={{ whiteSpace: 'pre-line' }}>
                                    {selectedActivity.description}
                                </div>
                            </div>
                        )}

                        <div className="d-flex align-items-center justify-content-between pt-2 text-muted fs-12">
                            <span>ผู้สร้างกิจกรรม: {selectedActivity.creator?.name || 'ผู้ดูแลระบบ'}</span>
                            <span>
                                ผู้เข้าร่วมแล้ว: <strong>{selectedActivity.registrations_count || 0}</strong>
                                {selectedActivity.max_participants ? ` / ${selectedActivity.max_participants}` : ''} คน
                            </span>
                        </div>
                    </Modal.Body>
                )}
                <Modal.Footer className="border-top py-2">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedActivity(null)}>
                        ปิด
                    </Button>
                    {selectedActivity && (
                        isStaff ? (
                            <Link href={`/activities/${selectedActivity.id}`} className="btn btn-sm btn-primary">
                                ไปยังหน้าจัดการกิจกรรม
                            </Link>
                        ) : (
                            <Link href={`/student/activities/${selectedActivity.id}/check-in`} className="btn btn-sm btn-success">
                                สแกนเช็กอินกิจกรรมนี้
                            </Link>
                        )
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UpcomingActivitiesSection;
