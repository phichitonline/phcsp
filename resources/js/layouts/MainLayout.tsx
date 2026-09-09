import { useLayoutContext } from '@/context/useLayoutContext';
import HorizontalLayout from '@/layouts/HorizontalLayout';
import VerticalLayout from '@/layouts/VerticalLayout';
import { ChildrenType } from '@/types/component-props';

const MainLayout = ({ children }: ChildrenType) => {
    const { layoutOrientation } = useLayoutContext();

    return (
        <>
            {layoutOrientation === 'vertical' && <VerticalLayout>{children}</VerticalLayout>}
            {layoutOrientation === 'horizontal' && <HorizontalLayout>{children}</HorizontalLayout>}
        </>
    );
};

export default MainLayout;
