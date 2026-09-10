import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Container, Row, Form, Button, Badge } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Import team photos
import member1Img from '@/images/team/member-1.jpg';
import member2Img from '@/images/team/member-2.jpg';
import member3Img from '@/images/team/member-3.jpg';
import member4Img from '@/images/team/member-4.jpg';

interface TeamMember {
    id: number;
    name: string;
    englishName: string;
    role: string;
    badgeColor: string;
    organization: string;
    bio: string;
    email: string;
    phone: string;
    image: string;
    skills: string[];
}

const teamMembers: TeamMember[] = [
    {
        id: 1,
        name: 'ดร. นภนต์ รัตนศิริพงษ์',
        englishName: 'Dr. Naphon Rattanasiriphong',
        role: 'ที่ปรึกษาและหัวหน้าโครงการ',
        badgeColor: 'primary',
        organization: 'วสส.สุพรรณบุรี',
        bio: 'ดูแลทิศทางการออกแบบระบบ วางแผนยุทธศาสตร์ดิจิทัล และประสานงานเชิงนโยบายวิชาการสาธารณสุข',
        email: 'naphon.r@phcsuphan.ac.th',
        phone: '035-500-123 ต่อ 101',
        image: member1Img,
        skills: ['Project Management', 'System Architecture', 'Health Informatics'],
    },
    {
        id: 2,
        name: 'นายณัฐพงษ์ ครูเทศ',
        englishName: 'Mr. Nathaphong Khruates',
        role: 'หัวหน้าทีมนักพัฒนาระบบ (Lead Full-Stack)',
        badgeColor: 'success',
        organization: 'ทีมพัฒนานวัตกรรมดิจิทัล',
        bio: 'รับผิดชอบสถาปัตยกรรมระบบทั้งฝั่ง Backend (Laravel, MySQL) และ Frontend (Inertia.js, React, TypeScript)',
        email: 'nathaphong.k@phcsuphan.ac.th',
        phone: '081-234-5678',
        image: member2Img,
        skills: ['Laravel', 'React.js', 'MySQL', 'API Design'],
    },
    {
        id: 3,
        name: 'นางสาวกานต์พิชชา ภัทรเดชากุล',
        englishName: 'Ms. Karnpitcha Pataradechakun',
        role: 'นักออกแบบ UI/UX & Frontend',
        badgeColor: 'info',
        organization: 'ทีมพัฒนานวัตกรรมดิจิทัล',
        bio: 'ออกแบบประสบการณ์ผู้ใช้ (UX) หน้าจออินเทอร์เฟซ (UI) ระบบธีม และความง่ายในการเข้าถึงของผู้ใช้งานทุกกลุ่ม',
        email: 'karnpitcha.p@phcsuphan.ac.th',
        phone: '089-876-5432',
        image: member3Img,
        skills: ['Figma', 'UI/UX Design', 'Bootstrap 5', 'Responsive Web'],
    },
    {
        id: 4,
        name: 'นายธีรภัทร อัศววิริยะ',
        englishName: 'Mr. Teerapat Assawawiriya',
        role: 'วิศวกรระบบและฐานข้อมูล (DevOps & DBA)',
        badgeColor: 'warning',
        organization: 'ฝ่ายโครงสร้างพื้นฐานไอที',
        bio: 'ดูแลความมั่นคงปลอดภัยฐานข้อมูล คลาวด์เซิร์ฟเวอร์ การสำรองข้อมูล และระบบความปลอดภัย PDPA',
        email: 'teerapat.a@phcsuphan.ac.th',
        phone: '086-555-7890',
        image: member4Img,
        skills: ['Linux & DevOps', 'Database Admin', 'Cybersecurity', 'Cloud Infra'],
    },
];

