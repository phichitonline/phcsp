import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Container, Row, Badge } from 'react-bootstrap';
import { Head, Link } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import logoImg from '@/images/logo.png';

const AboutPage = () => {
    return (
        <MainLayout>
            <Head title="เกี่ยวกับระบบ - วสส.สุพรรณบุรี" />
            <PageTitle title="เกี่ยวกับระบบและสถาบัน" subTitle="About System & SCPHSP" />

            <Container fluid className="py-2">
                <Row className="justify-content-center">
                    <Col lg={11} xl={10}>
                        {/* Hero Header Card */}
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                            <div
                                style={{
                                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a148c 100%)',
                                    padding: '48px 24px',
                                }}
                                className="text-white text-center position-relative"
                            >
                                <div className="bg-white p-3 rounded-4 d-inline-block shadow mb-3">
                                    <img
                                        src={logoImg}
                                        alt="SCPHSP Logo"
                                        style={{ maxHeight: '65px', width: 'auto' }}
                                    />
                                </div>
                                <h2 className="fw-bold text-white mb-2">
                                    ระบบบริหารจัดการข้อมูลและติดตามหน่วยกิตการศึกษา
                                </h2>
                                <h5 className="text-white-50 fw-normal mb-3">
                                    วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี (วสส.สุพรรณบุรี)
                                </h5>
                                <p className="text-white-50 fs-14 mx-auto mb-0" style={{ maxWidth: '720px' }}>
                                    คณะสาธารณสุขศาสตร์และสหเวชศาสตร์ สถาบันพระบรมราชชนก กระทรวงสาธารณสุข
                                    มุ่งมั่นพัฒนาการศึกษาระดับบัณฑิตศึกษาและวิชาชีพสุขภาพสู่ความเป็นเลิศด้วยเทคโนโลยีดิจิทัลที่ทันสมัย
                                </p>
                            </div>

                            <CardBody className="p-4 p-md-5">
                                {/* Vision, Mission, Goal Cards */}
                                <div className="text-center mb-4">
                                    <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fs-12 fw-semibold">
                                        OUR COMMITMENT & GOALS
                                    </span>
                                    <h3 className="fw-bold text-dark mt-2">วิสัยทัศน์ พันธกิจ และเป้าหมายระบบ</h3>
                                </div>

                                <Row className="g-4 mb-5">
                                    <Col md={4}>
                                        <Card className="h-100 border-0 shadow-sm rounded-4 bg-light">
                                            <CardBody className="text-center p-4">
                                                <div className="avatar-md mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle" style={{ width: '64px', height: '64px' }}>
                                                    <IconifyIcon icon="solar:target-bold-duotone" className="fs-32" />
                                                </div>
                                                <h4 className="fw-bold text-dark mb-2">วิสัยทัศน์ (Vision)</h4>
                                                <p className="text-muted fs-14 mb-0">
                                                    เป็นระบบสารสนเทศชั้นนำในการบริหารจัดการข้อมูลนักศึกษา และติดตามความก้าวหน้าการเรียนระดับบัณฑิตศึกษาที่มีความแม่นยำ ปลอดภัย และมีมาตรฐานระดับสากล
                                                </p>
                                            </CardBody>
                                        </Card>
                                    </Col>

                                    <Col md={4}>
                                        <Card className="h-100 border-0 shadow-sm rounded-4 bg-light">
                                            <CardBody className="text-center p-4">
                                                <div className="avatar-md mx-auto mb-3 d-flex align-items-center justify-content-center bg-warning-subtle text-warning rounded-circle" style={{ width: '64px', height: '64px' }}>
                                                    <IconifyIcon icon="solar:lightbulb-bolt-bold-duotone" className="fs-32" />
                                                </div>
                                                <h4 className="fw-bold text-dark mb-2">พันธกิจ (Mission)</h4>
                                                <p className="text-muted fs-14 mb-0">
                                                    พัฒนาระบบสนับสนุนอาจารย์และนักศึกษาในการวางแผนและติดตามหน่วยกิต โครงสร้างหลักสูตร ทะเบียนประวัติ และเอกสารสำคัญทางวิชาการแบบครบวงจร
                                                </p>
                                            </CardBody>
                                        </Card>
                                    </Col>

                                    <Col md={4}>
                                        <Card className="h-100 border-0 shadow-sm rounded-4 bg-light">
                                            <CardBody className="text-center p-4">
                                                <div className="avatar-md mx-auto mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: '64px', height: '64px' }}>
                                                    <IconifyIcon icon="solar:shield-check-bold-duotone" className="fs-32" />
                                                </div>
                                                <h4 className="fw-bold text-dark mb-2">เป้าหมาย (Goals)</h4>
                                                <p className="text-muted fs-14 mb-0">
                                                    ข้อมูลมีความถูกต้อง รวดเร็ว ปลอดภัยตามมาตรฐาน PDPA พร้อมรองรับการตรวจสอบคุณวุฒิและเงื่อนไขการสำเร็จการศึกษาได้อย่างมีประสิทธิภาพ
                                                </p>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>

                                <hr className="my-5 opacity-25" />

                                {/* Core Features Grid */}
                                <div className="text-center mb-4">
                                    <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fs-12 fw-semibold">
                                        SYSTEM CAPABILITIES
                                    </span>
                                    <h3 className="fw-bold text-dark mt-2">ฟังก์ชันเด่นของระบบ</h3>
                                </div>

                                <Row className="g-4 mb-5">
                                    <Col md={6} lg={3}>
                                        <div className="p-3 border rounded-3 h-100 bg-white shadow-sm">
                                            <div className="text-primary mb-2">
                                                <IconifyIcon icon="solar:diploma-bold-duotone" className="fs-28" />
                                            </div>
                                            <h5 className="fw-bold fs-15 text-dark">ระบบติดตามหน่วยกิต ป.โท</h5>
                                            <p className="text-muted fs-13 mb-0">
                                                ตรวจสอบหน่วยกิตตามหมวด หมวดวิชาบังคับ หมวดวิชาเลือก และวิทยานิพนธ์ พร้อมคำนวณ GPAX อัตโนมัติ
                                            </p>
                                        </div>
                                    </Col>

                                    <Col md={6} lg={3}>
                                        <div className="p-3 border rounded-3 h-100 bg-white shadow-sm">
                                            <div className="text-success mb-2">
                                                <IconifyIcon icon="solar:file-check-bold-duotone" className="fs-28" />
                                            </div>
                                            <h5 className="fw-bold fs-15 text-dark">ระบบตรวจสอบเงื่อนไขจบ</h5>
                                            <p className="text-muted fs-13 mb-0">
                                                เช็คสถานะการสอบประมวลความรู้ (Comprehensive Exam), คะแนนภาษาอังกฤษ, และการตีพิมพ์บทความ
                                            </p>
                                        </div>
                                    </Col>

                                    <Col md={6} lg={3}>
                                        <div className="p-3 border rounded-3 h-100 bg-white shadow-sm">
                                            <div className="text-info mb-2">
                                                <IconifyIcon icon="solar:user-id-bold-duotone" className="fs-28" />
                                            </div>
                                            <h5 className="fw-bold fs-15 text-dark">ทะเบียนประวัติ & เอกสาร</h5>
                                            <p className="text-muted fs-13 mb-0">
                                                จัดเก็บและจัดการข้อมูลนักศึกษา ทะเบียนประวัติ และระบบอัปโหลดเอกสารส่วนบุคคลแบบแยกหมวดหมู่อย่างปลอดภัย
                                            </p>
                                        </div>
                                    </Col>

                                    <Col md={6} lg={3}>
                                        <div className="p-3 border rounded-3 h-100 bg-white shadow-sm">
                                            <div className="text-warning mb-2">
                                                <IconifyIcon icon="solar:shield-keyhole-bold-duotone" className="fs-28" />
                                            </div>
                                            <h5 className="fw-bold fs-15 text-dark">ความมั่นคงปลอดภัยสูง</h5>
                                            <p className="text-muted fs-13 mb-0">
                                                สถาปัตยกรรมระดับองค์กร เข้ารหัสข้อมูลสอดคล้องกับ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                                            </p>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Institute Details & Development Information */}
                                <div className="p-4 rounded-4 bg-light border text-center">
                                    <h5 className="fw-bold text-dark mb-2">หน่วยงานเจ้าของระบบและผู้พัฒนา</h5>
                                    <p className="text-muted fs-14 mb-2">
                                        วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี (วสส.สุพรรณบุรี)<br />
                                        เลขที่ 150 หมู่ 4 ตำบลทับตีเหล็ก อำเภอเมืองสุพรรณบุรี จังหวัดสุพรรณบุรี 72000
                                    </p>
                                    <div className="d-flex flex-wrap justify-content-center gap-2 my-3">
                                        <Badge bg="primary" className="px-3 py-2 rounded-pill fw-normal fs-12">
                                            เวอร์ชันระบบ: 2.1 (PHCSP 2026)
                                        </Badge>
                                        <Badge bg="secondary" className="px-3 py-2 rounded-pill fw-normal fs-12">
                                            สถาบันพระบรมราชชนก
                                        </Badge>
                                        <Badge bg="dark" className="px-3 py-2 rounded-pill fw-normal fs-12">
                                            Laravel + React + Inertia
                                        </Badge>
                                    </div>
                                    <div className="mt-3">
                                        <Link href="/pages/contact-us" className="btn btn-outline-primary btn-sm rounded-pill px-4">
                                            <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-1 align-middle fs-16" />
                                            ดูข้อมูลทีมงานผู้พัฒนาระบบ
                                        </Link>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </MainLayout>
    );
};

export default AboutPage;
