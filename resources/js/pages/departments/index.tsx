import React, { useEffect } from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Grid, _ } from 'gridjs-react';
import { html } from 'gridjs';
import avatar1 from '@/images/users/avatar-2.jpg';

interface Department {
    id: number;
    dp_name: string;
    dp_status: number;
    dp_type: number;
    users?: any[];
}

interface Props {
    departments: Department[];
}

const DepartmentsPage = ({ departments }: Props) => {
    const { props } = usePage();
    const defaultAvatar = avatar1;

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: `ต้องการลบหน่วยงาน/แผนก ${name} ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('departments.destroy', id), {
                    onSuccess: (page) => {
                        if (page.props.flash && (page.props.flash as any).error) {
                            // Error is handled by flash messages automatically
                        } else {
                            Swal.fire('ลบสำเร็จ!', 'หน่วยงานถูกลบเรียบร้อยแล้ว.', 'success');
                        }
                    },
                });
            }
        });
    };

    // Expose handlers to window for GridJs html buttons
    useEffect(() => {
        (window as any).__inertiaRouter = router;
        (window as any).deleteDepartment = (id: number, name: string) => handleDelete(id, name);
        
        return () => {
            delete (window as any).__inertiaRouter;
            delete (window as any).deleteDepartment;
        };
    }, [departments]);

    return (
        <MainLayout>
            <PageTitle title="จัดการหน่วยงาน/แผนก" subTitle="ระบบจัดการ" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <div className="card-header d-flex align-items-center justify-content-between border-bottom border-light">
                            <h4 className="header-title">รายชื่อหน่วยงาน/แผนก</h4>
                            <div>
                                <Link href={route('departments.create')} className="btn btn-success bg-gradient">
                                    <IconifyIcon icon="tabler:plus" className="me-1" /> เพิ่มหน่วยงาน
                                </Link>
                            </div>
                        </div>
                        
                        <Grid
                            data={departments.map((dept) => [
                                dept.id,
                                dept.dp_name,
                                dept.users || [],
                                dept.dp_type,
                                dept.dp_status,
                                dept
                            ])}
                            columns={[
                                {
                                    name: '#',
                                    width: '80px',
                                },
                                {
                                    name: 'ชื่อหน่วยงาน/แผนก',
                                },
                                {
                                    name: 'สมาชิก',
                                    formatter: (users: any[]) => {
                                        if (!users || users.length === 0) {
                                            return html(`<span class="text-muted small">-</span>`);
                                        }
                                        
                                        const displayUsers = users.slice(0, 4);
                                        const remaining = users.length - 4;
                                        
                                        let avatarsHtml = '<div class="avatar-group">';
                                        
                                        displayUsers.forEach(user => {
                                            const src = user.avatar ? `/storage/${user.avatar}` : defaultAvatar;
                                            avatarsHtml += `
                                                <div class="avatar avatar-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="${user.name}">
                                                    <img src="${src}" alt="avatar" class="rounded-circle avatar-sm border border-2 border-white shadow-sm" style="object-fit:cover; width:32px; height:32px;" onerror="this.src='${defaultAvatar}'" />
                                                </div>
                                            `;
                                        });
                                        
                                        if (remaining > 0) {
                                            avatarsHtml += `
                                                <div class="avatar avatar-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="อีก ${remaining} คน">
                                                    <span class="avatar-title bg-primary rounded-circle fw-bold text-white border border-2 border-white shadow-sm" style="width:32px; height:32px; font-size:12px;">+${remaining}</span>
                                                </div>
                                            `;
                                        }
                                        
                                        avatarsHtml += '</div>';
                                        
                                        return html(avatarsHtml);
                                    }
                                },
                                {
                                    name: 'ประเภท',
                                    formatter: (type: any) => {
                                        let text = 'หน่วยงาน';
                                        let badgeClass = 'bg-info-subtle text-info border border-info-subtle';
                                        if (type === 2) {
                                            text = 'คร่อมสายงาน';
                                            badgeClass = 'bg-secondary-subtle text-secondary border border-secondary-subtle';
                                        } else if (type === 3) {
                                            text = 'รพ.สต./PCC';
                                            badgeClass = 'bg-success-subtle text-success border border-success-subtle';
                                        }
                                        return html(
                                            `<span class="badge ${badgeClass}">
                                                ${text}
                                            </span>`
                                        );
                                    }
                                },
                                {
                                    name: 'สถานะ',
                                    formatter: (status: any) => {
                                        return html(
                                            `<span class="badge bg-${status === 1 ? 'success' : 'danger'}">
                                                ${status === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                            </span>`
                                        );
                                    }
                                },
                                {
                                    name: 'จัดการ',
                                    width: '150px',
                                    formatter: (dept: any) => {
                                        return html(
                                            `<div class="hstack gap-1 justify-content-center">
                                                <button 
                                                    class="btn btn-sm btn-soft-success btn-icon rounded-circle" 
                                                    onclick="event.preventDefault(); window.__inertiaRouter.visit('/departments/${dept.id}/edit')"
                                                    title="แก้ไข"
                                                >
                                                    <iconify-icon icon="tabler:edit" class="fs-16"></iconify-icon>
                                                </button>
                                                <button 
                                                    class="btn btn-sm btn-soft-danger btn-icon rounded-circle" 
                                                    onclick="deleteDepartment(${dept.id}, '${dept.dp_name}')"
                                                    title="ลบ"
                                                >
                                                    <iconify-icon icon="tabler:trash" class="fs-16"></iconify-icon>
                                                </button>
                                            </div>`
                                        );
                                    }
                                }
                            ]}
                            search={true}
                            pagination={{
                                limit: 10,
                            }}
                            sort={true}
                            language={{
                                'search': {
                                    'placeholder': 'ค้นหา...'
                                },
                                'pagination': {
                                    'previous': 'ก่อนหน้า',
                                    'next': 'ถัดไป',
                                    'showing': 'แสดง',
                                    'results': () => 'รายการ'
                                },
                                'noRecordsFound': 'ไม่พบข้อมูลหน่วยงาน/แผนก'
                            }}
                            className={{
                                table: 'table table-hover align-middle mb-0',
                                th: 'bg-light-subtle text-muted fw-semibold',
                                pagination: 'mt-0 mb-0 p-1',
                                container: 'mt-1 mb-1 p-1'
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default DepartmentsPage;
