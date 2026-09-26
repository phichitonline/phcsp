import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Import team photos
import member1Img from '@/images/team/nopphadol.jpg';
import member2Img from '@/images/team/preecha2.jpg';
import member3Img from '@/images/team/nathaphong2.jpg';
import member4Img from '@/images/team/witty2.jpg';
import member5Img from '@/images/team/jack.jpg';
import member6Img from '@/images/team/wannarat.jpg';

interface TeamMember {
    id: number;
    name: string;
    englishName: string;
    role: string;
    organization: string;
    badgeColor: string;
    gradient: string;
    bio: string;
    email: string;
    phone: string;
    image: string;
    skills: string[];
}

const teamMembers: TeamMember[] = [
    {
        id: 1,
        name: 'นายนพดล ทองอร่าม',
        englishName: 'Mr. Noppadol Thongaram',
        role: 'อาจารย์ (หัวหน้าหลักสูตรสาธารณสุขศาสตรมหาบัณฑิต), หัวหน้าหน่วยพัฒนางานวิชาการและจัดหารายได้ และผู้ช่วยผู้อำนวยการ',
        organization: 'วิทยาลัยการสาธารณสุขสิรินธร จ.สุพรรณบุรี',
        badgeColor: 'primary',
        gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        bio: 'อาจารย์ประจำและผู้บริหาร กำกับทิศทางงานวิชาการ การพัฒนาหลักสูตรบัณฑิตศึกษา และสนับสนุนการนำเทคโนโลยีดิจิทัลมาประยุกต์ใช้ในการบริหารจัดการการศึกษา',
        email: 'noppadol.t@phcsuphan.ac.th',
        phone: '035-500-123 ต่อ 101',
        image: member1Img,
        skills: ['Curriculum Management', 'Academic Leadership', 'Public Health', 'Health Informatics'],
    },
    {
        id: 2,
        name: 'นายปรีชา บุญมี',
        englishName: 'Mr. Preecha Boonmee',
        role: 'นักวิชาการคอมพิวเตอร์ปฏิบัติการ',
        organization: 'สำนักงานสาธารณสุขจังหวัดพิจิตร จ.พิจิตร',
        badgeColor: 'info',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        bio: 'ดูแลระบบเทคโนโลยีสารสนเทศ การบริหารจัดการฐานข้อมูลสุขภาพระดับจังหวัด โครงสร้างพื้นฐานระบบเครือข่าย และความปลอดภัยทางไซเบอร์',
        email: 'admin@ppho.go.th',
        phone: '084-6887671',
        image: member2Img,
        skills: ['Systems Analyst', 'Health Data Center', 'Network Infrastructure', 'Cybersecurity'],
    },
    {
        id: 3,
        name: 'นายณัฐพงศ์ เครือเทศ',
        englishName: 'Mr. Nathaphong Khruates',
        role: 'เจ้าพนักงานสาธารณสุขปฏิบัติงาน',
        organization: 'โรงพยาบาลสมเด็จพระยุพราชตะพานหิน จ.พิจิตร',
        badgeColor: 'success',
        gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        bio: 'รับผิดชอบการออกแบบและพัฒนาระบบ (Full-Stack Developer) สถาปัตยกรรมซอฟต์แวร์ ฐานข้อมูล และการเชื่อมประสานระบบเพื่อการติดตามการศึกษา',
        email: 'phichitonline@gmail.com',
        phone: '064-4476000',
        image: member3Img,
        skills: ['Full-Stack Developer', 'Laravel & React', 'Database Architecture', 'RESTful APIs'],
    },
    {
        id: 4,
        name: 'นายพงศ์วิทย์ สนองบุญ',
        englishName: 'Mr. Pongwit Sanongboon',
        role: 'นักวิชาการคอมพิวเตอร์ชำนาญการ',
        organization: 'โรงพยาบาลบางมูลนาก จ.พิจิตร',
        badgeColor: 'primary',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        bio: 'ผู้เชี่ยวชาญด้านระบบสารสนเทศโรงพยาบาล การเชื่อมโยงข้อมูลสุขภาพ การบริหารจัดการแม่ข่าย และการควบคุมมาตรฐานความมั่นคงปลอดภัยข้อมูล',
        email: 'admin@bmnhos.com',
        phone: '084-2345566',
        image: member4Img,
        skills: ['Hospital Information System', 'Database Administration', 'Server Infrastructure', 'System Optimization'],
    },
    {
        id: 5,
        name: 'นายธีระพงศ์ พาคำ',
        englishName: 'Mr. Theeraphong Phakham',
        role: 'นักวิชาการคอมพิวเตอร์',
        organization: 'โรงพยาบาลสมเด็จพระยุพราชตะพานหิน จ.พิจิตร',
        badgeColor: 'secondary',
        gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
        bio: 'พัฒนาระบบซอฟต์แวร์สนับสนุนทางการแพทย์ การประมวลผลข้อมูลสารสนเทศ และการสนับสนุนเทคนิคระบบคอมพิวเตอร์ในหน่วยงานสาธารณสุข',
        email: 'dragons2536@gmail.com',
        phone: '096-6611816',
        image: member5Img,
        skills: ['Software Development', 'Technical Support', 'Data Management', 'Web Application'],
    },
    {
        id: 6,
        name: 'นางสาววรรณรัตน์ ดวงดี',
        englishName: 'Ms. Wannarat Duangdee',
        role: 'นักวิชาการคอมพิวเตอร์ชำนาญการ',
        organization: 'โรงพยาบาลพระพุทธบาท จ.สระบุรี',
        badgeColor: 'danger',
        gradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
        bio: 'เชี่ยวชาญการวิเคราะห์และบริหารจัดการระบบสารสนเทศสุขภาพ การจัดทำรายงานเชิงสถิติทางการแพทย์ และการขับเคลื่อนนวัตกรรมดิจิทัลในองค์กร',
        email: 'wannarat.d@xxx.go.th',
        phone: '036-266-xxx',
        image: member6Img,
        skills: ['Health Informatics', 'Data Analytics', 'HIS Management', 'Digital Transformation'],
    },
];

