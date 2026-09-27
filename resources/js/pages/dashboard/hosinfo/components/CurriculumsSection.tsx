import React, { useState } from 'react';
import { Badge, Button, Row, Col, Modal } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Link, usePage } from '@inertiajs/react';

export interface CurriculumItem {
    id: number;
    code: string;
    name: string;
    degree_level: string | null;
    total_credits: number;
    core_credits_required: number | null;
    elective_credits_required: number | null;
    thesis_credits_required: number | null;
    min_gpa_graduate: number | null;
    academic_year_start: string | null;
    description: string | null;
    is_active: boolean;
    courses_count?: number;
    student_profiles_count?: number;
}

interface Props {
    curriculums: CurriculumItem[];
    activeCount?: number;
}

const CurriculumsSection: React.FC<Props> = ({ curriculums = [], activeCount }) => {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isStaff = user?.role === 'admin' || user?.role === 'staff' || user?.role === 'teacher';
    const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumItem | null>(null);

    const openedCount = activeCount !== undefined ? activeCount : curriculums.filter((c) => c.is_active).length;

    return (
        <div className="mb-4">
            {/* Section Header (No outer card frame) */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-3">
                    <div 
                        className="d-flex align-items-center justify-content-center text-success rounded-3 bg-white shadow-sm border"
                        style={{ width: '44px', height: '44px' }}
                    >
                        <IconifyIcon icon="solar:diploma-bold-duotone" className="fs-24 text-success" />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <h5 className="mb-0 fw-bold text-dark fs-18">
                                แนะนำหลักสูตรที่เปิดเรียนทั้งหมด
                            </h5>
                            <Badge bg="success" className="rounded-pill fs-12 px-2.5 py-1">
                                เปิดสอน {openedCount} หลักสูตร
                            </Badge>
                        </div>
                        <small className="text-muted fs-12">
                            หลักสูตรระดับบัณฑิตศึกษา สาธารณสุขศาสตร์ สถาบันพระบรมราชชนก
                        </small>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <Link
                        href="/credits/curriculum"
                        className="btn btn-sm btn-outline-success rounded-pill px-3 d-inline-flex align-items-center gap-1 shadow-sm"
                    >
                        <span>โครงสร้างหลักสูตรและรายวิชา</span>
                        <IconifyIcon icon="tabler:arrow-right" className="fs-14" />
                    </Link>
                </div>
            </div>

            {/* Curriculums Cards Grid */}
            {curriculums.length === 0 ? (
                <div className="bg-white rounded-3 border p-5 text-center shadow-sm">
                    <div 
                        className="d-inline-flex align-items-center justify-content-center text-muted rounded-circle mb-3"
                        style={{ width: '64px', height: '64px', backgroundColor: '#f3f4f6' }}
                    >
                        <IconifyIcon icon="tabler:school" className="fs-32 text-secondary" />
                    </div>
                    <h6 className="fw-semibold text-dark fs-15 mb-1">ยังไม่มีข้อมูลหลักสูตรในระบบ</h6>
                    <p className="text-muted fs-13 mb-0">กรุณาเพิ่มข้อมูลหลักสูตรในส่วนจัดการโครงสร้างหลักสูตร</p>
                </div>
            ) : (
                <Row className="g-3">
                    {curriculums.map((cur) => {
                        const isCurActive = cur.is_active;
                        const degreeLabel = cur.degree_level === 'master' ? 'ปริญญาโท' : (cur.degree_level || 'ปริญญาโท');

                        return (
                            <Col key={cur.id} xs={12} md={6} lg={4}>
                                    <div 
                                        className="h-100 rounded-3 border d-flex flex-column justify-content-between transition-all bg-white"
                                        style={{ 
                                            padding: '22px 24px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                            borderLeft: isCurActive ? '5px solid #10b981' : '5px solid #9ca3af',
                                        }}
                                    >
                                        <div>
                                            {/* Top badges */}
                                            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-11 font-monospace fw-bold px-2 py-1">
                                                        {cur.code}
                                                    </span>
                                                    <Badge bg="light" className="text-dark border fs-11 px-2 py-1">
                                                        {degreeLabel}
                                                    </Badge>
                                                </div>
                                                {isCurActive ? (
                                                    <Badge bg="success-subtle" className="text-success border border-success-subtle fs-11 d-inline-flex align-items-center gap-1 px-2 py-1">
                                                        <span className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }} />
                                                        เปิดสอน
                                                    </Badge>
                                                ) : (
                                                    <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle fs-11 px-2 py-1">
                                                        ปิดรับ
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Curriculum Name */}
                                            <h5 
                                                className="fw-bold text-dark fs-15 mb-2.5 cursor-pointer lh-base"
                                                onClick={() => setSelectedCurriculum(cur)}
                                                style={{ minHeight: '44px' }}
                                                title={cur.name}
                                            >
                                                {cur.name}
                                            </h5>

                                            {/* Description snippet */}
                                            <p className="text-muted fs-12 mb-3 text-truncate-2 lh-base" style={{ minHeight: '36px' }}>
                                                {cur.description || 'หลักสูตรระดับบัณฑิตศึกษา วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี'}
                                            </p>

                                            {/* Quick Stats Grid */}
                                            <div className="bg-light-subtle rounded-3 p-3 border mb-3">
                                                <Row className="g-2 text-center align-items-center">
                                                    <Col xs={4} className="border-end">
                                                        <div className="text-muted fs-11 mb-1">หน่วยกิตรวม</div>
                                                        <div className="fw-bolder fs-15 text-primary">
                                                            {cur.total_credits} <small className="fs-10 fw-normal text-muted">นก.</small>
                                                        </div>
                                                    </Col>
                                                    <Col xs={4} className="border-end">
                                                        <div className="text-muted fs-11 mb-1">รายวิชา</div>
                                                        <div className="fw-bolder fs-15 text-dark">
                                                            {cur.courses_count || 0} <small className="fs-10 fw-normal text-muted">วิชา</small>
                                                        </div>
                                                    </Col>
                                                    <Col xs={4}>
                                                        <div className="text-muted fs-11 mb-1">นักศึกษา</div>
                                                        <div className="fw-bolder fs-15 text-success">
                                                            {cur.student_profiles_count || 0} <small className="fs-10 fw-normal text-muted">คน</small>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>

                                            {/* Credit Breakdown Bar */}
                                            <div className="mb-3">
                                                <div className="d-flex align-items-center justify-content-between text-muted fs-11 mb-2">
                                                    <span className="fw-semibold">โครงสร้างหน่วยกิต:</span>
                                                    <span>{cur.academic_year_start ? `เริ่มใช้ปี ${cur.academic_year_start}` : ''}</span>
                                                </div>
                                                <div className="d-flex gap-2 flex-wrap">
                                                    <span className="badge bg-light text-secondary border fs-11 py-1.5 px-2">
                                                        เอกบังคับ: <strong className="text-dark ms-1">{cur.core_credits_required ?? '-'}</strong> นก.
                                                    </span>
                                                    <span className="badge bg-light text-secondary border fs-11 py-1.5 px-2">
                                                        วิชาเลือก: <strong className="text-dark ms-1">{cur.elective_credits_required ?? '-'}</strong> นก.
                                                    </span>
                                                    <span className="badge bg-light text-secondary border fs-11 py-1.5 px-2">
                                                        วิทยานิพนธ์: <strong className="text-dark ms-1">{cur.thesis_credits_required ?? '-'}</strong> นก.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Action Buttons */}
                                        <div className="pt-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2 mt-auto">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="border py-1.5 px-3 fs-11 text-muted d-inline-flex align-items-center gap-1"
                                                onClick={() => setSelectedCurriculum(cur)}
                                            >
                                                <IconifyIcon icon="tabler:info-circle" className="fs-13" />
                                                <span>ข้อมูลหลักสูตร</span>
                                            </Button>

                                            <div className="d-flex align-items-center gap-2">
                                                {isStaff && (
                                                    <Link
                                                        href={`/credits?curriculum_id=${cur.id}`}
                                                        className="btn btn-sm btn-outline-primary py-1.5 px-2.5 fs-11 d-inline-flex align-items-center gap-1"
                                                        title="ภาพรวมหน่วยกิตนักศึกษาในหลักสูตรนี้"
                                                    >
                                                        <IconifyIcon icon="tabler:users" className="fs-13" />
                                                        <span>นักศึกษา</span>
                                                    </Link>
                                                )}

                                                <Link
                                                    href={`/credits/curriculum?curriculum_id=${cur.id}`}
                                                    className="btn btn-sm btn-success py-1.5 px-3 fs-11 d-inline-flex align-items-center gap-1 shadow-sm"
                                                >
                                                    <IconifyIcon icon="tabler:list-details" className="fs-13" />
                                                    <span>ดูรายวิชา</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                )}

            {/* Curriculum Detail Modal */}
            <Modal show={!!selectedCurriculum} onHide={() => setSelectedCurriculum(null)} centered size="lg">
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="fs-16 fw-bold text-dark d-flex align-items-center gap-2">
                        <IconifyIcon icon="solar:diploma-bold-duotone" className="text-success fs-20" />
                        <span>รายละเอียดหลักสูตร</span>
                    </Modal.Title>
                </Modal.Header>
                {selectedCurriculum && (
                    <Modal.Body className="p-4">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="badge bg-primary-subtle text-primary border font-monospace fw-bold">
                                {selectedCurriculum.code}
                            </span>
                            <Badge bg="light" className="text-dark border">
                                {selectedCurriculum.degree_level || 'ปริญญาโท'}
                            </Badge>
                            {selectedCurriculum.is_active ? (
                                <Badge bg="success-subtle" className="text-success border border-success-subtle">
                                    เปิดสอน
                                </Badge>
                            ) : (
                                <Badge bg="secondary-subtle" className="text-secondary border">
                                    ปิดรับ
                                </Badge>
                            )}
                        </div>

                        <h4 className="fw-bold text-dark fs-18 mb-3">
                            {selectedCurriculum.name}
                        </h4>

                        <Row className="g-3 mb-4 bg-light p-3 rounded-3 border text-center">
                            <Col xs={6} sm={3}>
                                <small className="text-muted d-block mb-1">หน่วยกิตรวมตลอดหลักสูตร</small>
                                <strong className="text-primary fs-16">{selectedCurriculum.total_credits} หน่วยกิต</strong>
                            </Col>
                            <Col xs={6} sm={3}>
                                <small className="text-muted d-block mb-1">จำนวนรายวิชาในระบบ</small>
                                <strong className="text-dark fs-16">{selectedCurriculum.courses_count || 0} วิชา</strong>
                            </Col>
                            <Col xs={6} sm={3}>
                                <small className="text-muted d-block mb-1">เกณฑ์ GPA จบการศึกษา</small>
                                <strong className="text-warning fs-16">{selectedCurriculum.min_gpa_graduate ? Number(selectedCurriculum.min_gpa_graduate).toFixed(2) : '3.00'}</strong>
                            </Col>
                            <Col xs={6} sm={3}>
                                <small className="text-muted d-block mb-1">ปีการศึกษาที่เริ่มใช้</small>
                                <strong className="text-secondary fs-16">{selectedCurriculum.academic_year_start ? `พ.ศ. ${selectedCurriculum.academic_year_start}` : '-'}</strong>
                            </Col>
                        </Row>

                        <div className="mb-4">
                            <h6 className="fw-bold text-dark fs-14 mb-2">โครงสร้างหน่วยกิตตามหมวดวิชา:</h6>
                            <Row className="g-2">
                                <Col md={4}>
                                    <div className="p-3 rounded-3 border bg-white">
                                        <div className="text-muted fs-12 mb-1">หมวดวิชาเอก / บังคับ</div>
                                        <div className="fw-bold fs-16 text-primary">{selectedCurriculum.core_credits_required ?? '-'} หน่วยกิต</div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="p-3 rounded-3 border bg-white">
                                        <div className="text-muted fs-12 mb-1">หมวดวิชาเลือก</div>
                                        <div className="fw-bold fs-16 text-info">{selectedCurriculum.elective_credits_required ?? '-'} หน่วยกิต</div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="p-3 rounded-3 border bg-white">
                                        <div className="text-muted fs-12 mb-1">หมวดวิทยานิพนธ์ / ค้นคว้าอิสระ</div>
                                        <div className="fw-bold fs-16 text-success">{selectedCurriculum.thesis_credits_required ?? '-'} หน่วยกิต</div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {selectedCurriculum.description && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-dark fs-14 mb-2">รายละเอียดและจุดเด่นหลักสูตร:</h6>
                                <div className="p-3 bg-white border rounded-3 fs-13 text-secondary" style={{ whiteSpace: 'pre-line' }}>
                                    {selectedCurriculum.description}
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                )}
                <Modal.Footer className="border-top py-2">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedCurriculum(null)}>
                        ปิด
                    </Button>
                    {selectedCurriculum && (
                        <Link
                            href={`/credits/curriculum?curriculum_id=${selectedCurriculum.id}`}
                            className="btn btn-sm btn-success"
                        >
                            เปิดดูรายวิชาและโครงสร้างหลักสูตรทั้งหมด
                        </Link>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CurriculumsSection;
