import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Button, Badge, Alert, Form, ProgressBar } from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';
import { Html5Qrcode } from 'html5-qrcode';

interface ActivityItem {
    id: number;
    activity_code: string;
    activity_name: string;
    activity_type: string;
    activity_date: string;
    start_time: string;
    end_time: string;
    total_hours: number;
    location_name: string;
    latitude: number;
    longitude: number;
    radius_limit: number;
    description?: string;
}

interface RegistrationItem {
    id: number;
    registration_status: string;
    check_in_time?: string | null;
    check_out_time?: string | null;
    check_in_method?: string | null;
    check_in_distance?: number | null;
    check_in_photo?: string | null;
    actual_hours: number;
    attendance_type: string;
}

interface PageProps {
    activity: ActivityItem;
    registration?: RegistrationItem | null;
    user: {
        id: number;
        name: string;
        student_code: string;
        avatar?: string;
        thaid_linked: boolean;
    };
}

// Haversine calculation in meters
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}

export default function StudentCheckInPage({ activity, registration, user }: PageProps) {
    const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [gpsDistance, setGpsDistance] = useState<number | null>(null);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState<boolean>(true);

    const [scannedToken, setScannedToken] = useState<string>('');
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const isAlreadyCheckedIn = !!registration?.check_in_time;
    const isAlreadyCheckedOut = !!registration?.check_out_time;

    // Check URL search params for token (e.g. when student scans QR code from phone camera)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');
        if (tokenFromUrl) {
            setScannedToken(tokenFromUrl);
        }
    }, []);

    // Get GPS Location
    const detectLocation = () => {
        setIsLocating(true);
        setGpsError(null);

        if (!navigator.geolocation) {
            setGpsError('อุปกรณ์ของคุณไม่รองรับการระบุพิกัด GPS');
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setGpsCoords({ lat, lng });

                if (activity.latitude && activity.longitude) {
                    const dist = calculateHaversineDistance(lat, lng, activity.latitude, activity.longitude);
                    setGpsDistance(dist);
                }
                setIsLocating(false);
            },
            (err) => {
                setGpsError('ไม่สามารถเข้าถึงพิกัด GPS ได้ โปรดอนุญาตสิทธิ์ Location ในเบราว์เซอร์');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        detectLocation();
    }, [activity]);

    // Handle Camera for Selfie
    const startSelfieCamera = async () => {
        try {
            setCameraActive(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 480, height: 480 },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (e) {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเปิดกล้องหน้าได้ โปรดอนุญาตสิทธิ์การใช้กล้อง', 'error');
            setCameraActive(false);
        }
    };

    const captureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth || 320;
            canvas.height = video.videoHeight || 320;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setSelfiePhoto(dataUrl);

                // Stop camera stream
                const stream = video.srcObject as MediaStream;
                stream?.getTracks().forEach((track) => track.stop());
                setCameraActive(false);
            }
        }
    };

    // Handle QR Scanner
    const startQrScanner = () => {
        setIsScanning(true);
        setTimeout(() => {
            const scanner = new Html5Qrcode('qr-reader-container');
            scannerRef.current = scanner;
            scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    // Extract token if it's a URL
                    try {
                        const url = new URL(decodedText);
                        const token = url.searchParams.get('token');
                        setScannedToken(token || decodedText);
                    } catch {
                        setScannedToken(decodedText);
                    }
                    scanner.stop().then(() => setIsScanning(false));
                    Swal.fire({
                        icon: 'success',
                        title: 'สแกน QR Code สำเร็จ',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                },
                () => {}
            );
        }, 300);
    };

    const stopQrScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().then(() => setIsScanning(false));
        } else {
            setIsScanning(false);
        }
    };

    // Submit Check-in
    const handleCheckIn = () => {
        if (!gpsCoords) {
            Swal.fire('แจ้งเตือน', 'กรุณารอตรวจจับพิกัด GPS หรือกดยืนยันตำแหน่งอีกครั้ง', 'warning');
            return;
        }

        if (gpsDistance !== null && gpsDistance > activity.radius_limit) {
            Swal.fire({
                icon: 'error',
                title: 'อยู่นอกพื้นที่จัดงาน',
                text: `คุณอยู่ห่างจากสถานที่จัดงาน ${gpsDistance} เมตร (เกินระยะที่อนุญาต ${activity.radius_limit} เมตร)`,
            });
            return;
        }

        if (!scannedToken) {
            Swal.fire('แจ้งเตือน', 'กรุณาสแกน Dynamic QR Code จากจอโปรเจกเตอร์หรือกรอกรหัสประจำงาน', 'warning');
            return;
        }

        router.post(
            `/student/activities/${activity.id}/check-in`,
            {
                lat: gpsCoords.lat,
                lng: gpsCoords.lng,
                qr_token: scannedToken,
                method: selfiePhoto ? 'FACE' : 'QR',
                photo: selfiePhoto,
            },
            {
                onSuccess: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'เช็กอินเข้าร่วมงานสำเร็จ!',
                        text: 'ระบบบันทึกเวลาและพิกัดของคุณเรียบร้อยแล้ว',
                    });
                },
            }
        );
    };

    // Submit Check-out
    const handleCheckOut = () => {
        Swal.fire({
            title: 'ยืนยันการเช็กเอาต์?',
            text: 'ระบบจะคำนวณชั่วโมงที่เข้าร่วมงานจริงจนถึงเวลานี้',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#465dff',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'เช็กเอาต์ออกจากงาน',
            cancelButtonText: 'ยังไม่ออก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/student/activities/${activity.id}/check-out`, {}, {
                    onSuccess: () => {
                        Swal.fire('เช็กเอาต์สำเร็จ', 'ระบบได้คำนวณชั่วโมงกิจกรรมสะสมเรียบร้อยแล้ว', 'success');
                    },
                });
            }
        });
    };

    const isInsideRadius = gpsDistance !== null && gpsDistance <= activity.radius_limit;

    return (
        <MainLayout>
            <Head title={`เช็กอิน: ${activity.activity_name}`} />
            <PageTitle title="ลงชื่อเข้าร่วมกิจกรรม" subTitle={activity.activity_name} />

            <Row className="justify-content-center">
                <Col lg={8} md={10}>
                    {/* Activity Header Card */}
                    <Card className="border-0 shadow-sm mb-3">
                        <CardBody className="p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <span className="badge bg-primary fs-12 px-2 py-1 mb-1">
                                        {activity.activity_code || `A${activity.id}`}
                                    </span>
                                    <h5 className="fw-bold text-dark mb-1">{activity.activity_name}</h5>
                                    <small className="text-muted d-block">
                                        <IconifyIcon icon="tabler:map-pin" className="text-danger" /> {activity.location_name}
                                    </small>
                                </div>
                                <div className="text-end">
                                    <div className="badge bg-success-subtle text-success fs-13 px-2 py-1">
                                        {Number(activity.total_hours).toFixed(1)} ชั่วโมง
                                    </div>
                                    <small className="d-block text-muted mt-1">
                                        {activity.start_time?.substring(0, 5)} - {activity.end_time?.substring(0, 5)} น.
                                    </small>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Check-in / Attendance Status Banner if Already Done */}
                    {isAlreadyCheckedIn && (
                        <Card className="border-0 shadow-sm mb-3 bg-success-subtle border-success">
                            <CardBody className="p-3">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="avatar-md bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                                            <IconifyIcon icon="tabler:check" className="fs-24" />
                                        </div>
                                        <div>
                                            <div className="fw-bold text-success fs-15">เช็กอินเข้าร่วมแล้ว</div>
                                            <div className="fs-12 text-muted">
                                                เวลา: <strong>{registration?.check_in_time}</strong> • ผ่าน: {registration?.check_in_method || 'QR Code'}
                                            </div>
                                        </div>
                                    </div>

                                    {!isAlreadyCheckedOut ? (
                                        <Button variant="primary" onClick={handleCheckOut} className="d-flex align-items-center gap-1 shadow-sm">
                                            <IconifyIcon icon="tabler:logout" /> กดเช็กเอาต์ออกจากงาน
                                        </Button>
                                    ) : (
                                        <div className="text-end">
                                            <div className="badge bg-primary fs-13 px-3 py-1">
                                                เสร็จสิ้น: {registration?.actual_hours} ชั่วโมง
                                            </div>
                                            <small className="d-block text-muted">
                                                เช็กเอาต์: {registration?.check_out_time}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Step 1: GPS Geolocation Verification */}
                    <Card className="border-0 shadow-sm mb-3">
                        <CardBody className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:current-location" className="text-primary fs-18" />
                                    1. ตรวจสอบพิกัด GPS (Geofencing)
                                </div>
                                <Button variant="link" size="sm" onClick={detectLocation} disabled={isLocating} className="p-0 text-decoration-none">
                                    <IconifyIcon icon="tabler:reload" /> รีเฟรชพิกัด
                                </Button>
                            </div>

                            {isLocating ? (
                                <div className="p-3 bg-light rounded-3 text-center text-muted">
                                    <IconifyIcon icon="tabler:loader" className="spin fs-24 mb-1" />
                                    <div>กำลังระบุตำแหน่งพิกัด GPS จากอุปกรณ์ของคุณ...</div>
                                </div>
                            ) : gpsError ? (
                                <Alert variant="danger" className="mb-0 py-2 fs-13">
                                    <IconifyIcon icon="tabler:alert-triangle" className="me-1" /> {gpsError}
                                </Alert>
                            ) : (
                                <div className={`p-3 rounded-3 border ${isInsideRadius ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger'}`}>
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <div>
                                            <div className={`fw-bold fs-14 ${isInsideRadius ? 'text-success' : 'text-danger'}`}>
                                                <IconifyIcon icon={isInsideRadius ? 'tabler:circle-check' : 'tabler:circle-x'} className="me-1 align-middle fs-18" />
                                                {isInsideRadius ? 'อยู่ในพื้นที่จัดกิจกรรม' : 'อยู่นอกพื้นที่จัดกิจกรรม'}
                                            </div>
                                            <small className="text-muted">
                                                ระยะห่างจากจุดจัดงาน: <strong>{gpsDistance}</strong> เมตร (รัศมีอนุญาต: {activity.radius_limit} ม.)
                                            </small>
                                        </div>
                                        <Badge bg={isInsideRadius ? 'success' : 'danger'} className="px-2 py-1">
                                            {isInsideRadius ? 'GPS ผ่าน' : 'เกินรัศมี'}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Step 2: Dynamic QR Code Scan / Verification */}
                    <Card className="border-0 shadow-sm mb-3">
                        <CardBody className="p-3">
                            <div className="fw-semibold text-dark d-flex align-items-center gap-1 mb-2">
                                <IconifyIcon icon="tabler:qrcode" className="text-primary fs-18" />
                                2. สแกน Dynamic QR Code ประจำงาน
                            </div>

                            {/* Camera QR Scanner Container */}
                            {isScanning && (
                                <div className="mb-3 text-center">
                                    <div id="qr-reader-container" style={{ width: '100%', maxWidth: 350, margin: '0 auto' }} />
                                    <Button variant="outline-danger" size="sm" onClick={stopQrScanner} className="mt-2">
                                        ปิดกล้องสแกน QR
                                    </Button>
                                </div>
                            )}

                            <div className="d-flex gap-2 mb-2">
                                <Button
                                    variant="primary"
                                    onClick={startQrScanner}
                                    disabled={isScanning || isAlreadyCheckedIn}
                                    className="d-flex align-items-center gap-1"
                                >
                                    <IconifyIcon icon="tabler:camera" /> เปิดกล้องสแกน QR Code
                                </Button>
                            </div>

                            <Form.Group>
                                <Form.Label className="fs-12 text-muted">รหัส Dynamic Token (ได้จากการสแกนจอโปรเจกเตอร์)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="รหัส QR Code Token..."
                                    value={scannedToken}
                                    onChange={(e) => setScannedToken(e.target.value)}
                                    disabled={isAlreadyCheckedIn}
                                />
                            </Form.Group>
                        </CardBody>
                    </Card>

                    {/* Step 3: Selfie Verification / Face Scan (Optional) */}
                    <Card className="border-0 shadow-sm mb-4">
                        <CardBody className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:user-scan" className="text-primary fs-18" />
                                    3. ยืนยันตัวตนด้วยภาพถ่าย Selfie / Face ID
                                </div>
                                {user.thaid_linked && (
                                    <Badge bg="info-subtle" className="text-info border border-info-subtle">
                                        <IconifyIcon icon="tabler:shield-check" className="me-1" /> ThaiD เชื่อมต่อแล้ว
                                    </Badge>
                                )}
                            </div>

                            {cameraActive ? (
                                <div className="text-center p-2 bg-light rounded-3 mb-2">
                                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: 260, borderRadius: 8 }} />
                                    <div className="mt-2">
                                        <Button variant="success" size="sm" onClick={captureSelfie} className="me-2">
                                            <IconifyIcon icon="tabler:camera" /> ถ่ายภาพเดี๋ยวนี้
                                        </Button>
                                        <Button variant="outline-secondary" size="sm" onClick={() => setCameraActive(false)}>
                                            ยกเลิก
                                        </Button>
                                    </div>
                                </div>
                            ) : selfiePhoto ? (
                                <div className="text-center p-2 bg-light rounded-3 mb-2">
                                    <img src={selfiePhoto} alt="Selfie" style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: '50%' }} className="border border-3 border-success mb-2" />
                                    <div className="d-flex justify-content-center gap-2">
                                        <Badge bg="success">บันทึกรูปถ่ายยืนยันตัวตนแล้ว</Badge>
                                        <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => setSelfiePhoto(null)}>
                                            ถ่ายใหม่
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={startSelfieCamera}
                                    disabled={isAlreadyCheckedIn}
                                    className="d-flex align-items-center gap-1"
                                >
                                    <IconifyIcon icon="tabler:camera-selfie" /> เปิดกล้องหน้าเพื่อถ่ายภาพยืนยัน
                                </Button>
                            )}
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </CardBody>
                    </Card>

                    {/* Final Action Button */}
                    {!isAlreadyCheckedIn && (
                        <div className="d-grid gap-2 mb-4">
                            <Button
                                variant="success"
                                size="lg"
                                onClick={handleCheckIn}
                                disabled={!isInsideRadius || !scannedToken}
                                className="py-3 fw-bold fs-16 shadow"
                            >
                                <IconifyIcon icon="tabler:check" className="me-1 fs-20" /> ยืนยันการลงชื่อเข้าร่วมกิจกรรม (Check-in)
                            </Button>
                            {(!isInsideRadius || !scannedToken) && (
                                <small className="text-center text-muted">
                                    * ต้องอยู่ในรัศมีจัดงาน ({activity.radius_limit} ม.) และสแกน QR Code ก่อนจึงจะสามารถกดยืนยันได้
                                </small>
                            )}
                        </div>
                    )}

                    <div className="text-center">
                        <Link href="/student/activities" className="text-muted text-decoration-none fs-13">
                            &lt; กลับสู่หน้ารายการกิจกรรม
                        </Link>
                    </div>
                </Col>
            </Row>
        </MainLayout>
    );
}
