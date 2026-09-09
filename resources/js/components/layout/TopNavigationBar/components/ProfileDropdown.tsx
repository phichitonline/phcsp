import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { currency } from '@/context/constants';
import avatar1 from '@/images/users/avatar-2.jpg';
import { SharedData } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';

const ProfileDropdown = () => {
    const { post } = useForm();
    const { auth } = usePage<SharedData>().props;

    const handleLogout = () => {
        post(route('logout'));
    };

    const userName = auth.user?.name ?? 'Guest';
    const userRole = auth.user?.role ?? 'ผู้เยี่ยมชม';
    const userAvatar = (auth.user as any)?.avatar ? `/storage/${(auth.user as any).avatar}` : avatar1;

    return (
        <div className="topbar-item nav-user">
            <Dropdown align={'end'}>
                <DropdownToggle
                    as={'a'}
                    className="topbar-link drop-arrow-none px-2"
                    data-bs-toggle="dropdown"
                    data-bs-offset="0,19"
                    type="button"
                    aria-haspopup="false"
                    aria-expanded="false"
                >
                    <img src={userAvatar} width={32} height={32} className="rounded-circle me-lg-2 d-flex" style={{ objectFit: 'cover' }} alt="user-image" />
                    <span className="d-lg-flex flex-column gap-1 d-none">
                        <h5 className="my-0">{userName}</h5>
                        <h6 className="my-0 fw-normal">{auth.user ? `บทบาท: ${userRole}` : userRole}</h6>
                    </span>
                    <IconifyIcon icon="tabler:chevron-down" className="d-none d-lg-block align-middle ms-2" />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                    <DropdownHeader className="noti-title">
                        <h6 className="text-overflow m-0">ยินดีต้อนรับ !</h6>
                    </DropdownHeader>
                    
                    {auth.user ? (
                        <>
                            <DropdownItem as={Link} href={route('users.profile')}>
                                <IconifyIcon icon="tabler:user-hexagon" className="me-1 fs-17 align-middle" />
                                <span className="align-middle">บัญชีของฉัน</span>
                            </DropdownItem>
                            <DropdownItem as={Link} href={route('users.edit', auth.user.id)}>
                                <IconifyIcon icon="tabler:lock" className="me-1 fs-17 align-middle" />
                                <span className="align-middle">เปลี่ยนรหัสผ่าน</span>
                            </DropdownItem>
                            {/* <DropdownItem>
                                <IconifyIcon icon="tabler:settings" className="me-1 fs-17 align-middle" />
                                <span className="align-middle">ตั้งค่า</span>
                            </DropdownItem> */}
                            <div className="dropdown-divider" />
                            <DropdownItem className="active fw-semibold text-danger" onClick={handleLogout}>
                                <IconifyIcon icon="tabler:logout" className="me-1 fs-17 align-middle" />
                                <span className="align-middle">ออกจากระบบ</span>
                            </DropdownItem>
                        </>
                    ) : (
                        <DropdownItem as={Link} href={route('login')} className="fw-semibold text-primary">
                            <IconifyIcon icon="tabler:login" className="me-1 fs-17 align-middle" />
                            <span className="align-middle">ลงชื่อเข้าใช้งาน</span>
                        </DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>
        </div>
    );
};

export default ProfileDropdown;
