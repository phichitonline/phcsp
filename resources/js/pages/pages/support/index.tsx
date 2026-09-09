import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Container, Row, Accordion } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const SupportPage = () => {
    return (
        <MainLayout>
            <Head title="ศูนย์ช่วยเหลือ (Support)" />
            <PageTitle title="Support" subTitle="ศูนย์ช่วยเหลือ" />

            <Container fluid>
                <Row className="justify-content-center mt-3">
                    <Col lg={10}>
                        <div className="text-center mb-5">
                            <h2 className="fw-bold text-dark mb-3">คุณต้องการความช่วยเหลือใช่ไหม?</h2>
                            <p className="text-muted fs-16 mx-auto" style={{ maxWidth: '600px' }}>
                                ค้นหาคำตอบสำหรับคำถามที่พบบ่อย (FAQ) หรือติดต่อทีมสนับสนุนของเรา หากคุณพบปัญหาในการใช้งานระบบ
                            </p>
                        </div>

                        <Row className="g-4 mb-5">
                            <Col md={6}>
                                <Card className="shadow-sm border-0 h-100">
                                    <CardBody className="p-4">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="avatar-md me-3">
                                                <div className="avatar-title bg-primary-subtle text-primary rounded-circle fs-24">
                                                    <IconifyIcon icon="tabler:help" />
                                                </div>
                                            </div>
                                            <h4 className="fw-bold mb-0">คำถามที่พบบ่อย (FAQ)</h4>
                                        </div>
                                        <Accordion defaultActiveKey="0">
                                            <Accordion.Item eventKey="0" className="border-0 mb-2 shadow-sm rounded">
                                                <Accordion.Header>ฉันจะแก้ไขข้อมูลส่วนตัวได้อย่างไร?</Accordion.Header>
                                                <Accordion.Body className="text-muted">
                                                    คุณสามารถไปที่เมนู "บัญชีของฉัน" ที่แถบด้านบนขวา จากนั้นกดปุ่ม "แก้ไข" เพื่ออัปเดตข้อมูลและบันทึก
                                                </Accordion.Body>
                                            </Accordion.Item>
                                            <Accordion.Item eventKey="1" className="border-0 mb-2 shadow-sm rounded">
                                                <Accordion.Header>ลืมรหัสผ่านต้องทำอย่างไร?</Accordion.Header>
                                                <Accordion.Body className="text-muted">
                                                    กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อทำการรีเซ็ตรหัสผ่านใหม่ให้กับคุณผ่านทางเมนูการจัดการผู้ใช้งาน
                                                </Accordion.Body>
                                            </Accordion.Item>
                                            <Accordion.Item eventKey="2" className="border-0 mb-2 shadow-sm rounded">
                                                <Accordion.Header>ทำไมฉันถึงไม่สามารถรับรองผล KPI ได้?</Accordion.Header>
                                                <Accordion.Body className="text-muted">
                                                    เฉพาะผู้ใช้ที่มีสิทธิ์ระดับ "ผู้ดูแลระบบ (Admin)" หรือ "หัวหน้าส่วน (Head)" เท่านั้น ที่สามารถรับรองผลงาน KPI ได้
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                    </CardBody>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card className="shadow-sm border-0 h-100 bg-primary text-white">
                                    <CardBody className="p-5 d-flex flex-column justify-content-center align-items-center text-center">
                                        <IconifyIcon icon="tabler:headset" className="display-4 mb-4 text-white-50" />
                                        <h3 className="fw-bold text-white mb-3">ต้องการความช่วยเหลือเพิ่มเติม?</h3>
                                        <p className="mb-4 fs-16 text-white-50">
                                            หากคุณไม่พบคำตอบที่ต้องการในหน้า FAQ โปรดติดต่อทีมงาน IT Support เพื่อขอความช่วยเหลือโดยตรง
                                        </p>
                                        <a href="/pages/contact-us" className="btn btn-light btn-lg text-primary fw-bold px-4 rounded-pill">
                                            <IconifyIcon icon="tabler:mail" className="me-2" />
                                            ติดต่อเราเลย
                                        </a>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </MainLayout>
    );
};

export default SupportPage;