const ContactUsPage = () => {
    return (
        <MainLayout>
            <Head title="ทีมผู้พัฒนาระบบและติดต่อเรา - วสส.สุพรรณบุรี" />
            <PageTitle title="ทีมงานและติดต่อเรา" subTitle="Contact & Development Team" />

            <Container fluid className="py-2">
                {/* Header Section */}
                <div className="text-center mb-4">
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

                {/* รายชื่อทีมงานผู้พัฒนาระบบ (Development Team - 6 Members) */}
                <Row className="g-4 mb-5 justify-content-center">
                    {teamMembers.map((member) => (
                        <Col key={member.id} xl={4} lg={4} md={6} sm={12}>
                            <Card className="h-100 border-0 shadow-sm rounded-4 text-center overflow-hidden position-relative d-flex flex-column">
                                {/* Top colored accent banner */}
                                <div
                                    style={{
                                        height: '90px',
                                        background: member.gradient,
                                    }}
                                />

                                <CardBody className="pt-0 px-4 pb-4 d-flex flex-column flex-grow-1">
                                    {/* Member Avatar */}
                                    <div
                                        className="position-relative d-inline-block mx-auto"
                                        style={{ marginTop: '-55px', marginBottom: '14px' }}
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

                                    {/* Organization */}
                                    <div className="d-flex align-items-center justify-content-center text-muted fs-12 mb-2">
                                        <IconifyIcon icon="solar:buildings-2-bold-duotone" className="text-primary me-1 fs-15 flex-shrink-0" />
                                        <span className="fw-semibold text-secondary">{member.organization}</span>
                                    </div>

                                    {/* Role Badge */}
                                    <div className="mb-3 px-1">
                                        <span
                                            className={`badge bg-${member.badgeColor}-subtle text-${member.badgeColor} border border-${member.badgeColor}-subtle px-2 py-1 rounded-pill text-wrap fs-12 fw-normal`}
                                            style={{ lineHeight: '1.4', display: 'inline-block' }}
                                        >
                                            {member.role}
                                        </span>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-muted fs-13 mb-3 text-start flex-grow-1" style={{ minHeight: '52px' }}>
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

                                    <hr className="my-3 opacity-25 mt-auto" />

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

                {/* Contact & Location Information Section */}
                <Row className="g-4 mb-4 justify-content-center">
                    <Col lg={9} md={11} sm={12}>
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                            <CardBody className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <span className="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill fs-12 fw-semibold mb-2">
                                        CONTACT & LOCATION
                                    </span>
                                    <h4 className="fw-bold text-dark mb-1 d-flex align-items-center justify-content-center">
                                        <IconifyIcon icon="solar:buildings-3-bold-duotone" className="text-primary me-2 fs-24" />
                                        ที่ตั้งและศูนย์ประสานงาน
                                    </h4>
                                    <p className="text-muted fs-14 mb-0">
                                        วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี (คณะสาธารณสุขศาสตร์และสหเวชศาสตร์ สถาบันพระบรมราชชนก)
                                    </p>
                                </div>

                                <Row className="g-4 align-items-center">
                                    <Col md={7}>
                                        <div className="d-flex flex-column gap-3">
                                            <div className="d-flex align-items-start">
                                                <div className="badge bg-primary-subtle text-primary p-2 rounded-circle me-3 flex-shrink-0">
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
                                                <div className="badge bg-success-subtle text-success p-2 rounded-circle me-3 flex-shrink-0">
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
                                                <div className="badge bg-info-subtle text-info p-2 rounded-circle me-3 flex-shrink-0">
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
                                    </Col>

                                    <Col md={5}>
                                        <div className="p-4 bg-light rounded-4 text-center border h-100 d-flex flex-column justify-content-center">
                                            <div className="badge bg-primary text-white p-3 rounded-circle d-inline-block mx-auto mb-3 shadow-sm">
                                                <IconifyIcon icon="solar:chat-round-dots-bold-duotone" className="fs-28" />
                                            </div>
                                            <div className="text-muted fs-13 mb-1">ต้องการสอบถามข้อมูลเร่งด่วน?</div>
                                            <div className="fw-bold text-primary fs-15 mb-2">
                                                LINE Official: @phcsuphan-support
                                            </div>
                                            <p className="text-muted fs-12 mb-0">
                                                พร้อมให้บริการตอบข้อซักถามในวันและเวลาราชการ
                                            </p>
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </MainLayout>
    );
};

export default ContactUsPage;
