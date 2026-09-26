import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Button, Badge, Nav, Tab } from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';

interface ActivityItem {
    id: number;
    activity_code: string;
    activity_name: string;
    activity_type: string;
    activity_date: string;
    activity_date_th: string;
    start_time: string;
    end_time: string;
    total_hours: number;
    location_name: string;
    latitude?: number;
    longitude?: number;
    radius_limit: number;
    description?: string;
    is_required: boolean;
    registration?: {
        id: number;
        status: string;
        check_in_time?: string | null;
        check_out_time?: string | null;
        actual_hours: number;
        attendance_type: string;
    } | null;
}

interface PageProps {
    studentProfile?: {
        student_code: string;
        first_name_th: string;
        last_name_th: string;
        faculty: string;
        major: string;
        class_year: string;
    } | null;
    mandatoryActivities: ActivityItem[];
    electiveActivities: ActivityItem[];
    summary: {
        current_year_hours: number;
        total_lifetime_hours: number;
        attended_activities_count: number;
    };
}

export default function StudentActivitiesDashboard({
    studentProfile,
    mandatoryActivities,
    electiveActivities,
    summary,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<'mandatory' | 'elective'>('mandatory');

    const handleRegisterElective = (activity: ActivityItem) => {
        Swal.fire({
            title: `ลงทะเบียนเข้าร่วมกิจกรรม?`,
            text: activity.activity_name,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#465dff',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'ยืนยันลงทะเบียน',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/student/activities/${activity.id}/register`, {}, {
                    onSuccess: () => {
                        Swal.fire('สำเร็จ', 'ลงทะเบียนเข้าร่วมกิจกรรมเรียบร้อยแล้ว', 'success');
                    },
                });
            }
        });
    };

    const renderActivityCard = (act: ActivityItem) => {
        const isRegistered = !!act.registration;
        const isAttended = act.registration?.status === 'attended';
        const isCompletedFull = act.registration?.attendance_type === 'full';

        return (
            <Col lg={6} key={act.id}>
                <Card className="border-0 shadow-sm h-100 overflow-hidden">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center py-2 px-3 border-bottom border-dashed">
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary fs-12 px-2">
                                {act.activity_code || `A${act.id}`}
                            </span>
                            {act.is_required ? (
                                <Badge bg="danger-subtle" className="text-danger border border-danger-subtle rounded-pill">
                                    <IconifyIcon icon="tabler:alert-circle" className="me-1 align-middle" /> บังคับเข้าร่วม
                                </Badge>
                            ) : (
                                <Badge bg="info-subtle" className="text-info border border-info-subtle rounded-pill">
                                    <IconifyIcon icon="tabler:heart-handshake" className="me-1 align-middle" /> สมัครใจ
                                </Badge>
                            )}
                        </div>

                        <div>
                            {isCompletedFull ? (
                                <Badge bg="success" className="px-2 py-1">
                                    <IconifyIcon icon="tabler:circle-check" className="me-1 align-middle" /> ครบเต็มเวลา ({act.registration?.actual_hours} ชม.)
                                </Badge>
                            ) : isAttended ? (
                                <Badge bg="warning" className="px-2 py-1 text-dark">
                                    <IconifyIcon icon="tabler:clock-check" className="me-1 align-middle" /> เช็กอินแล้ว ({act.registration?.actual_hours} ชม.)
                                </Badge>
                            ) : isRegistered ? (
                                <Badge bg="secondary-subtle" className="text-secondary border">
                                    ลงทะเบียนแล้ว
                                </Badge>
                            ) : (
                                <Badge bg="light" className="text-muted border">
                                    เปิดรับสมัคร
                                </Badge>
                            )}
                        </div>
                    </div>

                    <CardBody className="p-3 d-flex flex-column justify-content-between">
                        <div>
                            <h5 className="fw-bold text-dark mb-2">{act.activity_name}</h5>
                            <p className="text-muted fs-13 mb-3 text-truncate-2">
                                {act.description || 'เข้าร่วมกิจกรรมเพื่อสะสมชั่วโมงและพัฒนาทักษะวิชาชีพ'}
                            </p>

                            <div className="d-flex flex-column gap-1 fs-13 mb-3">
                                <div className="text-muted d-flex align-items-center gap-2">
                                    <IconifyIcon icon="tabler:calendar" className="text-primary fs-16" />
                                    <span>วันที่: <strong>{act.activity_date_th}</strong></span>
                                </div>
                                <div className="text-muted d-flex align-items-center gap-2">
                                    <IconifyIcon icon="tabler:clock" className="text-primary fs-16" />
                                    <span>เวลา: <strong>{act.start_time?.substring(0, 5)} - {act.end_time?.substring(0, 5)} น.</strong> ({Number(act.total_hours).toFixed(1)} ชั่วโมง)</span>
                                </div>
                                <div className="text-muted d-flex align-items-center gap-2">
                                    <IconifyIcon icon="tabler:map-pin" className="text-danger fs-16" />
                                    <span className="text-truncate">สถานที่: <strong>{act.location_name}</strong> (รัศมี {act.radius_limit} ม.)</span>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex gap-2 pt-2 border-top">
                            <Link
                                href={`/student/activities/${act.id}/check-in`}
                                className={`btn flex-fill d-flex align-items-center justify-content-center gap-1 ${isAttended ? 'btn-success' : 'btn-primary'}`}
                            >
                                <IconifyIcon icon={isAttended ? 'tabler:check' : 'tabler:qrcode'} className="fs-18" />
                                {isAttended ? 'ดูสถานะการเช็กอิน / เช็กเอาต์' : 'ไปที่หน้าเช็กอินเข้าร่วม'}
                            </Link>

                            {!isRegistered && !act.is_required && (
                                <Button
                                    variant="outline-primary"
                                    onClick={() => handleRegisterElective(act)}
                                    className="d-flex align-items-center gap-1"
                                >
                                    <IconifyIcon icon="tabler:user-plus" /> ลงทะเบียน
                                </Button>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </Col>
        );
    };

    return (
        <MainLayout>
            <PageTitle
                title="กิจกรรมนักศึกษา"
                subTitle="ระบบลงทะเบียนและตรวจสอบการเข้าร่วมกิจกรรม"
                titleSuffix={
                    <Link
                        href="/student/activities/guide"
                        className="btn btn-sm btn-outline-info rounded-pill d-inline-flex align-items-center gap-1 shadow-sm px-2 py-1 ms-1"
                        title="คู่มือขั้นตอนการเข้าร่วมกิจกรรมสำหรับนักศึกษา"
                    >
                        <IconifyIcon icon="tabler:help" className="fs-15" />
                        <span className="fs-12 fw-semibold">คู่มือการใช้งาน</span>
                    </Link>
                }
            />

            {/* Profile & Hours Summary Banner */}
            <Card className="border-0 shadow-sm mb-4 text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #465dff 0%, #783bff 100%)' }}>
                <CardBody className="p-4">
                    <Row className="align-items-center g-3">
                        <Col md={8}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="avatar-lg rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center text-white" style={{ width: 64, height: 64 }}>
                                    <IconifyIcon icon="tabler:user" className="fs-32" />
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-1 text-white">
                                        {studentProfile ? `${studentProfile.first_name_th} ${studentProfile.last_name_th}` : 'นักศึกษา'}
                                    </h4>
                                    <div className="text-white-50 fs-13">
                                        รหัสนักศึกษา: <strong>{studentProfile?.student_code || '-'}</strong> • สาขา: <strong>{studentProfile?.major || 'สาธารณสุขชุมชน'}</strong> • {studentProfile?.class_year || 'นักศึกษา'}
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col md={4} className="text-md-end">
                            <div className="bg-white bg-opacity-10 p-3 rounded-3 d-inline-block text-center border border-white border-opacity-25">
                                <div className="text-white-50 fs-12 mb-1">ชั่วโมงกิจกรรมสะสมปีนี้</div>
                                <div className="display-6 fw-bold text-white mb-0">
                                    {Number(summary.current_year_hours).toFixed(1)} <span className="fs-14 fw-normal">ชม.</span>
                                </div>
                                <Link href="/student/activity-history" className="text-white fs-12 text-decoration-underline mt-1 d-block">
                                    ดูประวัติทั้งหมด &gt;
                                </Link>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Tabs for Mandatory and Elective */}
            <Card className="border-0 shadow-sm mb-4">
                <CardBody className="p-2">
                    <Nav variant="pills" className="nav-justified gap-2">
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'mandatory'}
                                onClick={() => setActiveTab('mandatory')}
                                className="d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
                            >
                                <IconifyIcon icon="tabler:alert-circle" className="fs-18 text-danger" />
                                กิจกรรมที่ถูกบังคับ ({mandatoryActivities.length})
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'elective'}
                                onClick={() => setActiveTab('elective')}
                                className="d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
                            >
                                <IconifyIcon icon="tabler:thumb-up" className="fs-18 text-info" />
                                กิจกรรมที่เปิดรับสมัคร / เลือกเสรี ({electiveActivities.length})
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </CardBody>
            </Card>

            {/* Activity Cards List */}
            {activeTab === 'mandatory' && (
                <Row className="g-3">
                    {mandatoryActivities.length === 0 ? (
                        <Col xs={12}>
                            <Card className="border-0 shadow-sm text-center py-5">
                                <CardBody>
                                    <IconifyIcon icon="tabler:calendar-check" className="fs-48 text-muted mb-2" />
                                    <h5 className="text-muted">ไม่มีกิจกรรมบังคับในขณะนี้</h5>
                                    <p className="text-muted fs-13 mb-0">อาจารย์จะประกาศกิจกรรมใหม่ให้ทราบเมื่อมีกิจกรรมในหลักสูตร</p>
                                </CardBody>
                            </Card>
                        </Col>
                    ) : (
                        mandatoryActivities.map((act) => renderActivityCard(act))
                    )}
                </Row>
            )}

            {activeTab === 'elective' && (
                <Row className="g-3">
                    {electiveActivities.length === 0 ? (
                        <Col xs={12}>
                            <Card className="border-0 shadow-sm text-center py-5">
                                <CardBody>
                                    <IconifyIcon icon="tabler:sparkles" className="fs-48 text-muted mb-2" />
                                    <h5 className="text-muted">ยังไม่มีกิจกรรมเลือกที่เปิดรับสมัคร</h5>
                                    <p className="text-muted fs-13 mb-0">โปรดติดตามประกาศกิจกรรมทางเลือกเพื่อเก็บชั่วโมงเพิ่มเติม</p>
                                </CardBody>
                            </Card>
                        </Col>
                    ) : (
                        electiveActivities.map((act) => renderActivityCard(act))
                    )}
                </Row>
            )}
        </MainLayout>
    );
}
