import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Badge, Button, Alert } from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

export default function StudentActivityGuide() {
    return (
        <MainLayout>
            <Head title="คู่มือการใช้งานระบบกิจกรรมนักศึกษา (สำหรับนักศึกษา)" />
            <PageTitle
                title="คู่มือขั้นตอนการเข้าร่วมกิจกรรมนักศึกษา"
                subTitle="คำแนะนำการลงชื่อเข้าร่วมและสะสมชั่วโมงกิจกรรม (Student Guide)"
                rightContent={
                    <Link href="/student/activities" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
                        <IconifyIcon icon="tabler:arrow-left" /> กลับไปหน้ากิจกรรมนักศึกษา
                    </Link>
                }
            />

            {/* Hero Header */}
            <Card className="border-0 shadow-sm mb-4 text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #465dff 0%, #783bff 100%)' }}>
                <CardBody className="p-4">
                    <Row className="align-items-center g-3">
                        <Col lg={8}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="avatar-lg rounded-3 bg-white bg-opacity-20 text-white d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
                                    <IconifyIcon icon="tabler:school" className="fs-32" />
                                </div>
                                <div>
                                    <div className="badge bg-white text-primary fw-bold mb-1">
                                        คู่มือนักศึกษา
                                    </div>
                                    <h4 className="fw-bold mb-1 text-white">ขั้นตอนการลงชื่อเข้าร่วมกิจกรรม & สะสมชั่วโมง</h4>
                                    <p className="text-white-50 mb-0 fs-13">
                                        คำแนะนำการเช็กอินด้วย GPS, การสแกน Dynamic QR Code, การเช็กเอาต์ และการดาวน์โหลด e-Certificate
                                    </p>
                                </div>
                            </div>
                        </Col>
                        <Col lg={4} className="text-lg-end">
                            <Link href="/student/activities" className="btn btn-light text-primary fw-semibold d-inline-flex align-items-center gap-1 px-3 py-2 shadow">
                                <IconifyIcon icon="tabler:calendar-event" /> ไปยัง Dashboard กิจกรรม
                            </Link>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Row className="g-4">
                {/* Step 1 */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span className="avatar-sm rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                    1
                                </span>
                                <h5 className="mb-0 fw-bold text-dark">ตรวจสอบกิจกรรมที่ต้องเข้าร่วม</h5>
                            </div>
                            <p className="text-muted fs-13">
                                เข้าเมนู <strong>"กิจกรรมนักศึกษา"</strong> (<Link href="/student/activities">/student/activities</Link>) บนมือถือหรือคอมพิวเตอร์
                            </p>

                            <div className="p-3 bg-light rounded-3 border mb-3 fs-13">
                                <ul className="mb-0 ps-3 text-secondary d-flex flex-column gap-2">
                                    <li>
                                        <Badge bg="danger-subtle" className="text-danger me-1">กิจกรรมที่ถูกบังคับ</Badge>
                                        กิจกรรมตามหลักสูตรที่อาจารย์กำหนดให้นักศึกษาต้องมาเข้าร่วม
                                    </li>
                                    <li>
                                        <Badge bg="info-subtle" className="text-info me-1">กิจกรรมที่เปิดรับสมัคร</Badge>
                                        กิจกรรมทางเลือกเพื่อสะสมชั่วโมงเพิ่มเติม (กดปุ่ม <strong>"ลงทะเบียน"</strong> เพื่อสำรองที่นั่ง)
                                    </li>
                                    <li>
                                        ตรวจสอบ วันที่ เวลา สถานที่จัดงาน และจำนวนชั่วโมงที่จะได้รับก่อนถึงวันงาน
                                    </li>
                                </ul>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* Step 2 */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span className="avatar-sm rounded-circle bg-success-subtle text-success fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                    2
                                </span>
                                <h5 className="mb-0 fw-bold text-dark">ตรวจสอบพิกัด GPS ณ สถานที่จัดงาน</h5>
                            </div>
                            <p className="text-muted fs-13">
                                ในวันงาน ให้เดินทางมายังจุดจัดกิจกรรม (เช่น หอประชุมใหญ่ วสส.สุพรรณบุรี)
                            </p>

                            <div className="p-3 bg-light rounded-3 border mb-3 fs-13">
                                <ol className="mb-0 ps-3 text-secondary d-flex flex-column gap-2">
                                    <li>กดปุ่ม <strong>"ไปที่หน้าเช็กอินเข้าร่วม"</strong> ของกิจกรรมนั้น</li>
                                    <li>หากเบราว์เซอร์ถามการเข้าถึงตำแหน่ง ให้กด <strong>"อนุญาต" (Allow Location)</strong></li>
                                    <li>
                                        ระบบจะคำนวณระยะห่างระหว่างตัวคุณกับจุดจัดงาน:
                                        <div className="mt-1">
                                            🟢 <strong>ขึ้นสีเขียว:</strong> อยู่ในรัศมีจัดงาน (GPS ผ่าน) พร้อมเช็กอิน<br />
                                            🔴 <strong>ขึ้นสีแดง:</strong> อยู่นอกพื้นที่จัดงาน (เกินรัศมี) จะไม่สามารถเช็กอินได้
                                        </div>
                                    </li>
                                </ol>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* Step 3 */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span className="avatar-sm rounded-circle bg-warning-subtle text-warning fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                    3
                                </span>
                                <h5 className="mb-0 fw-bold text-dark">สแกน Dynamic QR Code & ถ่ายภาพ Selfie</h5>
                            </div>
                            <p className="text-muted fs-13">
                                ยืนยันตัวตนว่าอยู่ในงานจริงด้วยการสแกนรหัสสดและถ่ายรูปใบหน้า
                            </p>

                            <div className="p-3 bg-light rounded-3 border mb-3 fs-13">
                                <ol className="mb-0 ps-3 text-secondary d-flex flex-column gap-2">
                                    <li>กดปุ่ม <strong>"เปิดกล้องสแกน QR Code"</strong> ในหน้าเช็กอิน</li>
                                    <li>ส่องกล้องไปที่ <strong>จอโปรเจกเตอร์หน้างาน</strong> ที่อาจารย์เปิดไว้</li>
                                    <li>(ทางเลือก) กด <strong>"เปิดกล้องหน้าเพื่อถ่ายภาพยืนยัน"</strong> เพื่อถ่ายภาพ Selfie ของตนเองในงาน</li>
                                    <li>กดปุ่มสีเขียว <strong>"ยืนยันการลงชื่อเข้าร่วมกิจกรรม (Check-in)"</strong></li>
                                </ol>
                            </div>

                            <Alert variant="warning" className="py-2 px-3 fs-12 mb-0 d-flex align-items-center gap-2">
                                <IconifyIcon icon="tabler:alert-triangle" className="fs-18 flex-shrink-0 text-warning" />
                                <span><strong>คำเตือน:</strong> QR Code บนจอจะเปลี่ยนทุก 30 วินาที ห้ามแคปหน้าจอส่งต่อ เพราะรหัสจะหมดอายุทันที</span>
                            </Alert>
                        </CardBody>
                    </Card>
                </Col>

                {/* Step 4 */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span className="avatar-sm rounded-circle bg-info-subtle text-info fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                    4
                                </span>
                                <h5 className="mb-0 fw-bold text-dark">กดเช็กเอาต์ & รับ e-Certificate PDF</h5>
                            </div>
                            <p className="text-muted fs-13">
                                สำคัญมาก: ต้องกดเช็กเอาต์เมื่อกิจกรรมเลิก เพื่อคำนวณชั่วโมงสะสม
                            </p>

                            <div className="p-3 bg-light rounded-3 border mb-3 fs-13">
                                <ol className="mb-0 ps-3 text-secondary d-flex flex-column gap-2">
                                    <li>เมื่อกิจกรรมเสร็จสิ้น ให้เปิดหน้ากิจกรรมเดิม แล้วกด <strong>"กดเช็กเอาต์ออกจากงาน"</strong></li>
                                    <li>ระบบจะคำนวณเวลาที่อยู่ในงานเทียบกับเวลาที่กำหนด:
                                        <div className="mt-1">
                                            🟢 <strong>ครบเวลา:</strong> ได้รับสถานะ "เต็มเวลา" และได้ชั่วโมงกิจกรรมครบถ้วน<br />
                                            🟡 <strong>ออกก่อน:</strong> ได้รับสถานะ "ไม่เต็มเวลา" และคำนวณชั่วโมงตามจริง
                                        </div>
                                    </li>
                                    <li>ไปที่เมนู <strong>"ประวัติและชั่วโมงกิจกรรม"</strong> เพื่อตรวจสอบชั่วโมงสะสม</li>
                                    <li>กดปุ่ม <strong>"ดูใบรับรอง"</strong> เพื่อพิมพ์หรือบันทึก <strong>e-Certificate เป็น PDF</strong> พร้อม QR Code ตรวจสอบความถูกต้อง</li>
                                </ol>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions Footer */}
            <div className="text-center my-4 d-flex justify-content-center gap-3">
                <Link href="/student/activities" className="btn btn-primary btn-lg px-4 shadow">
                    <IconifyIcon icon="tabler:calendar-check" className="me-1 fs-20" /> ไปยังกิจกรรมนักศึกษา
                </Link>
                <Link href="/student/activity-history" className="btn btn-outline-primary btn-lg px-4">
                    <IconifyIcon icon="tabler:award" className="me-1 fs-20" /> ดูประวัติและชั่วโมงสะสม
                </Link>
            </div>
        </MainLayout>
    );
}
