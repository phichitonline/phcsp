import '@/scss/app.scss';

import AppProvidersWrapper from '@/components/wrappers/AppProvidersWrapper';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

let appName = 'HOS-info';

createInertiaApp({
    title: (title) => (title && title !== 'undefined' ? `${title} | ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const envAppName = import.meta.env.VITE_APP_NAME;
        appName = (envAppName && envAppName !== 'undefined' && envAppName !== '${APP_NAME}') 
            ? envAppName 
            : (props.initialPage.props.name as string || (typeof window !== 'undefined' ? window.document.title : 'HOS-info'));

        const root = createRoot(el);

        root.render(
            <AppProvidersWrapper>
                <App {...props} />
            </AppProvidersWrapper>,
        );
    },
});
