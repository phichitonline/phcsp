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

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    department?: {
        dp_name: string;
    };
    is_active: boolean;
}

interface Props {
    users: User[];
}

const UsersPage = ({ users }: Props) => {
    const { props } = usePage();

    // กำหนด default avatar path สำหรับใช้ใน GridJS html
    const defaultAvatar = avatar1;

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: `ต้องการลบผู้ใช้ ${name} ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('users.destroy', id), {
                    onSuccess: () => {
                        Swal.fire('ลบสำเร็จ!', 'ผู้ใช้ถูกลบเรียบร้อยแล้ว.', 'success');
                    },
                });
            }
        });
    };

    // Expose handlers to window for GridJs html buttons
    useEffect(() => {
        (window as any).__inertiaRouter = router;
        (window as any).deleteUser = (id: number, name: string) => handleDelete(id, name);
        
        return () => {
            delete (window as any).__inertiaRouter;
            delete (window as any).deleteUser;
        };
    }, [users]);

    return (
        <MainLayout>
            <PageTitle title="จัดการผู้ใช้งาน" subTitle="ระบบจัดการ" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <div className="card-header d-flex align-items-center justify-content-between border-bottom border-light">
                            <h4 className="header-title">รายชื่อผู้ใช้งาน</h4>
                            <div>
                                <Link href={route('users.create')} className="btn btn-success bg-gradient">
                                    <IconifyIcon icon="tabler:plus" className="me-1" /> เพิ่มผู้ใช้งาน
                                </Link>
                            </div>
                        </div>
                        
                        <Grid
                            data={users.map((user, idx) => [
                                idx + 1,
                                user.name,
                                user.email,
                                user.department?.dp_name || '-',
                                user.role,
                                user.is_active,
                                user
                            ])}
                            columns={[
                                {
                                    name: '#',
                                    width: '60px',
                                },
                                {
                                    name: 'ชื่อ-นามสกุล',
                                    formatter: (name: string, row: any) => {
                                        const user = row?.cells?.[6]?.data;
                                        const src = user?.avatar ? `/storage/${user.avatar}` : defaultAvatar;
                                        return html(
                                            `<div class="d-flex align-items-center">
                                                <img src="${src}" class="avatar-sm rounded-circle me-2" style="object-fit:cover;width:36px;height:36px" alt="avatar" onerror="this.style.display='none'" />
                                                <span class="text-dark fw-medium">${name || ''}</span>
                                            </div>`
                                        );
                                    }
                                },
                                {
                                    name: 'อีเมล',
                                },
                                {
                                    name: 'หน่วยงาน/แผนก',
                                },
                                {
                                    name: 'บทบาท (Role)',
                                    formatter: (role: string) => {
                                        const roleColors: Record<string, string> = {
                                            admin: 'danger',
                                            head: 'primary',
                                            user: 'success',
                                        };
                                        const color = roleColors[role] || 'secondary';
                                        
                                        return html(
                                            `<span class="badge bg-${color}">
                                                ${role}
                                            </span>`
                                        );
                                    }
                                },
                                {
                                    name: 'สถานะ',
                                    formatter: (isActive: boolean) => {
                                        return html(
                                            `<span class="badge bg-${isActive ? 'success' : 'danger'}">
                                                ${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                            </span>`
                                        );
                                    }
                                },
                                {
                                    name: 'จัดการ',
                                    width: '150px',
                                    formatter: (user: any) => {
                                        return html(
                                            `<div class="hstack gap-1 justify-content-center">
                                                <button 
                                                    class="btn btn-sm btn-soft-success btn-icon rounded-circle" 
                                                    onclick="event.preventDefault(); window.__inertiaRouter.visit('/users/${user.id}/edit')"
                                                    title="แก้ไข"
                                                >
                                                    <iconify-icon icon="tabler:edit" class="fs-16"></iconify-icon>
                                                </button>
                                                <button 
                                                    class="btn btn-sm btn-soft-danger btn-icon rounded-circle" 
                                                    onclick="deleteUser(${user.id}, '${user.name}')"
                                                    title="ลบ"
                                                >
                                                    <iconify-icon icon="tabler:trash" class="fs-16"></iconify-icon>
                                                </button>
                                            </div>`
                                        );
                                    }
                                }
                            ]}
                            search={{
                                enabled: true,
                                selector: (cell: any, _rowIndex: number, cellIndex: number) => {
                                    if (cellIndex === 6) return '';
                                    return cell !== null && cell !== undefined ? String(cell) : '';
                                }
                            }}
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
                                'noRecordsFound': 'ไม่พบรายชื่อผู้ใช้งาน'
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

export default UsersPage;
