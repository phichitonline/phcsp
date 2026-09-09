import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Link, useForm } from '@inertiajs/react';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form, ButtonGroup, ToggleButton } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useNotificationContext } from '@/context/useNotificationContext';

interface Department {
    id: number;
    dp_name: string;
    dp_status: number;
    dp_type: number;
}

interface Props {
    department: Department;
}

const EditDepartmentPage = ({ department }: Props) => {
    const { showNotification } = useNotificationContext();
    const { data, setData, put, processing, errors } = useForm({
        dp_name: department.dp_name,
        dp_status: department.dp_status,
        dp_type: department.dp_type || 1,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('departments.update', department.id), {
            onSuccess: () => {
                showNotification({
                    title: 'สำเร็จ!',
                    message: 'แก้ไขข้อมูลหน่วยงานเรียบร้อยแล้ว',
                    variant: 'success',
                    delay: 2000
                });
            }
        });
    };

    return (
        <MainLayout>
            <PageTitle title="แก้ไขหน่วยงาน/แผนก" subTitle="ระบบจัดการ" />
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card>
                        <CardHeader className="border-bottom border-dashed">
                            <CardTitle as="h4" className="mb-0">แก้ไขข้อมูลหน่วยงาน</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={submit}>
                                <Row className="g-3">
                                    <Col md={12}>
                                        <label className="form-label">ชื่อหน่วยงาน/แผนก <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.dp_name ? 'is-invalid' : ''}`}
                                            value={data.dp_name}
                                            onChange={(e) => setData('dp_name', e.target.value)}
                                            placeholder="กรอกชื่อหน่วยงานหรือแผนก"
                                            required
                                        />
                                        {errors.dp_name && <div className="invalid-feedback">{errors.dp_name}</div>}
                                    </Col>

                                    <Col md={12}>
                                        <label className="form-label">ประเภทหน่วยงาน</label>
                                        <div>
                                            <ButtonGroup>
                                                <ToggleButton
                                                    id="type-dept"
                                                    type="radio"
                                                    variant={data.dp_type === 1 ? 'primary' : 'outline-primary'}
                                                    name="dp_type"
                                                    value="1"
                                                    checked={data.dp_type === 1}
                                                    onChange={() => setData('dp_type', 1)}
                                                >
                                                    หน่วยงาน
                                                </ToggleButton>
                                                <ToggleButton
                                                    id="type-cross"
                                                    type="radio"
                                                    variant={data.dp_type === 2 ? 'secondary' : 'outline-secondary'}
                                                    name="dp_type"
                                                    value="2"
                                                    checked={data.dp_type === 2}
                                                    onChange={() => setData('dp_type', 2)}
                                                >
                                                    คร่อมสายงาน
                                                </ToggleButton>
                                                <ToggleButton
                                                    id="type-pcc"
                                                    type="radio"
                                                    variant={data.dp_type === 3 ? 'info' : 'outline-info'}
                                                    name="dp_type"
                                                    value="3"
                                                    checked={data.dp_type === 3}
                                                    onChange={() => setData('dp_type', 3)}
                                                >
                                                    รพ.สต./PCC
                                                </ToggleButton>
                                            </ButtonGroup>
                                        </div>
                                        {errors.dp_type && <div className="text-danger fs-13 mt-1">{errors.dp_type}</div>}
                                    </Col>

                                    <Col md={12}>
                                        <label className="form-label d-block">สถานะ</label>
                                        <div className="d-flex align-items-center">
                                            <input
                                                type="checkbox"
                                                id="dp_status"
                                                data-switch="success"
                                                checked={data.dp_status === 1}
                                                onChange={(e) => setData('dp_status', e.target.checked ? 1 : 0)}
                                            />
                                            <label htmlFor="dp_status" data-on-label="เปิด" data-off-label="ปิด" className="mb-0" />
                                        </div>
                                        {errors.dp_status && <div className="text-danger fs-13 mt-1">{errors.dp_status}</div>}
                                    </Col>

                                    <Col md={12} className="text-end mt-4">
                                        <Link href={route('departments.index')} className="btn btn-light me-2">
                                            ยกเลิก
                                        </Link>
                                        <Button type="submit" variant="primary" disabled={processing}>
                                            <IconifyIcon icon="tabler:device-floppy" className="me-1" />
                                            บันทึกข้อมูล
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

export default EditDepartmentPage;
