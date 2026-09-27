import React, { useMemo } from 'react';
import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form, Badge, Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Select from 'react-select';
import Swal from 'sweetalert2';

interface CourseItem {
    id: number;
    course_code: string;
    course_name_th: string;
    credits: number;
    category: string;
    year_suggested: number;
    term_suggested: number | null;
}

interface CurriculumItem {
    id: number;
    code: string;
    name: string;
    degree_level: string;
    total_credits: number;
    academic_year_start: string | null;
    courses?: CourseItem[];
}

const CreateUserPage = () => {
    const { departments = [], curriculums = [] } = usePage().props as any;
    const defaultDept = departments.find((dept: any) => dept.dp_name?.includes('อาจารย์'));

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        role: string;
        department_id: string | number;
        curriculum_id: string | number;
        student_code: string;
        academic_year: string;
        class_year: string;
        is_active: boolean;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        department_id: defaultDept ? defaultDept.id : '',
        curriculum_id: curriculums.length > 0 ? curriculums[0].id : '',
        student_code: '',
        academic_year: curriculums.length > 0 && curriculums[0].academic_year_start ? curriculums[0].academic_year_start : '2570',
        class_year: 'ชั้นปีที่ 1',
        is_active: true,
    });

    const deptOptions = departments.map((dept: any) => ({
        value: dept.id,
        label: dept.dp_name,
    }));

    const roleOptions = [
        { value: 'admin', label: 'Admin (ผู้ดูแลระบบ)' },
        { value: 'head', label: 'Head (หัวหน้างาน/อาจารย์ที่ปรึกษา)' },
        { value: 'user', label: 'User (ผู้ใช้งานทั่วไป / นักศึกษา)' },
        { value: 'guest', label: 'Guest (ผู้เยี่ยมชม)' },
    ];

    const curriculumOptions = useMemo(() => {
        return curriculums.map((c: CurriculumItem) => ({
            value: c.id,
            label: `[${c.code}] ${c.name} (${c.total_credits} หน่วยกิต)`,
            data: c,
        }));
    }, [curriculums]);

    // ตรวจสอบว่าประเภทที่เลือกคือ "นักศึกษา" หรือไม่
    const selectedDept = departments.find((dept: any) => dept.id === Number(data.department_id));
    const isStudent = Boolean(
        selectedDept && (selectedDept.dp_name?.trim() === 'นักศึกษา' || selectedDept.dp_name?.includes('นักศึกษา'))
    );

    const selectedCurriculum = useMemo(() => {
        if (!data.curriculum_id) return null;
        return curriculums.find((c: CurriculumItem) => c.id === Number(data.curriculum_id)) || null;
    }, [data.curriculum_id, curriculums]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // หากไม่ได้เลือกประเภท ให้กำหนดค่าเริ่มต้นเป็น "อาจารย์"
        if (!data.department_id && defaultDept) {
            data.department_id = defaultDept.id;
        }

        post(route('users.store'), {
            onSuccess: () => {
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: isStudent
                        ? 'บันทึกข้อมูลผู้ใช้งาน สร้างทะเบียนนักศึกษา และลงทะเบียนรายวิชาตามหลักสูตรเรียบร้อยแล้ว'
                        : 'บันทึกข้อมูลผู้ใช้งานเรียบร้อยแล้ว',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1800,
                    timerProgressBar: true,
                });
            },
        });
    };

    return (
        <MainLayout>
            <PageTitle title="เพิ่มผู้ใช้งาน" subTitle="ระบบจัดการ" />
            <Row className="justify-content-center">
                <Col lg={9}>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="border-bottom bg-light py-3">
                            <CardTitle as="h4" className="mb-0 d-flex align-items-center gap-2">
                                <IconifyIcon icon="tabler:user-plus" className="text-primary fs-20" />
                                ข้อมูลผู้ใช้งานใหม่
                            </CardTitle>
                        </CardHeader>
                        <CardBody className="p-4">
                            <form onSubmit={submit}>
                                <Row className="g-3">
                                    <Col md={12}>
                                        <label className="form-label fw-semibold">ชื่อ-นามสกุล <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="เช่น นายกิตติพัฒน์ เครือเทศ"
                                            required
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label fw-semibold">อีเมล (Email) <span className="text-danger">*</span></label>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="example@mail.com"
                                            required
                                        />
                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label fw-semibold">ประเภทผู้ใช้งาน <span className="text-danger">*</span></label>
                                        <Select
                                            classNamePrefix="react-select"
                                            options={deptOptions}
                                            value={deptOptions.find((opt: any) => opt.value === data.department_id) || null}
                                            onChange={(opt: any) => {
                                                const newDeptId = opt ? opt.value : '';
                                                setData((prev) => ({
                                                    ...prev,
                                                    department_id: newDeptId,
                                                    role: opt && opt.label?.trim() === 'นักศึกษา' ? 'user' : prev.role,
                                                }));
                                            }}
                                            placeholder="ค้นหาหรือเลือกประเภท (เริ่มต้น: อาจารย์)..."
                                            isClearable
                                        />
                                        <small className="text-muted fs-11 mt-1 d-block">
                                            * หากเลือกประเภทเป็น <strong>"นักศึกษา"</strong> ระบบจะเปิดฟิลด์กำหนดหลักสูตรและทะเบียนนักศึกษา
                                        </small>
                                        {errors.department_id && <div className="text-danger fs-13 mt-1">{errors.department_id}</div>}
                                    </Col>

                                    {/* Student Curriculum & Profile Section (เมื่อเลือกประเภทเป็นนักศึกษา) */}
                                    {isStudent && (
                                        <Col md={12}>
                                            <Card className="border border-primary-subtle bg-primary-subtle bg-opacity-10 shadow-none mb-2">
                                                <CardHeader className="bg-primary text-white py-2 px-3 rounded-top d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center gap-2 fw-semibold fs-14">
                                                        <IconifyIcon icon="solar:diploma-bold-duotone" className="fs-20" />
                                                        โครงสร้างหลักสูตรและทะเบียนนักศึกษา
                                                    </div>
                                                    <Badge bg="white" className="text-primary fs-11">
                                                        <IconifyIcon icon="tabler:sparkles" className="me-1 align-middle" />
                                                        ลงทะเบียนรายวิชาอัตโนมัติ
                                                    </Badge>
                                                </CardHeader>
                                                <CardBody className="p-3">
                                                    <Row className="g-3">
                                                        <Col md={12}>
                                                            <label className="form-label fw-semibold text-dark">
                                                                หลักสูตร / สาขาวิชา (ในโครงสร้างหลักสูตรและรายวิชา) <span className="text-danger">*</span>
                                                            </label>
                                                            <Select
                                                                classNamePrefix="react-select"
                                                                options={curriculumOptions}
                                                                value={curriculumOptions.find((opt: any) => opt.value === Number(data.curriculum_id)) || null}
                                                                onChange={(opt: any) => {
                                                                    if (opt) {
                                                                        setData((prev) => ({
                                                                            ...prev,
                                                                            curriculum_id: opt.value,
                                                                            academic_year: opt.data.academic_year_start || prev.academic_year,
                                                                        }));
                                                                    } else {
                                                                        setData('curriculum_id', '');
                                                                    }
                                                                }}
                                                                placeholder="เลือกหลักสูตรที่นักศึกษาเข้าศึกษา..."
                                                            />
                                                            <small className="text-muted fs-12 mt-1 d-block">
                                                                * ระบบจะนำหลักสูตรนี้ไปเป็นค่าเริ่มต้นของทะเบียนนักศึกษา และดึงรายวิชาทั้งหมดในหลักสูตรมาลงทะเบียนให้อัตโนมัติ (สามารถตรวจสอบผลการเรียนได้ที่ <strong>credits/student</strong>)
                                                            </small>
                                                        </Col>

                                                        <Col md={4}>
                                                            <label className="form-label fs-13 fw-semibold text-dark">รหัสนักศึกษา (Student Code)</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={data.student_code}
                                                                onChange={(e) => setData('student_code', e.target.value)}
                                                                placeholder="เช่น 68010072 (เว้นว่างเพื่อสร้างอัตโนมัติ)"
                                                            />
                                                        </Col>

                                                        <Col md={4}>
                                                            <label className="form-label fs-13 fw-semibold text-dark">ปีการศึกษาที่เข้าศึกษา</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={data.academic_year}
                                                                onChange={(e) => setData('academic_year', e.target.value)}
                                                                placeholder="เช่น 2570"
                                                            />
                                                        </Col>

                                                        <Col md={4}>
                                                            <label className="form-label fs-13 fw-semibold text-dark">ระดับชั้นปีเริ่มต้น</label>
                                                            <Select
                                                                classNamePrefix="react-select"
                                                                options={[
                                                                    { value: 'ชั้นปีที่ 1', label: 'ชั้นปีที่ 1' },
                                                                    { value: 'ชั้นปีที่ 2', label: 'ชั้นปีที่ 2' },
                                                                    { value: 'ชั้นปีที่ 3', label: 'ชั้นปีที่ 3' },
                                                                    { value: 'ชั้นปีที่ 4', label: 'ชั้นปีที่ 4' },
                                                                ]}
                                                                value={{ value: data.class_year, label: data.class_year }}
                                                                onChange={(opt: any) => setData('class_year', opt ? opt.value : 'ชั้นปีที่ 1')}
                                                            />
                                                        </Col>

                                                        {/* Courses preview */}
                                                        {selectedCurriculum && (
                                                            <Col md={12}>
                                                                <div className="p-3 bg-white rounded border shadow-sm">
                                                                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                                                                        <div className="fw-semibold text-primary fs-13 d-flex align-items-center gap-1">
                                                                            <IconifyIcon icon="tabler:list-check" className="fs-16" />
                                                                            รายวิชาในหลักสูตรที่จะลงทะเบียนให้อัตโนมัติ ({selectedCurriculum.courses?.length || 0} วิชา):
                                                                        </div>
                                                                        <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1 fs-11">
                                                                            รวมเกณฑ์ {selectedCurriculum.total_credits} หน่วยกิต
                                                                        </Badge>
                                                                    </div>
                                                                    {selectedCurriculum.courses && selectedCurriculum.courses.length > 0 ? (
                                                                        <div className="table-responsive" style={{ maxHeight: '240px' }}>
                                                                            <Table size="sm" hover className="mb-0 fs-12 align-middle">
                                                                                <thead className="table-light sticky-top">
                                                                                    <tr>
                                                                                        <th style={{ width: '100px' }}>รหัสวิชา</th>
                                                                                        <th>ชื่อรายวิชา</th>
                                                                                        <th style={{ width: '80px' }} className="text-center">หน่วยกิต</th>
                                                                                        <th style={{ width: '120px' }}>หมวดวิชา</th>
                                                                                        <th style={{ width: '110px' }} className="text-center">ภาคเรียนแนะนำ</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {selectedCurriculum.courses.map((course: CourseItem) => (
                                                                                        <tr key={course.id}>
                                                                                            <td className="fw-bold font-monospace text-primary">{course.course_code}</td>
                                                                                            <td>{course.course_name_th}</td>
                                                                                            <td className="text-center fw-semibold">{course.credits}</td>
                                                                                            <td>
                                                                                                <Badge
                                                                                                    bg={course.category === 'core' ? 'primary-subtle' : course.category === 'elective' ? 'info-subtle' : 'warning-subtle'}
                                                                                                    className={`text-${course.category === 'core' ? 'primary' : course.category === 'elective' ? 'info' : 'warning'}`}
                                                                                                >
                                                                                                    {course.category === 'core' ? 'วิชาบังคับ' : course.category === 'elective' ? 'วิชาเลือก' : 'วิทยานิพนธ์'}
                                                                                                </Badge>
                                                                                            </td>
                                                                                            <td className="text-center text-muted">ปี {course.year_suggested} เทอม {course.term_suggested || 1}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </Table>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-muted fs-12 py-2 text-center bg-light rounded">
                                                                            ยังไม่มีรายวิชาผูกกับหลักสูตรนี้ สามารถเพิ่มรายวิชาได้ที่เมนู "โครงสร้างหลักสูตรและรายวิชา"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    )}

                                    <Col md={6}>
                                        <label className="form-label fw-semibold">บทบาท (Role) <span className="text-danger">*</span></label>
                                        <Select
                                            classNamePrefix="react-select"
                                            options={roleOptions}
                                            value={roleOptions.find((opt) => opt.value === data.role)}
                                            onChange={(opt: any) => setData('role', opt ? opt.value : 'user')}
                                            placeholder="เลือกบทบาท..."
                                        />
                                        {errors.role && <div className="text-danger fs-13 mt-1">{errors.role}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label fw-semibold d-block">สถานะการใช้งาน</label>
                                        <div className="d-flex align-items-center">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                data-switch="success"
                                                checked={data.is_active === true}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                            />
                                            <label htmlFor="is_active" data-on-label="เปิด" data-off-label="ปิด" className="mb-0" />
                                        </div>
                                        {errors.is_active && <div className="text-danger fs-13 mt-1">{errors.is_active}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label fw-semibold">รหัสผ่าน (Password) <span className="text-danger">*</span></label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="อย่างน้อย 8 ตัวอักษร"
                                            required
                                        />
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label fw-semibold">ยืนยันรหัสผ่าน <span className="text-danger">*</span></label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="กรอกรหัสผ่านอีกครั้ง"
                                            required
                                        />
                                    </Col>

                                    <Col md={12} className="text-end mt-4">
                                        <Link href={route('users.index')} className="btn btn-light me-2">
                                            ยกเลิก
                                        </Link>
                                        <Button type="submit" variant="primary" disabled={processing} className="shadow-sm">
                                            <IconifyIcon icon="tabler:device-floppy" className="me-1" />
                                            {processing ? 'กำลังบันทึก...' : 'บันทึกข้อมูลผู้ใช้งาน'}
                                        </Button>
                                    </Col>
                                </Row>
                            </form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default CreateUserPage;

