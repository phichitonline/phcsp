import IconifyIcon from '@/components/wrappers/IconifyIcon';
import logoDark from '@/images/logo-dark.png';
import logo from '@/images/logo.png';
import providerIdIcon from '@/images/providerid-icon.webp';
import thaidLogo from '@/images/thaid-logo.svg';
import bg1 from '@/images/small/small-1.jpg';
import bg2 from '@/images/small/small-2.jpg';
import bg3 from '@/images/small/small-3.jpg';
import BaseLayout from '@/layouts/BaseLayout';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Button, Card, Col, FormCheck, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';

import { currentYear, developedBy } from '@/context/constants';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

const bgImages = [bg1, bg2, bg3];

const IconLink = ({ 
    icon, 
    title, 
    subtitle, 
    href, 
    color,
    hasExternalIcon
}: { 
    icon: string; 
    title: string; 
    subtitle: string; 
    href: string;
    color: string;
    hasExternalIcon?: boolean;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <Link 
            href={href} 
            className="text-decoration-none d-flex align-items-center bg-white" 
            style={{ 
                padding: '14px 20px', 
                borderRadius: '16px', 
                width: '100%',
                maxWidth: '360px',
                transition: 'all 0.3s ease',
                border: isHovered ? `2px solid ${color}` : '2px solid transparent',
                boxShadow: isHovered ? `0 10px 25px -5px ${color}40` : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transform: isHovered ? 'translateY(-3px)' : 'none',
                cursor: 'pointer'
            }} 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className="d-flex justify-content-center align-items-center text-white me-3" 
                style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '16px',
                    backgroundColor: color,
                    flexShrink: 0
                }}
            >
                <IconifyIcon icon={icon} width="32" height="32" />
            </div>
            <div className="flex-grow-1 text-start">
                <div className="fw-bold fs-18 mb-1" style={{ color: isHovered ? color : '#4b5563', transition: 'color 0.3s ease' }}>{title}</div>
                <div className="fs-14 text-muted">{subtitle}</div>
            </div>
            {hasExternalIcon && (
                <div className="ms-2 text-muted" style={{ opacity: 0.5 }}>
                    <IconifyIcon icon="ph:arrow-square-out" width="24" height="24" />
                </div>
            )}
        </Link>
    );
};

