import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Container, Row, Accordion, Badge, Tab, Nav, Form } from 'react-bootstrap';
import { Head, Link } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const userGuides = [
    {
        id: 'guide-1',
        title: 'คู่มือการบันทึกทะเบียนประวัติและข้อมูลส่วนตัว',
        category: 'ทะเบียนนักศึกษา',
        icon: 'solar:user-id-bold-duotone',
        color: 'primary',
        description: 'ขั้นตอนการกรอกข้อมูลประวัตินักศึกษา ข้อมูลส่วนตัว ข้อมูลการศึกษาเดิม และข้อมูลครอบครัวให้ครบถ้วนถูกต้อง',
        steps: [
            'เข้าสู่เมนู "ทะเบียนประวัติ" หรือคลิกที่รูปโปรไฟล์มุมขวาบน เลือก "ข้อมูลส่วนตัว"',
            'ตรวจสอบข้อมูลพื้นฐาน เลขประจำตัวประชาชน เลขประจำตัวนักศึกษา และสาขาวิชา',
            'กรอกข้อมูลที่อยู่ เบอร์โทรศัพท์ อีเมล และสถานที่ทำงานให้ครบถ้วน',
            'กดปุ่ม "บันทึกข้อมูล" ด้านล่างของแบบฟอร์ม เพื่อยืนยันข้อมูล',
        ],
    },
    {
        id: 'guide-2',
        title: 'คู่มือการอัปโหลดเอกสารสำคัญทางการศึกษา',
        category: 'เอกสารส่วนบุคคล',
        icon: 'solar:cloud-upload-bold-duotone',
        color: 'success',
        description: 'แนวทางและข้อกำหนดในการอัปโหลดไฟล์เอกสารตามหมวดหมู่ การเปิดสิทธิ์ปุ่มอัปโหลดตามลำดับหมวด',
        steps: [
            'เข้าสู่เมนู "เอกสารส่วนบุคคล" (Personal Documents)',
            'ระบบจะเปิดสิทธิ์ (Enable) ให้เริ่มอัปโหลดตามลำดับหมวด (หมวดที่ 1 บัตรประจำตัวประชาชน/ทะเบียนบ้าน)',
            'เมื่ออัปโหลดไฟล์ในหมวดปัจจุบันแล้ว ระบบจะเปิดสิทธิ์ให้สามารถอัปโหลดเอกสารในหมวดถัดไปโดยอัตโนมัติ',
            'ไฟล์ที่รองรับ: PDF, JPG, PNG ขนาดไม่เกิน 20MB ต่อไฟล์ ตรวจสอบความคมชัดก่อนอัปโหลด',
        ],
    },
    {
        id: 'guide-3',
        title: 'คู่มือระบบติดตามหน่วยกิตและการศึกษา (ป.โท)',
        category: 'หลักสูตรและหน่วยกิต',
        icon: 'solar:diploma-bold-duotone',
        color: 'info',
        description: 'การดูความก้าวหน้าหน่วยกิต แผนการเรียน รายวิชาที่เรียนแล้ว หน่วยกิตคงเหลือ และ GPAX สะสม',
        steps: [
            'เข้าสู่เมนู "ภาพรวมหน่วยกิต" (Credits Dashboard)',
            'ตรวจสอบกราฟแถบความก้าวหน้าของหน่วยกิตรวม (เช่น ครบ 36 หน่วยกิตตามเกณฑ์หลักสูตร)',
            'ตรวจสอบหน่วยกิตรายหมวด: หมวดวิชาบังคับ (12 หน่วยกิต), หมวดวิชาเลือก (12 หน่วยกิต), และวิทยานิพนธ์ (12 หน่วยกิต)',
            'ตรวจสอบเกรดเฉลี่ยสะสม (GPAX) และผลการเรียนรายวิชาในแต่ละภาคการศึกษา',
        ],
    },
    {
        id: 'guide-4',
        title: 'คู่มือการตรวจสอบเงื่อนไขการสำเร็จการศึกษา',
        category: 'การสำเร็จการศึกษา',
        icon: 'solar:check-circle-bold-duotone',
        color: 'warning',
        description: 'เงื่อนไขสำคัญที่นักศึกษาต้องผ่านเกณฑ์เพื่อยื่นขอสำเร็จการศึกษาระดับปริญญาโท',
        steps: [
            '1. หน่วยกิตครบตามโครงสร้างหลักสูตร (36 หน่วยกิต) และได้ GPAX ไม่ต่ำกว่า 3.00',
            '2. ผ่านการสอบประมวลความรู้ (Comprehensive Examination)',
            '3. ผ่านเกณฑ์ความรู้ภาษาอังกฤษตามที่สถาบันพระบรมราชชนกกำหนด (เช่น BPE, CU-TEP, TU-GET, IELTS)',
            '4. ผลงานวิทยานิพนธ์ได้รับการตีพิมพ์หรือตอบรับให้ตีพิมพ์ในวารสารวิชาการที่ได้รับการยอมรับ',
        ],
    },
    {
        id: 'guide-5',
        title: 'คู่มือสำหรับอาจารย์/เจ้าหน้าที่: กรอกเกรดและผลการเรียน',
        category: 'สำหรับเจ้าหน้าที่/อาจารย์',
        icon: 'solar:pen-new-square-bold-duotone',
        color: 'secondary',
        description: 'ระบบบันทึกผลการเรียนรายวิชา เกรด (A, B+, B...) หรือ S/U สำหรับวิทยานิพนธ์',
        steps: [
            'เข้าสู่เมนู "การจัดการ" > "กรอกผลการเรียน / เกรด" (Grade Entry)',
            'เลือกนักศึกษาที่ต้องการ หรือค้นหาด้วยรหัสนักศึกษา/ชื่อ-นามสกุล',
            'เลือกภาคการศึกษาและรายวิชาที่ลงทะเบียน จากนั้นระบุเกรดที่ได้รับ (เช่น A, B+, B, C+, C หรือ S/U)',
            'ระบบจะคำนวณหน่วยกิตสะสมและ GPAX ใหม่โดยอัตโนมัติทันทีที่บันทึก',
        ],
    },
];

