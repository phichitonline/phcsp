import { useLayoutContext } from '@/context/useLayoutContext';
import { useEffect } from 'react';

const Page = () => {
    const { changeLayoutOrientation } = useLayoutContext();
    useEffect(() => {
        changeLayoutOrientation('horizontal');

        return () => changeLayoutOrientation('vertical');
    }, []);
    return <Dashboard />;
};

export default Page;
