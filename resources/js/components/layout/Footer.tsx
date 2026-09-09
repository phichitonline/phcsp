import { currentYear } from '@/context/constants';
import { Link, usePage } from '@inertiajs/react';
import { Col, Row } from 'react-bootstrap';

const Footer = () => {
    const { name } = usePage().props as { name?: string };
    const envAppName = import.meta.env.VITE_APP_NAME;
    const appName = (envAppName && envAppName !== 'undefined' && envAppName !== '${APP_NAME}') 
        ? envAppName 
        : (name || 'HOS-info');

    return (
        <footer className="footer">
            <div className="page-container">
                <Row>
                    <Col md={6} className="text-center text-md-start">
                        {currentYear} © {appName} - By{' '}
                        <span className="fw-bold text-decoration-underline text-reset fs-12">Dr.GHOST</span>
                    </Col>
                    <Col md={6}>
                        <div className="text-md-end footer-links d-none d-md-block">
                            <Link href="/pages/about">About</Link>
                            <Link href="/pages/support">Support</Link>
                            <Link href="/pages/contact-us">Contact Us</Link>
                        </div>
                    </Col>
                </Row>
            </div>
        </footer>
    );
};

export default Footer;