const ContactUsPage = () => {
    const [sent, setSent] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
        setTimeout(() => {
            alert('ส่งข้อความถึงทีมพัฒนาเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็ว');
            setSent(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 500);
    };

    return (
        <MainLayout>
            <Head title="ทีมผู้พัฒนาระบบและติดต่อเรา - วสส.สุพรรณบุรี" />
            <PageTitle title="ทีมงานและติดต่อเรา" subTitle="Contact & Development Team" />

            <Container fluid className="py-2">
                {/* Header Section */}
                <div className="text-center mb-5">
                    <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fs-13 fw-semibold mb-2">
                        <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-1 fs-16 align-middle" />
                        DEVELOPMENT TEAM
                    </span>
                    <h2 className="fw-bold text-dark mt-2 mb-2">
                        ทีมงานผู้พัฒนาระบบ
                    </h2>
                    <p className="text-muted fs-15 mx-auto" style={{ maxWidth: '680px' }}>
                        ระบบติดตามหน่วยกิตและการศึกษา วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี (วสส.สุพรรณบุรี)
                        พัฒนาขึ้นโดยคณะทำงานและทีมผู้พัฒนานวัตกรรมดิจิทัล
                    </p>
                </div>

                {/* Team Members Grid (4 Columns) */}
                <Row className="g-4 mb-5 justify-content-center">
                    {teamMembers.map((member) => (
                        <Col key={member.id} xl={3} lg={6} md={6} sm={12}>
                            <Card className="h-100 border-0 shadow-sm rounded-4 text-center overflow-hidden position-relative">
                                {/* Top colored accent banner */}
                                <div
                                    style={{
                                        height: '90px',
                                        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                                    }}
                                />

                                <CardBody className="pt-0 px-4 pb-4">
                                    {/* Member Avatar */}
                                    <div
                                        className="position-relative d-inline-block mx-auto"
                                        style={{ marginTop: '-55px', marginBottom: '16px' }}
                                    >
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="rounded-circle img-thumbnail shadow"
                                            style={{
                                                width: '110px',
                                                height: '110px',
                                                objectFit: 'cover',
                                                border: '4px solid #fff',
                                            }}
                                        />
                                    </div>

                                    {/* Name & English */}
                                    <h5 className="fw-bold text-dark mb-1 fs-16">{member.name}</h5>
                                    <p className="text-muted fs-12 mb-2">{member.englishName}</p>

                                    {/* Role Badge */}
                                    <div className="mb-3">
                                        <Badge bg={member.badgeColor} className="px-2 py-1 rounded-pill fw-normal fs-12">
                                            {member.role}
                                        </Badge>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-muted fs-13 mb-3 text-start" style={{ minHeight: '60px' }}>
                                        {member.bio}
                                    </p>

                                    {/* Skills tags */}
                                    <div className="d-flex flex-wrap gap-1 justify-content-center mb-3">
                                        {member.skills.map((skill, sIdx) => (
                                            <span
                                                key={sIdx}
                                                className="badge bg-light text-secondary border fs-11 px-2 py-1 rounded-pill"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <hr className="my-3 opacity-25" />

                                    {/* Contact Details */}
                                    <div className="text-start fs-12 text-muted">
                                        <div className="d-flex align-items-center mb-2">
                                            <IconifyIcon icon="solar:letter-bold-duotone" className="text-primary me-2 fs-16 flex-shrink-0" />
                                            <a href={`mailto:${member.email}`} className="text-truncate text-decoration-none text-muted hover-primary">
                                                {member.email}
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <IconifyIcon icon="solar:phone-calling-rounded-bold-duotone" className="text-success me-2 fs-16 flex-shrink-0" />
                                            <span>{member.phone}</span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Contact Information & Feedback Form Section */}
                <Row className="g-4 mb-4 justify-content-center">
                    {/* Left Column: Institute Info & Quick Contact */}
                    <Col lg={5} md={12}>
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                            <CardBody className="p-4 d-flex flex-column justify-content-between">
                                <div>
                                    <h4 className="fw-bold text-dark mb-3 d-flex align-items-center">
                                        <IconifyIcon icon="solar:buildings-3-bold-duotone" className="text-primary me-2 fs-24" />
                                        ที่ตั้งและศูนย์ประสานงาน
                                    </h4>
                                    <p className="text-muted fs-14 mb-4">
                                        วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี<br />
                                        คณะสาธารณสุขศาสตร์และสหเวชศาสตร์ สถาบันพระบรมราชชนก
                                    </p>

                                    <div className="d-flex flex-column gap-3 mb-4">
                                        <div className="d-flex align-items-start">
                                            <div className="badge bg-primary-subtle text-primary p-2 rounded-circle me-3">
                                                <IconifyIcon icon="solar:map-point-bold-duotone" className="fs-18" />
                                            </div>
                                            <div>
                                                <div className="fw-semibold text-dark fs-14">ที่อยู่</div>
                                                <div className="text-muted fs-13">
                                                    เลขที่ 150 หมู่ 4 ตำบลทับตีเหล็ก อำเภอเมืองสุพรรณบุรี จังหวัดสุพรรณบุรี 72000
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-start">
                                            <div className="badge bg-success-subtle text-success p-2 rounded-circle me-3">
                                                <IconifyIcon icon="solar:phone-bold-duotone" className="fs-18" />
                                            </div>
                                            <div>
                                                <div className="fw-semibold text-dark fs-14">เบอร์โทรศัพท์</div>
                                                <div className="text-muted fs-13">
                                                    035-500-123, 035-500-124 (วัน-เวลาราชการ 08:30 - 16:30 น.)
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-start">
                                            <div className="badge bg-info-subtle text-info p-2 rounded-circle me-3">
                                                <IconifyIcon icon="solar:global-bold-duotone" className="fs-18" />
                                            </div>
                                            <div>
                                                <div className="fw-semibold text-dark fs-14">เว็บไซต์วิทยาลัย</div>
                                                <div className="text-muted fs-13">
                                                    <a href="https://www.scphsp.ac.th" target="_blank" rel="noreferrer" className="text-decoration-none">
                                                        www.scphsp.ac.th
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-light rounded-3 text-center">
                                    <div className="text-muted fs-12 mb-1">ต้องการแจ้งปัญหาการใช้งานเร่งด่วน?</div>
                                    <div className="fw-bold text-primary fs-14">
                                        <IconifyIcon icon="solar:chat-round-dots-bold-duotone" className="me-1 align-middle" />
                                        LINE Official: @phcsuphan-support
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Right Column: Contact/Feedback Form */}
                    <Col lg={7} md={12}>
                        <Card className="border-0 shadow-sm rounded-4">
                            <CardBody className="p-4">
                                <h4 className="fw-bold text-dark mb-1 d-flex align-items-center">
                                    <IconifyIcon icon="solar:mailbox-bold-duotone" className="text-primary me-2 fs-24" />
                                    ส่งข้อความหรือแจ้งข้อเสนอแนะถึงทีมพัฒนา
                                </h4>
                                <p className="text-muted fs-13 mb-4">
                                    กรอกข้อมูลด้านล่างเพื่อแจ้งปัญหาทางเทคนิค ข้อเสนอแนะการใช้งาน หรือข้อสอบถามระบบ
                                </p>

                                <Form onSubmit={handleSubmit}>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fs-13 fw-semibold">ชื่อ - นามสกุล ผู้ติดต่อ <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="เช่น สมชาย ใจดี"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fs-13 fw-semibold">อีเมลติดต่อกลับ <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    placeholder="yourname@example.com"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fs-13 fw-semibold">หัวข้อเรื่อง <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="เช่น แจ้งปัญหาการอัปโหลดเอกสาร, สอบถามการเทียบโอนหน่วยกิต"
                                                    required
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fs-13 fw-semibold">รายละเอียดข้อความ <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={4}
                                                    placeholder="พิมพ์รายละเอียดที่ต้องการติดต่อหรือแจ้งปัญหา..."
                                                    required
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12} className="text-end mt-3">
                                            <Button variant="primary" type="submit" className="px-4 py-2 rounded-pill fw-semibold shadow-sm" disabled={sent}>
                                                <IconifyIcon icon="solar:plain-bold-duotone" className="me-2 align-middle fs-16" />
                                                {sent ? 'กำลังส่งข้อมูล...' : 'ส่งข้อความถึงทีมพัฒนา'}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </MainLayout>
    );
};

export default ContactUsPage;
