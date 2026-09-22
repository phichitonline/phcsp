import React, { useEffect, useMemo, useState } from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { Card, Col, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import avatar1 from '@/images/users/avatar-2.jpg';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    department?: {
        id?: number;
        dp_name: string;
    };
    student_profile?: {
        id: number;
        student_code?: string;
    };
    is_active: boolean;
}

interface Props {
    users: User[];
}

type FilterType = 'all' | 'teacher' | 'student';

const UsersPage = ({ users }: Props) => {
    const { props } = usePage();
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    // กำหนด default avatar path สำหรับใช้ใน GridJS html
    const defaultAvatar = avatar1;

    const isTeacher = (user: User) => {
        const deptName = user.department?.dp_name?.toLowerCase() || '';
        const role = user.role?.toLowerCase() || '';
        return deptName.includes('อาจารย์') || role === 'teacher' || role === 'instructor';
    };

    const isStudent = (user: User) => {
        const deptName = user.department?.dp_name?.toLowerCase() || '';
        const role = user.role?.toLowerCase() || '';
        return deptName.includes('นักศึกษา') || role === 'student' || !!user.student_profile;
    };

    const teacherCount = useMemo(() => users.filter(isTeacher).length, [users]);
    const studentCount = useMemo(() => users.filter(isStudent).length, [users]);

    const filteredUsers = useMemo(() => {
        if (activeFilter === 'teacher') return users.filter(isTeacher);
        if (activeFilter === 'student') return users.filter(isStudent);
        return users;
    }, [users, activeFilter]);

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
                        <div className="card-header border-bottom border-light">
                            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                                <div className="d-flex flex-wrap align-items-center gap-3">
                                    <h4 className="header-title mb-0">รายชื่อผู้ใช้งาน</h4>

                                    {/* Filter Buttons */}
                                    <div className="btn-group p-1 bg-light rounded-pill border" role="group" aria-label="ตัวกรองประเภทผู้ใช้งาน">
                                        <button
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 fw-medium d-inline-flex align-items-center ${
                                                activeFilter === 'all'
                                                    ? 'btn-primary text-white shadow-sm'
                                                    : 'btn-light text-secondary border-0'
                                            }`}
                                            onClick={() => setActiveFilter('all')}
                                        >
                                            <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-1 fs-16" />
                                            <span>ทั้งหมด</span>
                                            <span
                                                className={`badge ms-2 rounded-pill ${
                                                    activeFilter === 'all'
                                                        ? 'bg-white text-primary'
                                                        : 'bg-secondary-subtle text-secondary'
                                                }`}
                                            >
                                                {users.length}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 fw-medium d-inline-flex align-items-center ${
                                                activeFilter === 'teacher'
                                                    ? 'btn-info text-white shadow-sm'
                                                    : 'btn-light text-secondary border-0'
                                            }`}
                                            onClick={() => setActiveFilter('teacher')}
                                        >
                                            <IconifyIcon icon="solar:square-academic-cap-bold-duotone" className="me-1 fs-16" />
                                            <span>อาจารย์</span>
                                            <span
                                                className={`badge ms-2 rounded-pill ${
                                                    activeFilter === 'teacher'
                                                        ? 'bg-white text-info'
                                                        : 'bg-info-subtle text-info'
                                                }`}
                                            >
                                                {teacherCount}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 fw-medium d-inline-flex align-items-center ${
                                                activeFilter === 'student'
                                                    ? 'btn-success text-white shadow-sm'
                                                    : 'btn-light text-secondary border-0'
                                            }`}
                                            onClick={() => setActiveFilter('student')}
                                        >
                                            <IconifyIcon icon="solar:backpack-bold-duotone" className="me-1 fs-16" />
                                            <span>นักศึกษา</span>
                                            <span
                                                className={`badge ms-2 rounded-pill ${
                                                    activeFilter === 'student'
                                                        ? 'bg-white text-success'
                                                        : 'bg-success-subtle text-success'
                                                }`}
                                            >
                                                {studentCount}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Link href={route('users.create')} className="btn btn-success bg-gradient rounded-pill px-3 shadow-sm">
                                        <IconifyIcon icon="tabler:plus" className="me-1 align-middle fs-16" /> เพิ่มผู้ใช้งาน
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        <Grid
                            key={`users-grid-${activeFilter}`}
                            data={filteredUsers.map((user, idx) => [
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
                                    name: 'ประเภท',
                                    formatter: (dept: string) => {
                                        let badgeClass = 'bg-secondary-subtle text-secondary border';
                                        if (dept.includes('อาจารย์')) {
                                            badgeClass = 'bg-info-subtle text-info border border-info-subtle';
                                        } else if (dept.includes('นักศึกษา')) {
                                            badgeClass = 'bg-success-subtle text-success border border-success-subtle';
                                        } else if (dept.includes('Admin')) {
                                            badgeClass = 'bg-danger-subtle text-danger border border-danger-subtle';
                                        }
                                        return html(
                                            `<span class="badge ${badgeClass} px-2 py-1 rounded-pill fw-medium fs-12">
                                                ${dept}
                                            </span>`
                                        );
                                    }
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
                                search: {
                                    placeholder: 'ค้นหา...'
                                },
                                pagination: {
                                    previous: 'ก่อนหน้า',
                                    next: 'ถัดไป',
                                    showing: 'แสดง',
                                    results: () => 'รายการ'
                                },
                                noRecordsFound: 'ไม่พบรายชื่อผู้ใช้งาน'
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
