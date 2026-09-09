import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import logoDark from '@/images/HOS-info-logo.png';

const AboutPage = () => {
    return (
        <MainLayout>
            <Head title="เกี่ยวกับระบบ (About Us)" />
            <PageTitle title="About Us" subTitle="เกี่ยวกับระบบ" />

            <Container fluid>
                <Row className="justify-content-center mt-3">
                    <Col lg={10}>
                        <Card className="shadow-sm border-0">
                            <CardBody className="p-5">
                                <div className="text-center mb-5">
                                    <div className="mx-auto mb-4">
                                        <img src={logoDark} alt="HOSinfo Logo" style={{ height: '250px', width: 'auto', objectFit: 'contain' }} />
                                    </div>
                                    {/* <h2 className="fw-bold text-dark mb-3">เกี่ยวกับระบบ HOS-info</h2> */}
                                    <p className="text-muted fs-16 mx-auto" style={{ maxWidth: '600px' }}>
                                        ระบบบริหารจัดการข้อมูลสารสนเทศและตัวชี้วัดโรงพยาบาล (HOS-info) ถูกพัฒนาขึ้นเพื่อใช้ในการติดตาม วิเคราะห์ และประเมินผลการดำเนินงานของโรงพยาบาล
                                    </p>
                                </div>

                                <Row className="g-4 mb-5">
                                    <Col md={4}>
                                        <Card className="h-100 border bg-light-subtle">
                                            <CardBody className="text-center p-4">
                                                <IconifyIcon icon="tabler:target" className="text-primary fs-32 mb-3" />
                                                <h4 className="fw-bold mb-2">วิสัยทัศน์</h4>
                                                <p className="text-muted mb-0">เป็นผู้นำด้านเทคโนโลยีสารสนเทศเพื่อการบริหารจัดการโรงพยาบาลอย่างมีประสิทธิภาพ</p>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col md={4}>
                                        <Card className="h-100 border bg-light-subtle">
                                            <CardBody className="text-center p-4">
                                                <IconifyIcon icon="tabler:bulb" className="text-warning fs-32 mb-3" />
                                                <h4 className="fw-bold mb-2">พันธกิจ</h4>
                                                <p className="text-muted mb-0">พัฒนาระบบเพื่อสนับสนุนการตัดสินใจ และยกระดับคุณภาพการให้บริการผู้ป่วย</p>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col md={4}>
                                        <Card className="h-100 border bg-light-subtle">
                                            <CardBody className="text-center p-4">
                                                <IconifyIcon icon="tabler:users" className="text-success fs-32 mb-3" />
                                                <h4 className="fw-bold mb-2">เป้าหมาย</h4>
                                                <p className="text-muted mb-0">ข้อมูลมีความถูกต้อง รวดเร็ว ปลอดภัย และสามารถเข้าถึงได้ทุกที่ทุกเวลา</p>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>

                                <div className="text-center">
                                    <h4 className="fw-bold mb-3">ทีมผู้พัฒนา</h4>
                                    <p className="text-muted mb-0">พัฒนาโดย กลุ่มงานสุขภาพดิจิทัล โรงพยาบาลสมเด็จพระยุพราชตะพานหิน</p>
                                    <p className="text-muted mt-2">เวอร์ชั่น 2.0 (HOS-info 2026)</p>
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