const LoginPage = ({ canResetPassword }: LoginProps) => {
    const { name } = usePage().props as { name?: string };
    const envAppName = import.meta.env.VITE_APP_NAME;
    const appName = (envAppName && envAppName !== 'undefined' && envAppName !== '${APP_NAME}') 
        ? envAppName 
        : (name || 'HOS-info');

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: true,
    });

    const [bgIndex, setBgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % bgImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <BaseLayout>
            <Head title="Login" />
            <div className="auth-bg min-vh-100 w-100 overflow-hidden position-relative">
                {/* Background Slider */}
                {bgImages.map((img, idx) => (
                    <div 
                        key={idx}
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            backgroundImage: `url(${img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: bgIndex === idx ? 1 : 0,
                            transition: 'opacity 1.5s ease-in-out',
                            zIndex: 0
                        }}
                    />
                ))}
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-25" style={{ zIndex: 0 }} />

                <Row className="g-0 min-vh-100 position-relative z-1">
                    {/* Left Column: Floating Login Card */}
                    <Col lg={5} md={8} xs={12} className="d-flex flex-column justify-content-center p-0 p-md-4 mx-auto ms-lg-5">
                        <style>{`
                            @media (max-width: 767.98px) {
                                .mobile-fullscreen-card {
                                    max-width: 100% !important;
                                    min-height: 100vh !important;
                                    border-radius: 0 !important;
                                    background-color: rgba(255, 255, 255, 0.98) !important;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                }
                            }
                        `}</style>
                        <Card className="w-100 border-0 shadow-lg rounded-4 overflow-hidden mobile-fullscreen-card" style={{ maxWidth: '450px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
                            <div className="p-4 p-xxl-5 d-flex flex-column justify-content-center">
                                <div className="text-center mb-4 mt-auto">
                                    <Link href="/" className="auth-brand">
                                        <img src={logoDark} style={{ width: '80%', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} alt="dark logo" className="logo-dark" />
                                        <img src={logo} style={{ width: '80%', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} alt="logo light" className="logo-light" />
                                    </Link>
                                </div>
                                <h3 className="fw-semibold mb-2 text-center">เข้าสู่ระบบ</h3>
                                
                                <div className="d-grid gap-2 mb-1">
                                    <Button
                                        as="a"
                                        href={route('thaid.redirect')}
                                        variant="outline-primary"
                                        className="d-flex justify-content-center align-items-center gap-2 mt-2 py-2 border-2 shadow-sm"
                                        style={{ borderColor: '#1a469d', color: '#10337a' }}
                                    >
                                        <img src={thaidLogo} width="70" height="28" alt="ThaiD" style={{ borderRadius: '4px', objectFit: 'contain' }} />
                                        <span className="fw-semibold">เข้าสู่ระบบด้วย ThaiD</span>
                                    </Button>

                                    {/* <Button
                                        as="a"
                                        href={route('moph.redirect')}
                                        variant="outline-success"
                                        className="d-flex justify-content-center align-items-center gap-2 py-2 border-2 shadow-sm"
                                    >
                                        <img src={providerIdIcon} width="70" height="28" alt="ProviderID" style={{ borderRadius: '4px', objectFit: 'contain' }} />
                                        <span className="fw-semibold">เข้าสู่ระบบด้วย ProviderID</span>
                                    </Button> */}
                                </div>

                                <div className="d-flex align-items-center my-2">
                                    <hr className="flex-grow-1 m-0" />
                                    <span className="mx-3 text-muted fs-13 fw-semibold">หรือเข้าสู่ระบบด้วยอีเมล</span>
                                    <hr className="flex-grow-1 m-0" />
                                </div>

                                <form onSubmit={submit} className="text-start mb-0">
                                    <FormGroup className="mb-2">
                                        <FormLabel>อีเมล</FormLabel>
                                        <FormControl
                                            type="email"
                                            placeholder="กรุณากรอกอีเมล"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        {errors.email && <p className="text-danger">{errors.email}</p>}
                                    </FormGroup>

                                    <FormGroup className="mb-2">
                                        <FormLabel>รหัสผ่าน</FormLabel>
                                        <FormControl
                                            type="password"
                                            placeholder="กรุณากรอกรหัสผ่าน"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        {errors.password && <p className="text-danger">{errors.password}</p>}
                                    </FormGroup>

                                    <div className="d-flex justify-content-between mb-2">
                                        <FormCheck checked={data.remember} onChange={() => setData('remember', !data.remember)} label="จำฉันไว้" />
                                    </div>
                                    
                                    <div className="d-grid">
                                        <Button variant="primary" type="submit" disabled={processing} className="py-2">
                                            Login เข้าใช้งาน
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-auto pt-4 text-center">
                                    <p className="mb-0 text-muted fs-13">
                                        {currentYear} © {appName} - By{' '}
                                        <span className="fw-bold text-decoration-underline text-reset">Dr.GHOST</span>
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    
                    {/* Right Column: Menu Icons */}
                    <Col lg={5} xs={12} className="d-flex flex-column justify-content-center align-items-center ms-lg-auto me-lg-5 mt-4 mt-lg-0 pb-5 pb-lg-0 z-1">
                        <div className="d-flex flex-column gap-3 w-100 align-items-center px-3 px-lg-0">
                            <IconLink 
                                icon="ph:megaphone-fill" 
                                title="ประกาศ" 
                                subtitle="ข่าวสารและอัปเดต" 
                                href="/pages/about" 
                                color="#f59e0b" 
                            />
                            <IconLink 
                                icon="ph:users-fill" 
                                title="ผู้พัฒนา" 
                                subtitle="ติดต่อผู้พัฒนา HOS-info" 
                                href="/pages/contact-us" 
                                color="#6385e6" 
                            />
                            <IconLink 
                                icon="ph:book-open-fill" 
                                title="คู่มือ" 
                                subtitle="เอกสารแนะนำการใช้งาน" 
                                href="/pages/support" 
                                color="#5db486" 
                                hasExternalIcon
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        </BaseLayout>
    );
};

export default LoginPage;
