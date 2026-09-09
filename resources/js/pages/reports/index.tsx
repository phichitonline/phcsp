import React, { useEffect } from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Dropdown, Button } from 'react-bootstrap';
import { router, Link, usePage } from '@inertiajs/react';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import Swal from 'sweetalert2';

interface Department {
    id: number;
    dp_name: string;
}

interface Report {
    id: number;
    rep_code: string;
    rep_name: string;
    department_id: number | null;
    rep_sql_query: string;
    rep_description: string | null;
    is_active: number;
    updated_at: string;
    department?: Department;
}

interface ReportsPageProps {
    departments: Department[];
    reports: Report[];
    currentDepartment: string;
}

const ReportsPage = ({ departments = [], reports = [], currentDepartment = '' }: ReportsPageProps) => {
    const { props } = usePage() as any;
    const user = props.auth?.user;
    const isAdmin = user?.role === 'admin';

    const handleDepartmentChange = (deptId: string) => {
        router.get('/end-user-reports', { department_id: deptId });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: 'ยืนยันการลบรายงาน?',
            text: `คุณต้องการลบรายงาน "${name}" ออกจากระบบใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/end-user-reports/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'ลบสำเร็จ!',
                            text: 'รายงานถูกลบออกจากระบบเรียบร้อยแล้ว',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    },
                });
            }
        });
    };

    useEffect(() => {
        (window as any).__inertiaRouter = router;
        (window as any).deleteReport = (id: number, name: string) => handleDelete(id, name);

        return () => {
            delete (window as any).__inertiaRouter;
            delete (window as any).deleteReport;
        };
    }, [reports]);

    return (
        <MainLayout>
            <PageTitle
                title="รายงาน End Users"
                subTitle="ระบบประมวลผล HOSxP"
                rightContent={
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">เลือกหน่วยงาน:</span>
                        <Dropdown onSelect={(key) => handleDepartmentChange(key || '')}>
                            <Dropdown.Toggle variant="outline-primary" size="sm" id="dropdown-reports-dept">
                                {departments.find((d) => String(d.id) === currentDepartment)?.dp_name || 'ทั้งหมด'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey="">ทั้งหมด</Dropdown.Item>
                                <Dropdown.Divider />
                                {departments.map((dept) => (
                                    <Dropdown.Item key={dept.id} eventKey={String(dept.id)}>
                                        {dept.dp_name}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                }
            />

            <Row>
                <Col md={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light-subtle py-3 d-flex justify-content-between align-items-center">
                            <h4 className="card-title mb-0 d-flex align-items-center">
                                <IconifyIcon icon="tabler:report" className="me-2 text-primary fs-20" />
                                รายชื่อรายงาน End Users ทั้งหมด ({reports.length})
                            </h4>
                            {isAdmin && (
                                <Link href="/end-user-reports/create" className="btn btn-success btn-sm d-inline-flex align-items-center gap-1 shadow-sm">
                                    <IconifyIcon icon="tabler:plus" className="fs-16" />
                                    เพิ่มรายงานใหม่
                                </Link>
                            )}
                        </Card.Header>
                        <CardBody>
                            <Grid
                                data={reports.map((report) => [
                                    report.rep_name,
                                    report.department?.dp_name || 'ทั่วไป / ทุกหน่วยงาน',
                                    formatDate(report.updated_at),
                                    report.is_active,
                                    report,
                                ])}
                                columns={[
                                    {
                                        name: 'ชื่อรายงาน / เงื่อนไข',
                                        width: '40%',
                                        formatter: (_, row) => {
                                            const rep = row.cells[4].data as Report;
                                            const desc = rep.rep_description ? `<div class="text-muted small mt-1">${rep.rep_description}</div>` : '';
                                            const code = rep.rep_code ? `<span class="badge bg-light text-dark border me-1">${rep.rep_code}</span>` : '';
                                            return html(`<div>${code}<span class="fw-medium text-dark fs-14">${rep.rep_name}</span>${desc}</div>`);
                                        },
                                    },
                                    {
                                        name: 'หน่วยงานที่ขอ',
                                        width: '20%',
                                        formatter: (deptName) => html(`<span class="badge bg-info-subtle text-info fs-12 px-2 py-1 border border-info-subtle">${deptName}</span>`),
                                    },
                                    {
                                        name: 'ปรับปรุงล่าสุด',
                                        width: '15%',
                                        formatter: (dateStr) => html(`<span class="text-muted fs-13">${dateStr}</span>`),
                                    },
                                    {
                                        name: 'สถานะ',
                                        width: '10%',
                                        formatter: (status) => {
                                            if (status === 1) {
                                                return html(`<span class="badge bg-success-subtle text-success rounded-pill px-2 py-1">เปิดใช้งาน</span>`);
                                            }
                                            return html(`<span class="badge bg-danger-subtle text-danger rounded-pill px-2 py-1">ปิดชั่วคราว</span>`);
                                        },
                                    },
                                    {
                                        name: 'การจัดการ / ประมวลผล',
                                        width: '15%',
                                        sort: false,
                                        formatter: (rep: Report) => {
                                            let buttons = `
                                                <div class="d-flex justify-content-center align-items-center gap-1">
                                                    <button 
                                                        class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                                                        onclick="window.__inertiaRouter.visit('/end-user-reports/${rep.id}/view')"
                                                        title="ดูรายงาน / ประมวลผล"
                                                    >
                                                        <iconify-icon icon="tabler:player-play-filled" class="fs-14"></iconify-icon>
                                                        ทำรายงาน
                                                    </button>
                                            `;

                                            if (isAdmin) {
                                                const safeName = rep.rep_name.replace(/'/g, "\\'");
                                                buttons += `
                                                    <button 
                                                        class="btn btn-sm btn-soft-warning btn-icon"
                                                        onclick="window.__inertiaRouter.visit('/end-user-reports/${rep.id}/edit')"
                                                        title="แก้ไขรายงาน"
                                                    >
                                                        <iconify-icon icon="tabler:edit" class="fs-16"></iconify-icon>
                                                    </button>
                                                    <button 
                                                        class="btn btn-sm btn-soft-danger btn-icon"
                                                        onclick="window.deleteReport(${rep.id}, '${safeName}')"
                                                        title="ลบรายงาน"
                                                    >
                                                        <iconify-icon icon="tabler:trash" class="fs-16"></iconify-icon>
                                                    </button>
                                                `;
                                            }

                                            buttons += `</div>`;
                                            return html(buttons);
                                        },
                                    },
                                ]}
                                search={true}
                                pagination={{
                                    limit: 15,
                                }}
                                sort={true}
                                language={{
                                    search: {
                                        placeholder: 'ค้นหาชื่อรายงาน, รหัส, หรือคำอธิบาย...',
                                    },
                                    pagination: {
                                        previous: 'ก่อนหน้า',
                                        next: 'ถัดไป',
                                        showing: 'แสดง',
                                        results: () => 'รายการ',
                                    },
                                }}
                                className={{
                                    table: 'table table-hover align-middle mb-0',
                                    thead: 'bg-light text-muted fw-semibold',
                                    pagination: 'mt-3',
                                }}
                            />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default ReportsPage;
