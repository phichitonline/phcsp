import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Badge } from 'react-bootstrap';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';

interface Department {
    id: number;
    dp_name: string;
    dp_status: number;
}

interface DepartmentsPageProps {
    departments: Department[];
}

const DepartmentsPage = ({ departments = [] }: DepartmentsPageProps) => {
    return (
        <MainLayout>
            <PageTitle title="หน่วยงาน" subTitle="โรงพยาบาล" />

            <div className="mt-4">
                <Row>
                    <Col md={12}>
                        <Card className="shadow-sm">
                            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0 text-primary">
                                    <IconifyIcon icon="solar:buildings-2-bold-duotone" className="me-2" />
                                    รายการหน่วยงานทั้งหมด
                                </h5>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-primary-subtle text-primary fs-13 px-3 py-2">
                                        <IconifyIcon icon="solar:chart-2-bold" className="me-1 align-middle" />
                                        ทั้งหมด {departments.length} หน่วยงาน
                                    </span>
                                </div>
                            </Card.Header>
                            <CardBody>
                                <Grid
                                    data={departments.map((dept, index) => [
                                        index + 1,
                                        dept.id,
                                        dept.dp_name,
                                        dept.dp_status,
                                    ])}
                                    columns={[
                                        {
                                            name: 'ลำดับ',
                                            width: '80px',
                                            formatter: (cell) => html(
                                                `<div class="text-center fw-medium text-muted">${cell}</div>`
                                            )
                                        },
                                        {
                                            name: 'รหัส',
                                            width: '100px',
                                            formatter: (cell) => html(
                                                `<div class="text-center">
                                                    <span class="badge bg-light text-dark border fs-12 px-2 py-1">#${cell}</span>
                                                </div>`
                                            )
                                        },
                                        {
                                            name: 'ชื่อหน่วยงาน',
                                            formatter: (cell) => html(
                                                `<div class="d-flex align-items-center gap-2">
                                                    <div class="avatar-xs flex-shrink-0">
                                                        <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-14">
                                                            <iconify-icon icon="solar:buildings-2-bold"></iconify-icon>
                                                        </span>
                                                    </div>
                                                    <span class="fw-medium text-dark">${cell}</span>
                                                </div>`
                                            )
                                        },
                                        {
                                            name: 'สถานะ',
                                            width: '120px',
                                            formatter: (cell) => html(
                                                `<div class="text-center">
                                                    <span class="badge ${Number(cell) === 1
                                                        ? 'bg-success-subtle text-success border border-success-subtle'
                                                        : 'bg-danger-subtle text-danger border border-danger-subtle'
                                                    } fs-12 px-2 py-1 rounded-pill">
                                                        <iconify-icon icon="${Number(cell) === 1
                                                            ? 'solar:check-circle-bold'
                                                            : 'solar:close-circle-bold'
                                                        }" class="me-1 align-middle"></iconify-icon>
                                                        ${Number(cell) === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                    </span>
                                                </div>`
                                            )
                                        },
                                    ]}
                                    search={true}
                                    pagination={{
                                        limit: 15,
                                    }}
                                    sort={true}
                                    language={{
                                        search: {
                                            placeholder: 'ค้นหาหน่วยงาน...'
                                        },
                                        pagination: {
                                            previous: 'ก่อนหน้า',
                                            next: 'ถัดไป',
                                            showing: 'แสดง',
                                            results: () => 'รายการ'
                                        }
                                    }}
                                    className={{
                                        table: 'table table-hover align-middle mb-0',
                                        thead: 'bg-light-subtle text-muted fw-semibold',
                                        pagination: 'mt-3'
                                    }}
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </MainLayout>
    );
};

export default DepartmentsPage;
