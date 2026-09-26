import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Badge, Button, Alert } from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

export default function ActivityAdminGuide() {
    return (
        <MainLayout>
            <Head title="คู่มือการใช้งานระบบจัดการกิจกรรม (สำหรับอาจารย์/ผู้ดูแล)" />
            <PageTitle
                title="คู่มือการใช้งานระบบจัดการกิจกรรม"
                subTitle="สำหรับอาจารย์และผู้ดูแลระบบ (Administrator & Teacher Guide)"
                rightContent={
                    <Link href="/activities" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
                        <IconifyIcon icon="tabler:arrow-left" /> กลับไปหน้าจัดการกิจกรรม
                    </Link>
                }
            />

            {/* Hero Banner */}
            <Card className="border-0 shadow-sm mb-4 text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                <CardBody className="p-4">
                    <Row className="align-items-center g-3">
                        <Col lg={8}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="avatar-lg rounded-3 bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
                                    <IconifyIcon icon="tabler:book" className="fs-32" />
                                </div>
                                <div>
                                    <div className="badge bg-primary-subtle text-primary border border-primary-subtle mb-1">
                                        เอกสารแนะนำการใช้งาน
                                    </div>
                                    <h4 className="fw-bold mb-1 text-white">ระบบตรวจสอบการเข้าร่วมกิจกรรมนักศึกษา</h4>
                                    <p className="text-white-50 mb-0 fs-13">
                                        คู่มืออธิบายขั้นตอนการสร้างกิจกรรม, การตั้งค่า GPS Geofencing, การฉาย Dynamic QR, การตรวจสอบสถิติสด และการปรับแก้ชั่วโมง
                                    </p>
                                </div>
                            </div>
                        </Col>
                        <Col lg={4} className="text-lg-end">
                            <Link href="/activities" className="btn btn-success d-inline-flex align-items-center gap-1 px-3 py-2 shadow">
                                <IconifyIcon icon="tabler:calendar-plus" /> เริ่มต้นสร้างกิจกรรมใหม่
                            </Link>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Row className="g-4">
                {/* Step 1: Create Activity */}
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span className="avatar-sm rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                    1
                                </span>
                                <h5 className="mb-0 fw-bold text-dark">การสร้างกิจกรรม & กำหนดพิกัด GPS</h5>
                            </div>
                            <p className="text-muted fs-13">
                                อาจารย์สามารถสร้างกิจกรรมใหม่ได้จากปุ่ม <strong>"+ สร้างกิจกรรม"</strong> ในหน้า <Link href="/activities">/activities</Link>
                            </p>

                            <div className="p-3 bg-light rounded-3 border mb-3 fs-13">
                                <h6 className="fw-semibold text-primary mb-2 d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:map-pin" /> พารามิเตอร์สำคัญ & วิธีระบุพิกัด GPS
                                </h6>
                                <ul className="mb-0 ps-3 text-secondary d-flex flex-column gap-1">
                                    <li><strong>ชื่อกิจกรรม & รหัสกิจกรรม:</strong> ระบุชื่อทางการ (เช่น พิธีไหว้ครู, ปฐมนิเทศ)</li>
                                    <li><strong>ประเภท:</strong> <em>กิจกรรมหลัก (บังคับ)</em> หรือ <em>กิจกรรมเลือก (สมัครใจ)</em></li>
                                    <li><strong>จำนวนชั่วโมง:</strong> เช่น 3.0 ชม. หรือ 8.0 ชม. (ระบบจะใช้คำนวณเต็มเวลา)</li>
                                    <li>
                                        <strong>ปุ่ม "ดึงพิกัดปัจจุบันจากอุปกรณ์":</strong> หากอาจารย์อยู่ในจุดจัดงานจริง สามารถกดปุ่มนี้เพื่ออ่านค่าพิกัด GPS ปัจจุบันจากมือถือหรือคอมพิวเตอร์เข้าสู่ฟอร์มได้ทันทีใน 1 วินาที
                                    </li>
                                    <li>
                                        <strong>ปุ่ม "เปิดแผนที่เลือกพิกัด / ปักหมุด":</strong> เปิดแผนที่อินเทอร์แอคทีฟ (Interactive Map) สามารถคลิกปักหมุดบนแผนที่ได้ทันที พร้อมแสดงวงกลมรัศมี Geofencing และมีปุ่มเปิดดูบน Google Maps
                                    </li>
                                    <li><strong>รัศมีเช็กอิน (เมตร):</strong> กำหนดระยะห่างที่ยอมให้เช็กอินได้ เช่น <code>100</code> หรือ <code>150</code> เมตร นักศึกษาที่อยู่นอกระยะนี้ระบบจะไม่ยอมให้กดยืนยัน</li>
                                    <li><strong>รอบเปลี่ยน QR Code:</strong> กำหนดความถี่ในการเปลี่ยนรหัส QR Code (Dynamic Token) ได้ตามต้องการ เช่น 15, 30, 60 (มาตรฐาน), 120 หรือ 300 วินาที เพื่อความยืดหยุ่นตามขนาดของห้องกิจกรรมและจำนวนผู้เข้าร่วม</li>
                                </ul>
                            </div>

                            <Alert variant="info" className="py-2 px-3 fs-12 mb-0 d-flex align-items-center gap-2">
                                <IconifyIcon icon="tabler:info-circle" className="fs-18 flex-shrink-0" />
                                <span><strong>คำแนะนำ:</strong> อาจารย์สามารถกดเปิดดูตำแหน่งบน Google Maps หรือคัดลอกพิกัดจาก Google Maps มาวางในช่องค้นหาบนแผนที่เพื่อปักหมุดได้ทันที</span>
                            </Alert>
                        </CardBody>
                    </Card>
                </Col>

                {/* Step 2: Target & Import */}
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span className="avatar-sm rounded-circle bg-success-subtle text-success fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                    2
                                </span>
                                <h5 className="mb-0 fw-bold text-dark">กำหนดกลุ่มเป้าหมาย & นำเข้า Excel</h5>
                            </div>
                            <p className="text-muted fs-13">
                                กำหนดว่านักศึกษากลุ่มใดที่ต้องเข้าร่วมกิจกรรมนี้ ผ่านหน้ารายละเอียดกิจกรรม <code>/activities/{'{id}'}</code>
                            </p>

                            <div className="p-3 bg-light rounded-3 border mb-3 fs-13">
                                <h6 className="fw-semibold text-success mb-2 d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:file-import" /> วิธีการนำเข้ารายชื่อ
                                </h6>
                                <ol className="mb-0 ps-3 text-secondary d-flex flex-column gap-1">
                                    <li>ในหน้ารายละเอียดกิจกรรม คลิกปุ่ม <strong>"นำเข้ารายชื่อนักศึกษา"</strong></li>
                                    <li>เปิดไฟล์ Excel รายชื่อนักศึกษา แล้วคัดลอก (Copy) คอลัมน์รหัสนักศึกษา</li>
                                    <li>นำมาวาง (Paste) ลงในช่องข้อความ (สามารถวางหลายบรรทัดพร้อมกันได้)</li>
                                    <li>ติ๊กเลือก <em>"กำหนดเป็นกิจกรรมบังคับสำหรับกลุ่มนี้"</em> แล้วกด <strong>"นำเข้ารายชื่อ"</strong></li>
                                    <li>ระบบจะจับคู่กับฐานข้อมูลนักศึกษาและลงทะเบียนให้อัตโนมัติทันที</li>
                                </ol>
                            </div>

                            <Alert variant="success" className="py-2 px-3 fs-12 mb-0 d-flex align-items-center gap-2">
                                <IconifyIcon icon="tabler:check" className="fs-18 flex-shrink-0" />
                                <span>หากเป็นกิจกรรมสำหรับทั้งวิทยาลัย ไม่จำเป็นต้องนำเข้า Excel ระบบจะส่งกิจกรรมไปยัง Dashboard ของทุกคนอัตโนมัติ</span>
                            </Alert>
                        </CardBody>
                    </Card>
                </Col>

                {/* Step 3: Live Projector Presentation */}
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span className="avatar-sm rounded-circle bg-warning-subtle text-warning fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                    3
                                </span>
                                <h5 className="mb-0 fw-bold text-dark">เปิดจอโปรเจกเตอร์ Live Dynamic QR</h5>
                            </div>
                            <p className="text-muted fs-13">
                                ในวันจัดกิจกรรม อาจารย์เปิดจอแสดงผลขนาดใหญ่เพื่อให้นักศึกษาที่อยู่ในงานสแกนเช็กอิน
                            </p>

                            <div className="p-3 bg-light rounded-3 border mb-3 fs-13">
                                <h6 className="fw-semibold text-warning mb-2 d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:screen-share" /> ฟังก์ชันบนหน้าจอสด (Live Screen)
                                </h6>
                                <ul className="mb-0 ps-3 text-secondary d-flex flex-column gap-1">
                                    <li>กดปุ่ม <strong>"เปิดจอสด Live Projector"</strong> (URL: <code>/activities/{'{id}'}/live</code>)</li>
                                    <li><strong>ระบบ Dynamic QR Token:</strong> รหัส QR Code จะ<strong>หมุนเวียนเปลี่ยนอัตโนมัติตามเวลาที่กำหนดไว้สำหรับกิจกรรมนั้นๆ (เช่น 60 วินาที)</strong> พร้อมแถบนับเวลาถอยหลัง (ป้องกันการแคปภาพส่งต่อให้เพื่อนที่ไม่ได้มางาน)</li>
                                    <li><strong>Live Counter:</strong> ตัวเลขนับจำนวนผู้เช็กอินแล้วแบบ Real-time ขนาดใหญ่ ชัดเจนจากระยะไกล</li>
                                    <li><strong>Recent Stream:</strong> แสดงรายชื่อนักศึกษาที่เพิ่งเช็กอินสำเร็จแบบสดๆ</li>
                                    <li>มีปุ่ม <strong>"เต็มจอ" (Fullscreen)</strong> เพื่อการนำเสนอที่ไร้แถบเมนูรบกวน</li>
                                </ul>
                            </div>

                            <Alert variant="warning" className="py-2 px-3 fs-12 mb-0 d-flex align-items-center gap-2">
                                <IconifyIcon icon="tabler:shield-lock" className="fs-18 flex-shrink-0 text-warning" />
                                <span>นักศึกษาต้องอยู่ในงานจริงเท่านั้นจึงจะสแกนทันก่อนรหัสหมดอายุ และต้องอยู่ในรัศมี GPS ที่กำหนด</span>
                            </Alert>
                        </CardBody>
                    </Card>
                </Col>

                {/* Step 4: Admin Override & Export */}
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span className="avatar-sm rounded-circle bg-danger-subtle text-danger fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                    4
                                </span>
                                <h5 className="mb-0 fw-bold text-dark">ตรวจสอบผล, ปรับแก้ & ส่งออกรายงาน</h5>
                            </div>
                            <p className="text-muted fs-13">
                                ตรวจสอบการเข้าร่วม คำนวณชั่วโมงตามจริง ปรับแก้กรณีพิเศษ และนำข้อมูลไปใช้งานต่อ
                            </p>

                            <div className="p-3 bg-light rounded-3 border mb-3 fs-13">
                                <h6 className="fw-semibold text-danger mb-2 d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:adjustments" /> ตรรกะการคำนวณ & การปรับแก้ (Override)
                                </h6>
                                <ul className="mb-0 ps-3 text-secondary d-flex flex-column gap-1">
                                    <li>🟢 <strong>เต็มเวลา (Full):</strong> อยู่ในงาน $\ge$ เวลาที่กำหนด (อนุโลม 15 นาที) ได้ชั่วโมงเต็ม</li>
                                    <li>🟡 <strong>ไม่เต็มเวลา (Partial):</strong> เช็กเอาต์ก่อนเวลา ได้รับชั่วโมงตามสัดส่วนเวลาจริง</li>
                                    <li>🔴 <strong>ขาด (Absent):</strong> ไม่ได้เช็กอิน หรือไม่ได้เช็กเอาต์</li>
                                    <li><strong>ปุ่มปรับแก้ (Admin Override):</strong> หากนักศึกษามือถือแบตหมดหรือมาช่วยงานอาจารย์ สามารถกด <strong>"ปรับแก้"</strong> ที่รายชื่อนั้น เพื่อปรับชั่วโมงและบันทึกเหตุผล</li>
                                    <li><strong>ส่งออก Excel:</strong> กดปุ่ม <strong>"ส่งออก Excel"</strong> ได้ไฟล์ CSV รองรับภาษาไทยสมบูรณ์แบบ</li>
                                </ul>
                            </div>

                            <Alert variant="danger" className="py-2 px-3 fs-12 mb-0 d-flex align-items-center gap-2">
                                <IconifyIcon icon="tabler:file-spreadsheet" className="fs-18 flex-shrink-0" />
                                <span>ไฟล์รายงานสามารถเปิดในโปรแกรม Microsoft Excel ได้ทันทีโดยตัวอักษรภาษาไทยไม่เพี้ยน (UTF-8 BOM)</span>
                            </Alert>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions Footer */}
            <div className="text-center my-4">
                <Link href="/activities" className="btn btn-primary btn-lg px-4 shadow">
                    <IconifyIcon icon="tabler:calendar-check" className="me-1 fs-20" /> ไปที่หน้าจัดการกิจกรรมนักศึกษา
                </Link>
            </div>
        </MainLayout>
    );
}
