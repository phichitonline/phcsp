import IconifyIcon from '@/components/wrappers/IconifyIcon';
import logoDark from '@/images/logo-dark.png';
import logo from '@/images/logo.png';
import BaseLayout from '@/layouts/BaseLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { DepartmentType } from '@/types/data';
import { FormEvent } from 'react';
import Select from 'react-select';

type CompleteRegistrationProps = {
    departments: DepartmentType[];
};

const CompleteRegistrationPage = ({ departments }: CompleteRegistrationProps) => {
    const { data, setData, post, processing, errors } = useForm({
        department_id: '',
    });

    const deptOptions = departments.map((dept: any) => ({
        value: dept.id,
        label: dept.dp_name || dept.name, // Handle possible naming differences
    }));

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('complete.registration.update'));
    };

    return (
        <BaseLayout>
            <Head title="Complete Registration" />
            <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
                <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
                    <Col xl={4} lg={5} md={6}>
                        <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
                            <Link href="/" className="auth-brand mb-3">
                                <img src={logoDark} alt="dark logo" height={24} className="logo-dark" />
                                <img src={logo} alt="logo light" height={24} className="logo-light" />
                            </Link>
                            <h3 className="fw-semibold mb-2">ข้อมูลเพิ่มเติม</h3>
                            <p className="text-muted mb-4">
                                กรุณาเลือกแผนก/หน่วยงานของคุณ เพื่อสิ้นสุดขั้นตอนการลงทะเบียน
                            </p>

                            <Form onSubmit={submit} className="text-start mb-3">
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="department_id">แผนก/หน่วยงาน <span className="text-danger">*</span></Form.Label>
                                    <Select
                                        classNamePrefix="react-select"
                                        options={deptOptions}
                                        value={deptOptions.find((opt: any) => opt.value === data.department_id) || null}
                                        onChange={(opt: any) => setData('department_id', opt ? opt.value : '')}
                                        placeholder="ค้นหาหรือเลือกแผนก..."
                                        isClearable
                                    />
                                    {errors.department_id && <div className="text-danger fs-13 mt-1">{errors.department_id}</div>}
                                </Form.Group>

                                <div className="d-grid">
                                    <Button type="submit" variant="primary" disabled={processing || !data.department_id}>
                                        บันทึกข้อมูล
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        </BaseLayout>
    );
};

export default CompleteRegistrationPage;
