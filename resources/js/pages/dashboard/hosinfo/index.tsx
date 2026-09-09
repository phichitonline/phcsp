import small1Img from '@/images/small/small-22.jpg';
import small4Img from '@/images/small/small-21.jpg';
import MainLayout from '@/layouts/MainLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useState } from 'react';
import { Col, Row, Card, CardBody, CardTitle } from 'react-bootstrap';
import WebboardSection from './components/WebboardSection';

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


const HosinfoDashboardPage = () => {
    const { hospital, stats, statsTitle, webboardPosts } = usePage().props as any;

    return (
        <MainLayout>
            <Head title={'หน้าหลัก'} />

            <Row className="mt-3 mb-3">
                <Col xs={12}>
                    <div className="page-title-box d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div className="d-flex align-items-center">
                            <h4 className="page-title mb-0 me-2 text-dark fw-bold fs-24">{hospital?.name || 'Demo'}</h4>

                        </div>
                        <div className="d-flex align-items-center text-muted fw-medium fs-14 bg-white px-3 py-2 rounded-pill shadow-sm border">
                            <IconifyIcon icon="solar:calendar-bold-duotone" className="me-2 text-primary fs-18" />
                            <span>
                                {new Date().toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'long'
                                })}
                            </span>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col xs={12}>
                    <div className="d-flex flex-column flex-lg-row gap-3 justify-content-center align-items-center w-100">
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
                            subtitle="ติดต่อผู้พัฒนา" 
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

            {/* กระดานข่าวถามตอบ & แจ้งปัญหา (Q&A Webboard) */}
            <Row className="mt-0 mb-0">
                <Col xs={12}>
                    <WebboardSection posts={webboardPosts || []} />
                </Col>
            </Row>
        </MainLayout>
    );
};

export default HosinfoDashboardPage;
