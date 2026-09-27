import FallbackLoading from '@/components/FallbackLoading';
import LogoBox from '@/components/LogoBox';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import SimpleBar from 'simplebar-react';
import { getMenuItems } from '@/helpers/menu';

import { useLayoutContext } from '@/context/useLayoutContext';
import { lazy, Suspense, useMemo } from 'react';
import HoverMenuToggle from './components/HoverMenuToggle';
import { usePage } from '@inertiajs/react';
import hosinfoLogo from '@/images/HOS-info-logo.png';

const AppMenu = lazy(() => import('./components/AppMenu'));

const VerticalNavigationBar = () => {
    const { toggleBackdrop } = useLayoutContext();
    const { wards } = usePage<any>().props;
    
    const menuItems = useMemo(() => {
        const baseMenu = JSON.parse(JSON.stringify(getMenuItems()));
        const statsMenu = baseMenu.find((m: any) => m.key === 'stats');
        return baseMenu;
    }, []);

    return (
        <div className="sidenav-menu" id="leftside-menu-container">
            <LogoBox />
            <HoverMenuToggle />
            <button onClick={toggleBackdrop} className="button-close-fullsidebar">
                <span>
                    <IconifyIcon icon="tabler:x" className="align-middle" />
                </span>
            </button>
            <SimpleBar>
                <Suspense fallback={<FallbackLoading />}>
                    <AppMenu menuItems={menuItems} />
                    <div className="help-box text-center">
                        {/* <img src={hosinfoLogo} height={90} alt="Logo" style={{ objectFit: 'contain', maxWidth: '80%' }} /> */}
                        <h5 className="mt-1 fw-semibold fs-16"> Graduate Studies </h5>
                        <p className="mb-1 text-muted">Version 1.0</p>
                    </div>
                    <div className="clearfix" />
                </Suspense>
            </SimpleBar>
        </div>
    );
};

export default VerticalNavigationBar;
