import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';
import {
    Card,
    CardBody,
    Row,
    Col,
    Table,
    Button,
    Badge,
    Modal,
    Form,
} from 'react-bootstrap';

interface CourseItem {
    id: number;
    course_code: string;
    course_name_th: string;
    course_name_en: string | null;
    credits: number;
    lecture_hours: number;
    lab_hours: number;
    self_study_hours: number;
    category: 'core' | 'elective' | 'thesis' | 'remedial';
    year_suggested: number;
    term_suggested: number | null;
    is_active: boolean;
    order_no: number;
}

interface CurriculumItem {
    id: number;
    code: string;
    name: string;
    degree_level: string;
    total_credits: number;
    core_credits_required: number;
    elective_credits_required: number;
    thesis_credits_required: number;
    min_gpa_graduate: number;
    academic_year_start: string | null;
    description: string | null;
    courses: CourseItem[];
}

interface Props {
    curriculums: CurriculumItem[];
    is_admin: boolean;
}

const CurriculumManagementPage: React.FC<Props> = ({ curriculums, is_admin }) => {
    const activeCurriculum = curriculums[0] || null;
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);

    // Form state for add/edit course
    const [formData, setFormData] = useState({
        course_code: '',
        course_name_th: '',
        course_name_en: '',
        credits: 3,
        category: 'core',
        year_suggested: 1,
        term_suggested: 1,
        is_active: true,
        order_no: 1,
    });

    const handleOpenAddModal = () => {
        setEditingCourse(null);
        setFormData({
            course_code: '',
            course_name_th: '',
            course_name_en: '',
            credits: 3,
            category: 'core',
            year_suggested: 1,
            term_suggested: 1,
            is_active: true,
            order_no: (activeCurriculum?.courses.length || 0) + 1,
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (course: CourseItem) => {
        setEditingCourse(course);
        setFormData({
            course_code: course.course_code,
            course_name_th: course.course_name_th,
            course_name_en: course.course_name_en || '',
            credits: course.credits,
            category: course.category,
            year_suggested: course.year_suggested,
            term_suggested: course.term_suggested || 1,
            is_active: course.is_active,
            order_no: course.order_no,
        });
        setShowModal(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCurriculum) return;

        router.post(
            '/credits/courses',
            {
                id: editingCourse?.id,
                curriculum_id: activeCurriculum.id,
                ...formData,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'บันทึกสำเร็จ!',
                        text: editingCourse ? 'แก้ไขข้อมูลรายวิชาเรียบร้อยแล้ว' : 'เพิ่มรายวิชาใหม่เรียบร้อยแล้ว',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                onError: (err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: Object.values(err)[0] || 'ไม่สามารถบันทึกรายวิชาได้',
                    });
                },
            }
        );
    };

    const handleDeleteCourse = (course: CourseItem) => {
        Swal.fire({
            icon: 'warning',
            title: 'ยืนยันการลบรายวิชา?',
            text: `ต้องการลบวิชา ${course.course_code}: ${course.course_name_th} หรือไม่?`,
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'ใช่, ต้องการลบ',
            cancelButtonText: 'ยกเลิก',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/credits/courses/${course.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'ลบสำเร็จ!',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    },
                });
            }
        });
    };

    const allCourses = activeCurriculum?.courses || [];
    const filteredCourses = selectedCategory === 'all'
        ? allCourses
        : allCourses.filter((c) => c.category === selectedCategory);

    return (
        <MainLayout>
            <Head title="โครงสร้างหลักสูตรและรายวิชา - ปริญญาโท วสส.สุพรรณบุรี" />
            <PageTitle title="โครงสร้างหลักสูตรและรายวิชา" subTitle="จัดการหลักสูตรและแผนการเรียน ปริญญาโท วสส.สุพรรณบุรี" />

            {/* Top Bar Actions */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                <div className="d-flex align-items-center gap-2">
                    <Link href="/credits" className="btn btn-outline-secondary btn-sm bg-white shadow-sm d-inline-flex align-items-center gap-1">
                        <IconifyIcon icon="tabler:arrow-left" className="fs-16" />
                        <span>กลับไปหน้าภาพรวมหน่วยกิต</span>
                    </Link>
                </div>

                {is_admin && (
                    <Button variant="primary" size="sm" onClick={handleOpenAddModal} className="d-inline-flex align-items-center gap-1 shadow-sm">
                        <IconifyIcon icon="tabler:plus" className="fs-16" />
                        <span>เพิ่มรายวิชาใหม่</span>
                    </Button>
                )}
            </div>

            {/* Curriculum Info Header Card */}
            {activeCurriculum && (
                <Card className="shadow-sm border-0 mb-4 overflow-hidden">
                    <CardBody className="p-4">
                        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                    <h4 className="mb-0 fw-bold text-dark fs-18">{activeCurriculum.name}</h4>
                                    <Badge bg="primary" className="fs-12 px-2 py-1">
                                        รหัส {activeCurriculum.code}
                                    </Badge>
                                    <Badge bg="info-subtle" className="text-info border border-info-subtle fs-12 px-2 py-1">
                                        ระดับปริญญาโท
                                    </Badge>
                                </div>
                                <p className="text-muted fs-13 mb-2">
                                    {activeCurriculum.description || 'หลักสูตรระดับปริญญาโท วสส.สุพรรณบุรี แผน ก แบบ ก 2'}
                                </p>
                                <div className="d-flex align-items-center gap-3 text-muted fs-12 flex-wrap">
                                    <span>ปีการศึกษาเริ่มต้น: <strong>{activeCurriculum.academic_year_start || '2566'}</strong></span>
                                    <span>เกรดเฉลี่ยขั้นต่ำเพื่อจบ: <strong>GPA ≥ {Number(activeCurriculum.min_gpa_graduate).toFixed(2)}</strong></span>
                                    <span>จำนวนรายวิชาในระบบ: <strong>{allCourses.length} รายวิชา</strong></span>
                                </div>
                            </div>

                            {/* Credit Criteria Summary */}
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <div className="border rounded p-2 text-center bg-light-subtle" style={{ minWidth: 90 }}>
                                    <small className="text-muted d-block fs-11">รวมตลอดหลักสูตร</small>
                                    <strong className="fs-16 text-primary">{activeCurriculum.total_credits}</strong>
                                    <span className="fs-11 text-muted"> นก.</span>
                                </div>
                                <div className="border rounded p-2 text-center bg-light-subtle" style={{ minWidth: 90 }}>
                                    <small className="text-muted d-block fs-11">วิชาบังคับ</small>
                                    <strong className="fs-16 text-dark">{activeCurriculum.core_credits_required}</strong>
                                    <span className="fs-11 text-muted"> นก.</span>
                                </div>
                                <div className="border rounded p-2 text-center bg-light-subtle" style={{ minWidth: 90 }}>
                                    <small className="text-muted d-block fs-11">วิชาเลือก</small>
                                    <strong className="fs-16 text-dark">{activeCurriculum.elective_credits_required}</strong>
                                    <span className="fs-11 text-muted"> นก.</span>
                                </div>
                                <div className="border rounded p-2 text-center bg-light-subtle" style={{ minWidth: 90 }}>
                                    <small className="text-muted d-block fs-11">วิทยานิพนธ์</small>
                                    <strong className="fs-16 text-dark">{activeCurriculum.thesis_credits_required}</strong>
                                    <span className="fs-11 text-muted"> นก.</span>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Courses Table Card */}
            <Card className="shadow-sm border-0 overflow-hidden mb-4">
                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <IconifyIcon icon="tabler:books" className="text-primary fs-20" />
                        <h5 className="mb-0 fw-bold text-dark fs-16">
                            รายวิชาในหลักสูตร ({filteredCourses.length} วิชา)
                        </h5>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="btn-group btn-group-sm">
                        <Button
                            variant={selectedCategory === 'all' ? 'primary' : 'outline-light text-dark border'}
                            onClick={() => setSelectedCategory('all')}
                        >
                            ทั้งหมด ({allCourses.length})
                        </Button>
                        <Button
                            variant={selectedCategory === 'core' ? 'primary' : 'outline-light text-dark border'}
                            onClick={() => setSelectedCategory('core')}
                        >
                            วิชาบังคับ ({allCourses.filter((c) => c.category === 'core').length})
                        </Button>
                        <Button
                            variant={selectedCategory === 'elective' ? 'primary' : 'outline-light text-dark border'}
                            onClick={() => setSelectedCategory('elective')}
                        >
                            วิชาเลือก ({allCourses.filter((c) => c.category === 'elective').length})
                        </Button>
                        <Button
                            variant={selectedCategory === 'thesis' ? 'primary' : 'outline-light text-dark border'}
                            onClick={() => setSelectedCategory('thesis')}
                        >
                            วิทยานิพนธ์ ({allCourses.filter((c) => c.category === 'thesis').length})
                        </Button>
                    </div>
                </div>

                <CardBody className="p-0">
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead className="bg-light-subtle text-muted text-uppercase fs-12">
                                <tr>
                                    <th style={{ width: 60 }} className="text-center">#</th>
                                    <th style={{ width: 120 }}>รหัสวิชา</th>
                                    <th>ชื่อรายวิชา</th>
                                    <th style={{ width: 100 }} className="text-center">หน่วยกิต</th>
                                    <th style={{ width: 130 }}>หมวดวิชา</th>
                                    <th style={{ width: 130 }} className="text-center">แผนการเรียน</th>
                                    <th style={{ width: 100 }} className="text-center">สถานะ</th>
                                    {is_admin && <th style={{ width: 120 }} className="text-center">การจัดการ</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5 text-muted">
                                            <p className="mb-0 fs-14">ยังไม่มีรายวิชาในหมวดนี้</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCourses.map((course, idx) => (
                                        <tr key={course.id}>
                                            <td className="text-center text-muted fw-semibold">{idx + 1}</td>
                                            <td className="fw-bold text-primary fs-13">{course.course_code}</td>
                                            <td>
                                                <div className="fw-medium text-dark fs-13">{course.course_name_th}</div>
                                                {course.course_name_en && (
                                                    <small className="text-muted d-block fs-11">{course.course_name_en}</small>
                                                )}
                                            </td>
                                            <td className="text-center fw-bold fs-13">{course.credits}</td>
                                            <td>
                                                <Badge
                                                    bg={course.category === 'core' ? 'primary-subtle' : course.category === 'elective' ? 'info-subtle' : 'warning-subtle'}
                                                    className={`border ${course.category === 'core' ? 'text-primary border-primary-subtle' : course.category === 'elective' ? 'text-info border-info-subtle' : 'text-warning border-warning-subtle'} fs-11 py-1 px-2`}
                                                >
                                                    {course.category === 'core' ? 'วิชาบังคับ' : course.category === 'elective' ? 'วิชาเลือก' : 'วิทยานิพนธ์'}
                                                </Badge>
                                            </td>
                                            <td className="text-center text-muted fs-12">
                                                ปี {course.year_suggested} เทอม {course.term_suggested || '-'}
                                            </td>
                                            <td className="text-center">
                                                {course.is_active ? (
                                                    <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1 fs-11">
                                                        เปิดสอน
                                                    </Badge>
                                                ) : (
                                                    <Badge bg="light" className="text-muted border px-2 py-1 fs-11">
                                                        ปิดชั่วคราว
                                                    </Badge>
                                                )}
                                            </td>
                                            {is_admin && (
                                                <td className="text-center">
                                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                                        <Button
                                                            variant="light"
                                                            size="sm"
                                                            onClick={() => handleOpenEditModal(course)}
                                                            className="btn-icon text-primary p-1"
                                                            title="แก้ไขรายวิชา"
                                                        >
                                                            <IconifyIcon icon="tabler:edit" className="fs-16" />
                                                        </Button>
                                                        <Button
                                                            variant="light"
                                                            size="sm"
                                                            onClick={() => handleDeleteCourse(course)}
                                                            className="btn-icon text-danger p-1"
                                                            title="ลบรายวิชา"
                                                        >
                                                            <IconifyIcon icon="tabler:trash" className="fs-16" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Card>

            {/* Modal: เพิ่ม/แก้ไขรายวิชา */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-light-subtle py-3 border-bottom">
                    <Modal.Title as="h5" className="fw-bold text-dark fs-16">
                        {editingCourse ? 'แก้ไขข้อมูลรายวิชา' : 'เพิ่มรายวิชาใหม่ในหลักสูตร'}
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={handleFormSubmit}>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold fs-13">รหัสวิชา <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="เช่น MPH601"
                                        value={formData.course_code}
                                        onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold fs-13">หน่วยกิต <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formData.credits}
                                        onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold fs-13">หมวดวิชา <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    >
                                        <option value="core">หมวดวิชาบังคับ</option>
                                        <option value="elective">หมวดวิชาเลือก</option>
                                        <option value="thesis">หมวดวิทยานิพนธ์ / IS</option>
                                        <option value="remedial">หมวดวิชาปรับพื้นฐาน</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold fs-13">ชื่อรายวิชา (ภาษาไทย) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="เช่น วิทยาการระบาดประยุกต์และชีวสถิติ"
                                        value={formData.course_name_th}
                                        onChange={(e) => setFormData({ ...formData, course_name_th: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold fs-13">ชื่อรายวิชา (ภาษาอังกฤษ)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="เช่น Applied Epidemiology and Biostatistics"
                                        value={formData.course_name_en}
                                        onChange={(e) => setFormData({ ...formData, course_name_en: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold fs-13">ชั้นปีที่แนะนำให้เรียน</Form.Label>
                                    <Form.Select
                                        value={formData.year_suggested}
                                        onChange={(e) => setFormData({ ...formData, year_suggested: Number(e.target.value) })}
                                    >
                                        <option value="1">ชั้นปีที่ 1</option>
                                        <option value="2">ชั้นปีที่ 2</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold fs-13">ภาคเรียนที่แนะนำให้เรียน</Form.Label>
                                    <Form.Select
                                        value={formData.term_suggested}
                                        onChange={(e) => setFormData({ ...formData, term_suggested: Number(e.target.value) })}
                                    >
                                        <option value="1">ภาคเรียนที่ 1</option>
                                        <option value="2">ภาคเรียนที่ 2</option>
                                        <option value="3">ภาคฤดูร้อน</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="bg-light-subtle py-2">
                        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>ยกเลิก</Button>
                        <Button variant="primary" type="submit">
                            <IconifyIcon icon="tabler:device-floppy" className="me-1" />
                            บันทึกข้อมูล
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </MainLayout>
    );
};

export default CurriculumManagementPage;
