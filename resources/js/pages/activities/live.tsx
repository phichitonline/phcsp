import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Badge, Button, ProgressBar } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { QRCodeSVG } from 'qrcode.react';

interface ActivityDetail {
    id: number;
    activity_code: string;
    academic_year: number;
    semester: number;
    activity_name: string;
    activity_type: string;
    activity_date: string;
    start_time: string;
    end_time: string;
    total_hours: number;
    location_name: string;
    radius_limit: number;
}

interface RecentCheckin {
    id: number;
    student_code?: string;
    check_in_time: string;
    check_in_method?: string;
    user?: {
        name: string;
        student_profile?: {
            student_code?: string;
            first_name_th: string;
            last_name_th: string;
            title_prefix: string;
            major: string;
            class_year: string;
            avatar_path?: string;
        } | null;
    };
}

interface PageProps {
    activity: ActivityDetail;
    currentQrToken: string;
    recentCheckins: RecentCheckin[];
    totalCheckedIn: number;
}

export default function ActivityLiveScreen({
    activity,
    currentQrToken,
    recentCheckins: initialRecentCheckins,
    totalCheckedIn: initialTotalCheckedIn,
}: PageProps) {
    const [qrToken, setQrToken] = useState(currentQrToken);
    const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>(initialRecentCheckins);
    const [totalCheckedIn, setTotalCheckedIn] = useState(initialTotalCheckedIn);
    const [secondsLeft, setSecondsLeft] = useState(60 - (Math.floor(Date.now() / 1000) % 60));
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Fetch refreshed token & check-ins every 5 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/activities/${activity.id}/dynamic-qr`);
                if (res.ok) {
                    const json = await res.json();
                    setQrToken(json.qr_token);
                    setTotalCheckedIn(json.checked_in_count);
                    setSecondsLeft(json.expires_in_seconds);
                }
            } catch (e) {
                // Ignore network glitch
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activity.id]);

    // Local tick countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 60));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    const checkInUrl = `${window.location.origin}/student/activities/${activity.id}/check-in?token=${qrToken}`;

    return (
        <div className="bg-dark text-white min-vh-100 p-4 d-flex flex-column justify-content-between" style={{ background: 'linear-gradient(135deg, #131722 0%, #1e2538 100%)' }}>
            <Head title={`Live QR: ${activity.activity_name}`} />

            {/* Top Bar */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="avatar-md bg-primary rounded-3 d-flex align-items-center justify-content-center text-white p-2">
                        <IconifyIcon icon="tabler:school" className="fs-28" />
                    </div>
                    <div>
                        <div className="text-info fw-semibold fs-14">
                            วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี
                        </div>
                        <h3 className="mb-0 fw-bold text-white">{activity.activity_name}</h3>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                        <div className="text-white-50 fs-13">สถานที่: {activity.location_name}</div>
                        <div className="badge bg-primary-subtle text-primary border border-primary-subtle fs-14 px-3 py-1">
                            ชั่วโมงกิจกรรม: {Number(activity.total_hours).toFixed(1)} ชม.
                        </div>
                    </div>
                    <Button variant="outline-light" size="sm" onClick={toggleFullscreen} className="d-flex align-items-center gap-1">
                        <IconifyIcon icon={isFullscreen ? 'tabler:minimize' : 'tabler:maximize'} className="fs-18" />
                        {isFullscreen ? 'ออกจอเต็ม' : 'เต็มจอ'}
                    </Button>
                    <Link href={`/activities/${activity.id}`} className="btn btn-outline-secondary btn-sm text-white">
                        กลับหน้าจัดการ
                    </Link>
                </div>
            </div>

            {/* Main Stage */}
            <Row className="g-4 align-items-center my-auto">
                {/* Left: Dynamic QR Code Box */}
                <Col lg={6} className="text-center">
                    <div
                        className="bg-white text-dark p-4 rounded-4 shadow-lg d-inline-block position-relative border border-4 border-primary"
                        style={{ maxWidth: 440 }}
                    >
                        <div className="mb-2 fw-bold text-primary fs-18 d-flex align-items-center justify-content-center gap-2">
                            <IconifyIcon icon="tabler:qrcode" className="fs-24" /> สแกนลงชื่อเข้าร่วมกิจกรรม
                        </div>

                        <div className="p-3 bg-light rounded-3 d-inline-block">
                            <QRCodeSVG value={checkInUrl} size={300} level="H" />
                        </div>

                        {/* Rotation Timer */}
                        <div className="mt-3">
                            <div className="d-flex justify-content-between fs-12 text-muted mb-1">
                                <span><IconifyIcon icon="tabler:shield-lock" /> รหัสป้องกันการส่งต่อ (Dynamic Token)</span>
                                <span className="fw-bold text-primary">หมุนเวียนใน {secondsLeft} วิ</span>
                            </div>
                            <ProgressBar
                                variant={secondsLeft <= 10 ? 'danger' : 'primary'}
                                now={(secondsLeft / 60) * 100}
                                style={{ height: 6 }}
                                animated
                            />
                        </div>

                        <div className="mt-3 fs-13 text-secondary bg-light p-2 rounded-2">
                            <IconifyIcon icon="tabler:map-pin" className="text-danger me-1" />
                            ระบบตรวจสอบพิกัด GPS อัตโนมัติ (รัศมี {activity.radius_limit} ม.)
                        </div>
                    </div>
                </Col>

                {/* Right: Real-time Stats & Recent Check-ins */}
                <Col lg={6}>
                    <div className="p-4 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 shadow-lg">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h6 className="text-uppercase text-white-50 fs-13 mb-1">จำนวนผู้เช็กอินแล้ว ณ ขณะนี้</h6>
                                <div className="display-3 fw-bold text-success d-flex align-items-baseline gap-2">
                                    {totalCheckedIn}
                                    <span className="fs-20 text-white-50 fw-normal">คน</span>
                                </div>
                            </div>
                            <div className="text-end">
                                <Badge bg="success" className="px-3 py-2 fs-14 pulse">
                                    <IconifyIcon icon="tabler:broadcast" className="me-1 align-middle" /> Live Real-time
                                </Badge>
                            </div>
                        </div>

                        <hr className="border-secondary border-opacity-25" />

                        <div className="fw-semibold text-white mb-2 fs-14 d-flex align-items-center gap-1">
                            <IconifyIcon icon="tabler:history" /> รายชื่อผู้เช็กอินล่าสุด
                        </div>

                        <div className="overflow-auto" style={{ maxHeight: 280 }}>
                            {recentCheckins.length === 0 ? (
                                <div className="text-center py-4 text-white-50">
                                    <IconifyIcon icon="tabler:clock-hour-4" className="fs-36 mb-2" />
                                    <div>กำลังรอผู้เข้าร่วมสแกนเช็กอิน...</div>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {recentCheckins.map((item) => {
                                        const profile = item.user?.student_profile;
                                        const name = profile
                                            ? `${profile.title_prefix || ''}${profile.first_name_th} ${profile.last_name_th}`
                                            : item.user?.name;

                                        return (
                                            <div
                                                key={item.id}
                                                className="d-flex justify-content-between align-items-center p-2 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25"
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="avatar-xs rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                        <IconifyIcon icon="tabler:check" />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-white fs-14">{name}</div>
                                                        <small className="text-white-50">
                                                            {profile?.student_code || item.student_code} • {profile?.major || 'สาธารณสุข'}
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="badge bg-light text-dark fs-11">
                                                        {item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'เมื่อสักครู่'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Bottom Notice */}
            <div className="text-center text-white-50 fs-12 pt-3 border-top border-secondary border-opacity-25">
                วสส.สุพรรณบุรี • ระบบลงทะเบียนและตรวจสอบการเข้าร่วมกิจกรรมนักศึกษา • พัฒนาด้วย Laravel & Inertia React
            </div>
        </div>
    );
}