const faqs = [
    {
        category: 'การใช้งานทั่วไปและบัญชีผู้ใช้',
        items: [
            {
                q: 'ลืมรหัสผ่านเข้าสู่ระบบ หรือต้องการเปลี่ยนรหัสผ่าน ทำอย่างไร?',
                a: 'กรณีลืมรหัสผ่าน สามารถติดต่อผู้ดูแลระบบ (Admin) หรือเจ้าหน้าที่งานทะเบียน วสส.สุพรรณบุรี เพื่อทำการรีเซ็ตรหัสผ่านใหม่ หรือหากยังเข้าใช้งานได้ สามารถไปที่เมนูตั้งค่าบัญชีเพื่อเปลี่ยนรหัสผ่านด้วยตนเอง',
            },
            {
                q: 'สามารถเข้าใช้งานระบบผ่านสมาร์ทโฟนหรือแท็บเล็ตได้หรือไม่?',
                a: 'ระบบถูกออกแบบด้วย Responsive Design สามารถเปิดใช้งานได้ราบรื่นผ่านเว็บบราวเซอร์บนทุกอุปกรณ์ ทั้งคอมพิวเตอร์, แท็บเล็ต (iPad/Android) และสมาร์ทโฟน โดยไม่ต้องติดตั้งแอปพลิเคชันเพิ่มเติม',
            },
            {
                q: 'หากข้อมูลส่วนตัว เช่น ที่อยู่ หรือเบอร์โทรศัพท์ มีการเปลี่ยนแปลง ต้องแจ้งใคร?',
                a: 'นักศึกษาสามารถเข้าสู่ระบบและไปที่เมนู "ทะเบียนประวัติ" เพื่อแก้ไขข้อมูลที่อยู่ เบอร์โทรศัพท์ และอีเมลได้ด้วยตนเองตลอดเวลา ข้อมูลจะถูกอัปเดตในระบบทันที',
            },
        ],
    },
    {
        category: 'การอัปโหลดและจัดการเอกสาร',
        items: [
            {
                q: 'ทำไมปุ่ม "อัปโหลดเอกสาร" ในบางหมวดถึงยังไม่สามารถกดได้ (ปุ่มเป็นสีเทา)?',
                a: 'ระบบกำหนดเงื่อนไขการส่งเอกสารตามลำดับหมวด เพื่อความถูกต้องของแฟ้มทะเบียนประวัติ เมื่อท่านทำการอัปโหลดเอกสารในหมวดเริ่มต้นแล้ว ระบบจะปลดล็อก (Enable) ปุ่มในหมวดถัดไปให้อัตโนมัติ',
            },
            {
                q: 'ขนาดไฟล์และประเภทไฟล์ที่ระบบรองรับมีอะไรบ้าง?',
                a: 'ระบบรองรับไฟล์นามสกุล .PDF, .JPG, .JPEG และ .PNG โดยจำกัดขนาดสูงสุดไม่เกิน 20MB ต่อไฟล์ หากไฟล์มีขนาดใหญ่เกินไป แนะนำให้ทำการบีบอัดไฟล์ (Compress PDF/Image) ก่อนอัปโหลด',
            },
            {
                q: 'อัปโหลดไฟล์ผิด สามารถลบหรืออัปโหลดใหม่ทับได้หรือไม่?',
                a: 'สามารถทำได้ โดยท่านสามารถกดดูตัวอย่างไฟล์ (Preview) หรือกดอัปโหลดไฟล์ใหม่เข้ามาแทนที่ไฟล์เดิมได้จนกว่าเจ้าหน้าที่งานทะเบียนจะทำการปิดรอบตรวจรับเอกสาร',
            },
        ],
    },
    {
        category: 'หน่วยกิตและการศึกษา ป.โท',
        items: [
            {
                q: 'เกณฑ์คะแนนเฉลี่ยสะสม (GPAX) ขั้นต่ำในการสำเร็จการศึกษาปริญญาโทคือเท่าใด?',
                a: 'ตามเกณฑ์มาตรฐานหลักสูตรระดับบัณฑิตศึกษา วสส.สุพรรณบุรี สถาบันพระบรมราชชนก นักศึกษาต้องได้คะแนนเฉลี่ยสะสม (GPAX) ไม่ต่ำกว่า 3.00 (จาก 4.00) จึงจะมีสิทธิ์ยื่นขอสำเร็จการศึกษา',
            },
            {
                q: 'การเทียบโอนหน่วยกิต หรือการลงทะเบียนวิชาเลือก ต้องดำเนินการอย่างไร?',
                a: 'การขอเทียบโอนรายวิชาจากหลักสูตรเดิม หรือการขอลงทะเบียนเรียนวิชาเลือกต่างหลักสูตร ต้องได้รับการอนุมัติจากคณะกรรมการประจำหลักสูตร กรุณาติดต่ออาจารย์ที่ปรึกษาหรือฝ่ายวิชาการบัณฑิตศึกษา',
            },
            {
                q: 'วิทยานิพนธ์ (Thesis) 12 หน่วยกิต มีการคิดเกรดอย่างไร?',
                a: 'การประเมินผลรายวิชาวิทยานิพนธ์จะใช้ระบบผลการศึกษา S (Satisfactory - เป็นที่พอใจ/ผ่าน) หรือ U (Unsatisfactory - ไม่เป็นที่พอใจ/ไม่ผ่าน) โดยไม่นำระดับคะแนนมาคำนวณแต้มเฉลี่ย GPAX แต่นับรวมเป็นหน่วยกิตสะสมที่สอบผ่าน',
            },
        ],
    },
];

const SupportPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaqs = faqs.map((group) => {
        const filteredItems = group.items.filter(
            (item) =>
                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...group, items: filteredItems };
    }).filter((group) => group.items.length > 0);

    return (
        <MainLayout>
            <Head title="ศูนย์ช่วยเหลือและคู่มือการใช้งาน - วสส.สุพรรณบุรี" />
            <PageTitle title="ศูนย์ช่วยเหลือ & คู่มือการใช้งาน" subTitle="Support, Guides & FAQ" />

            <Container fluid className="py-2">
                {/* Hero Header & Search */}
                <Row className="justify-content-center mb-4">
                    <Col lg={11} xl={10}>
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden text-center text-white position-relative"
                            style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 60%, #009688 100%)', padding: '40px 20px' }}>
                            <div className="badge bg-white-subtle text-white px-3 py-2 rounded-pill fs-12 fw-semibold mb-2 d-inline-block">
                                <IconifyIcon icon="solar:help-bold-duotone" className="me-1 align-middle fs-16" />
                                HELP & SUPPORT CENTER
                            </div>
                            <h2 className="fw-bold text-white mb-2">ศูนย์ช่วยเหลือและคู่มือการใช้งานระบบ</h2>
                            <p className="text-white-50 fs-15 mx-auto mb-4" style={{ maxWidth: '640px' }}>
                                ค้นหาคำตอบ ข้อสงสัย หรือศึกษาขั้นตอนการใช้งานระบบติดตามหน่วยกิตและการศึกษา วสส.สุพรรณบุรี
                            </p>

                            <div className="mx-auto" style={{ maxWidth: '540px' }}>
                                <div className="input-group input-group-lg bg-white rounded-pill p-1 shadow">
                                    <span className="input-group-text bg-transparent border-0 ps-3 text-muted">
                                        <IconifyIcon icon="solar:magnifer-bold-duotone" className="fs-20" />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-0 shadow-none fs-14"
                                        placeholder="ค้นหาคำถาม, ปัญหา, หรือคู่มือที่ต้องการ..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            className="btn btn-link text-muted border-0 me-2"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <IconifyIcon icon="solar:close-circle-bold" className="fs-18" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col lg={11} xl={10}>
                        {/* Section 1: User Guides */}
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h4 className="fw-bold text-dark mb-1 d-flex align-items-center">
                                    <IconifyIcon icon="solar:book-bookmark-bold-duotone" className="text-primary me-2 fs-24" />
                                    คู่มือขั้นตอนการใช้งานระบบ (User Guides)
                                </h4>
                                <p className="text-muted fs-13 mb-0">ขั้นตอนการใช้งานระบบอย่างละเอียดสำหรับนักศึกษา อาจารย์ และเจ้าหน้าที่</p>
                            </div>
                            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fs-12">
                                5 หมวดหมู่หลัก
                            </span>
                        </div>

                        <Row className="g-3 mb-5">
                            {userGuides.map((guide, idx) => (
                                <Col key={guide.id} md={6} lg={4}>
                                    <Card className="h-100 border-0 shadow-sm rounded-4">
                                        <CardBody className="p-4 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div
                                                        className={`badge bg-${guide.color}-subtle text-${guide.color} p-2 rounded-circle fs-20`}
                                                        style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <IconifyIcon icon={guide.icon} />
                                                    </div>
                                                    <Badge bg={guide.color} className="fw-normal rounded-pill px-2 py-1 fs-11">
                                                        {guide.category}
                                                    </Badge>
                                                </div>

                                                <h5 className="fw-bold text-dark fs-15 mb-2">{guide.title}</h5>
                                                <p className="text-muted fs-13 mb-3">{guide.description}</p>

                                                <div className="bg-light p-3 rounded-3 mb-3">
                                                    <div className="fw-semibold text-dark fs-12 mb-2">ขั้นตอนการปฏิบัติ:</div>
                                                    <ol className="mb-0 ps-3 text-muted fs-12" style={{ lineHeight: '1.6' }}>
                                                        {guide.steps.map((step, sIdx) => (
                                                            <li key={sIdx} className="mb-1">{step}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                                                <span className="text-muted fs-11">คู่มือเวอร์ชัน 2.1</span>
                                                <span className="text-primary fs-12 fw-semibold d-inline-flex align-items-center">
                                                    วสส.สุพรรณบุรี
                                                    <IconifyIcon icon="solar:arrow-right-bold" className="ms-1 fs-14" />
                                                </span>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        <hr className="my-5 opacity-25" />

                        {/* Section 2: FAQs */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div>
                                    <h4 className="fw-bold text-dark mb-1 d-flex align-items-center">
                                        <IconifyIcon icon="solar:question-circle-bold-duotone" className="text-warning me-2 fs-24" />
                                        คำถามที่พบบ่อย (Frequently Asked Questions)
                                    </h4>
                                    <p className="text-muted fs-13 mb-0">รวบรวมข้อสงสัยและคำตอบเกี่ยวกับการใช้งานระบบและการติดตามหน่วยกิต</p>
                                </div>
                                {searchQuery && (
                                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fs-12">
                                        ผลการค้นหา: "{searchQuery}"
                                    </span>
                                )}
                            </div>
                        </div>

                        {filteredFaqs.length === 0 ? (
                            <Card className="border-0 shadow-sm rounded-4 p-5 text-center mb-5">
                                <IconifyIcon icon="solar:sad-circle-bold-duotone" className="text-muted display-4 mb-3" />
                                <h5 className="text-muted">ไม่พบคำถามหรือเนื้อหาที่ตรงกับการค้นหา</h5>
                                <p className="text-muted fs-13 mb-3">ลองใช้คำค้นอื่น หรือติดต่อทีมสนับสนุนเพื่อสอบถามโดยตรง</p>
                                <button className="btn btn-outline-primary btn-sm mx-auto rounded-pill px-4" onClick={() => setSearchQuery('')}>
                                    ล้างคำค้นหา
                                </button>
                            </Card>
                        ) : (
                            <Row className="g-4 mb-5">
                                {filteredFaqs.map((group, gIdx) => (
                                    <Col lg={12} key={gIdx}>
                                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                                            <div className="bg-light px-4 py-3 border-bottom d-flex align-items-center">
                                                <IconifyIcon icon="solar:folder-with-files-bold-duotone" className="text-primary me-2 fs-20" />
                                                <h5 className="fw-bold text-dark mb-0 fs-15">{group.category}</h5>
                                            </div>
                                            <CardBody className="p-3 p-md-4">
                                                <Accordion defaultActiveKey="0" flush>
                                                    {group.items.map((item, itemIdx) => (
                                                        <Accordion.Item key={itemIdx} eventKey={`${itemIdx}`} className="border-bottom py-1">
                                                            <Accordion.Header>
                                                                <span className="fw-semibold text-dark fs-14">
                                                                    <IconifyIcon icon="solar:help-bold" className="text-primary me-2 align-middle fs-16" />
                                                                    {item.q}
                                                                </span>
                                                            </Accordion.Header>
                                                            <Accordion.Body className="text-muted fs-13 ps-4" style={{ lineHeight: '1.7' }}>
                                                                <div className="p-3 bg-light rounded-3 border-start border-3 border-primary">
                                                                    {item.a}
                                                                </div>
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                    ))}
                                                </Accordion>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}

                        {/* Section 3: Still need help / Contact Support banner */}
                        <Row className="g-4 mb-4">
                            <Col md={12}>
                                <Card className="border-0 shadow-sm rounded-4 overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' }}>
                                    <CardBody className="p-4 p-md-5 text-white">
                                        <Row className="align-items-center">
                                            <Col lg={8} md={7}>
                                                <span className="badge bg-white-subtle text-white px-3 py-1 rounded-pill fs-11 fw-normal mb-2">
                                                    NEED MORE HELP?
                                                </span>
                                                <h3 className="fw-bold text-white mb-2">ยังไม่พบคำตอบ หรือพบปัญหาขัดข้องทางเทคนิค?</h3>
                                                <p className="text-white-50 fs-14 mb-0" style={{ maxWidth: '580px' }}>
                                                    สามารถติดต่อทีมงานผู้พัฒนาระบบและเจ้าหน้าที่ฝ่ายไอที วสส.สุพรรณบุรี เพื่อขอความช่วยเหลือได้ตลอดเวลาทำการ
                                                </p>
                                            </Col>
                                            <Col lg={4} md={5} className="text-md-end mt-3 mt-md-0">
                                                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-md-end">
                                                    <Link href="/pages/contact-us" className="btn btn-light text-primary fw-bold px-4 py-2 rounded-pill shadow-sm">
                                                        <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-1 align-middle fs-16" />
                                                        ติดต่อทีมพัฒนา
                                                    </Link>
                                                    <a href="tel:035500123" className="btn btn-outline-light px-3 py-2 rounded-pill">
                                                        <IconifyIcon icon="solar:phone-bold" className="me-1 align-middle" />
                                                        035-500-123
                                                    </a>
                                                </div>
                                            </Col>
                                        </Row>
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
