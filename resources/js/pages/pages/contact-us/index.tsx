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


                    </Col>
                </Row>
            </Container>
        </MainLayout>
    );
};

export default ContactUsPage;
