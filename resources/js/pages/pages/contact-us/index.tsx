import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Container, Row, Form, Button } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ContactUsPage = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Just a mock submission
        alert("ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด");
    };

    return (
        <MainLayout>
            <Head title="ติดต่อเรา (Contact Us)" />
            <PageTitle title="Contact Us" subTitle="ติดต่อเรา" />

            <Container fluid>
                <Row className="justify-content-center mt-3">
                    <Col lg={10}>
                        <div className="text-center mb-5">
                            <h2 className="fw-bold text-dark mb-3">ติดต่อทีมผู้พัฒนาระบบ</h2>
                            <p className="text-muted fs-16 mx-auto" style={{ maxWidth: '600px' }}>
                                หากคุณมีข้อเสนอแนะ แจ้งปัญหาการใช้งาน หรือต้องการสอบถามข้อมูลเพิ่มเติม สามารถติดต่อเราได้ตามช่องทางด้านล่างนี้
                            </p>
                        </div>

                        <Row className="g-4 mb-5">
                            <Col lg={5}>
                                <Card className="shadow-sm border-0 h-100 bg-primary text-white">
                                    <CardBody className="p-4 p-md-5">
                                        <h3 className="fw-bold text-white mb-4">ช่องทางการติดต่อ</h3>
                                        
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="avatar-sm me-3">
                                                <div className="avatar-title bg-white bg-opacity-25 rounded-circle fs-20">
                                                    <IconifyIcon icon="tabler:map-pin" />
                                                </div>
                                            </div>
                                            <div>
                                                <h6 className="text-white text-opacity-75 mb-1">ที่อยู่</h6>
                                                <p className="mb-0 fw-medium">กลุ่มงานสุขภาพดิจิทัล โรงพยาบาลสมเด็จพระยุพราชตะพานหิน</p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center mb-4">
                                            <div className="avatar-sm me-3">
                                                <div className="avatar-title bg-white bg-opacity-25 rounded-circle fs-20">
                                                    <IconifyIcon icon="tabler:phone" />
                                                </div>
                                            </div>
                                            <div>
                                                <h6 className="text-white text-opacity-75 mb-1">โทรศัพท์</h6>
                                                <p className="mb-0 fw-medium">056-621355 ต่อ 343-344</p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center">
                                            <div className="avatar-sm me-3">
                                                <div className="avatar-title bg-white bg-opacity-25 rounded-circle fs-20">
                                                    <IconifyIcon icon="tabler:mail" />
                                                </div>
                                            </div>
                                            <div>
                                                <h6 className="text-white text-opacity-75 mb-1">อีเมล</h6>
                                                <p className="mb-0 fw-medium">admin@tphcp.go.th</p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>

                            <Col lg={7}>
                                <Card className="shadow-sm border-0 h-100">
                                    <CardBody className="p-4 p-md-5">
                                        <h4 className="fw-bold mb-4">ส่งข้อความถึงเรา</h4>
                                        <Form onSubmit={handleSubmit}>
                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-medium">ชื่อ-นามสกุล <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control type="text" placeholder="ระบุชื่อของคุณ" required />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-medium">อีเมล <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control type="email" placeholder="ระบุอีเมลสำหรับติดต่อกลับ" required />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-medium">หัวข้อเรื่อง <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control type="text" placeholder="ระบุเรื่องที่ต้องการติดต่อ" required />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-medium">รายละเอียดข้อความ <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control as="textarea" rows={4} placeholder="ระบุรายละเอียดเพิ่มเติม..." required />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12} className="mt-4">
                                                    <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
                                                        <IconifyIcon icon="tabler:send" className="me-2" /> ส่งข้อความ
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
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

export default ContactUsPage;
