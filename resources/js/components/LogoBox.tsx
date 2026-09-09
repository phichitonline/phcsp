import logoDark from '@/images/logo-dark.png';
import logoSm from '@/images/logo-sm.png';
import logo from '@/images/logo.png';

import { Link } from '@inertiajs/react';

const LogoBox = () => {
    return (
        <Link href="/" className="logo">
            <span className="logo-light">
                <span className="logo-lg">
                    <img src={logo} style={{ width: '80%', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} alt="logo" />
                </span>
                <span className="logo-sm">
                    <img src={logoSm} style={{ width: '80%', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} alt="small logo" />
                </span>
            </span>
            <span className="logo-dark">
                <span className="logo-lg">
                    <img src={logoDark} style={{ width: '80%', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} alt="dark logo" />
                </span>
                <span className="logo-sm">
                    <img src={logoSm} style={{ width: '80%', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} alt="small logo" />
                </span>
            </span>
        </Link>
    );
};

export default LogoBox;
