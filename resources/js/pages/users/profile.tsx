import React, { useRef } from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, CardTitle, Col, Row, Button, Badge } from 'react-bootstrap';
import { Link, router } from '@inertiajs/react';
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
    created_at: string;
}

interface Props {
    user: User;
}

const ProfilePage = ({ user }: Props) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = React.useState(false);

    const avatarUrl = user.avatar ? `/storage/${user.avatar}` : avatar1;

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        router.post(route('users.avatar'), { avatar: file }, {
            forceFormData: true,
            onFinish: () => setUploading(false),
        });
    };

    return (
        <MainLayout>
            <PageTitle title="ข้อมูลส่วนตัว" subTitle="ผู้ใช้งาน" />
            
            <Row>
                <Col xl={4} lg={12}>
                    {/* Profile Summary Card */}
                    <Card>
                        <CardBody>
                            <div className="dr-profile-bg rounded-top position-relative mx-n3 mt-n3" style={{ height: '100px', backgroundColor: '#4a6cf7' }}>
                                <div 
                                    className="position-absolute top-100 start-50 translate-middle" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={handleAvatarClick}
                                    title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
                                >
                                    <img
                                        src={avatarUrl}
                                        alt="avatar"
                                        className="border border-light border-3 rounded-circle"
                                        height={100}
                                        width={100}
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div 
                                        className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                                        style={{ width: '30px', height: '30px' }}
                                    >
                                        <IconifyIcon icon="tabler:camera" className="fs-14" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="d-none"
                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="mt-4 mb-2 pt-3 text-center">
                                <p className="mb-1 fs-18 fw-semibold text-dark">{user.name}</p>
                                <p className="mb-0 fw-medium text-muted">บทบาท: {user.role.toUpperCase()}</p>
                                {uploading && <p className="text-primary small mt-1"><IconifyIcon icon="svg-spinners:180-ring-with-halves" className="me-1" />กำลังอัปโหลด...</p>}
                            </div>
                            
                            <hr className="my-3 border-dashed" />
                            
                            <CardTitle as={'h5'} className="fw-semibold">เกี่ยวกับผู้ใช้ :</CardTitle>
                            <p className="mt-2 text-muted">
                                ยินดีต้อนรับสู่ระบบ HOS-info ข้อมูลของคุณจะถูกใช้เพื่อกำหนดสิทธิ์การเข้าถึงเมนูและรายงานต่างๆ ตามบทบาทที่ได้รับมอบหมาย
                            </p>
                            
                            <div className="mt-4">
                                <h6 className="fw-semibold mb-2">สิทธิ์การเข้าถึง :</h6>
                                <div className="d-flex flex-wrap gap-1">
                                    <Badge bg="soft-primary" className="text-primary rounded-pill px-2 py-1">ดูตัวชี้วัด</Badge>
                                    <Badge bg="soft-success" className="text-success rounded-pill px-2 py-1">ดูรายงาน</Badge>
                                    {user.role === 'admin' && (
                                        <Badge bg="soft-danger" className="text-danger rounded-pill px-2 py-1">จัดการระบบ</Badge>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                        <Card.Footer className="bg-light-subtle d-flex gap-2">
                            <Link href={route('users.edit', user.id)} className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-1">
                                <IconifyIcon icon="tabler:edit" className="fs-18" /> แก้ไขรหัสผ่าน
                            </Link>
                        </Card.Footer>
                    </Card>
                </Col>

                <Col xl={8} lg={12}>
                    {/* Detailed Information Card */}
                    <Card>
                        <CardBody>
                            <CardTitle as={'h4'} className="mb-3">ข้อมูลพื้นฐาน (Personal Information) :</CardTitle>
                            <div className="table-responsive border border-dashed rounded px-3 py-2 bg-light-subtle">
                                <table className="table table-borderless m-0">
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '200px' }}>
                                                <p className="mb-0 text-muted"> ชื่อ-นามสกุล : </p>
                                            </td>
                                            <td className="px-2 text-dark fw-medium fs-15">{user.name}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p className="mb-0 text-muted"> อีเมล : </p>
                                            </td>
                                            <td className="px-2 text-dark fw-medium fs-15">{user.email}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p className="mb-0 text-muted"> หน่วยงาน/แผนก : </p>
                                            </td>
                                            <td className="px-2 text-dark fw-medium fs-15">
                                                {user.department?.dp_name || 'ไม่ระบุ'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p className="mb-0 text-muted"> บทบาทหน้าที่ : </p>
                                            </td>
                                            <td className="px-2">
                                                <Badge bg={user.role === 'admin' ? 'danger' : 'info'} className="fs-12">
                                                    {user.role.toUpperCase()}
                                                </Badge>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p className="mb-0 text-muted"> วันที่ลงทะเบียน : </p>
                                            </td>
                                            <td className="px-2 text-dark fw-medium fs-15">
                                                {new Date(user.created_at).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <CardTitle as={'h4'} className="mt-4 mb-3">ทักษะและความสามารถ (Abilities) :</CardTitle>
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="p-3 border rounded bg-white shadow-sm">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar-md bg-soft-primary text-primary rounded d-flex align-items-center justify-content-center">
                                                <IconifyIcon icon="tabler:chart-bar" className="fs-24" />
                                            </div>
                                            <div>
                                                <h6 className="mb-1 fw-bold">KPI Management</h6>
                                                <p className="mb-0 text-muted small">การจัดการตัวชี้วัด</p>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 border rounded bg-white shadow-sm">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar-md bg-soft-success text-success rounded d-flex align-items-center justify-content-center">
                                                <IconifyIcon icon="tabler:file-report" className="fs-24" />
                                            </div>
                                            <div>
                                                <h6 className="mb-1 fw-bold">Report Analysis</h6>
                                                <p className="mb-0 text-muted small">การวิเคราะห์รายงาน</p>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <div className="mt-4 p-3 bg-light rounded border border-info border-start-4">
                                <div className="d-flex gap-2">
                                    <IconifyIcon icon="tabler:info-circle" className="text-info fs-20 mt-1" />
                                    <div>
                                        <h6 className="fw-bold mb-1">หมายเหตุระบบ</h6>
                                        <p className="mb-0 small text-muted">
                                            หากข้อมูลหน่วยงานหรือบทบาทไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบเพื่อดำเนินการแก้ไข
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default ProfilePage;
