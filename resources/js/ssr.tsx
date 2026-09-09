import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { type RouteName, route } from 'ziggy-js';

createServer((page) => {
    const envAppName = import.meta.env.VITE_APP_NAME;
    const appName = (envAppName && envAppName !== 'undefined' && envAppName !== '${APP_NAME}') 
        ? envAppName 
        : (page.props.name as string || 'HOS-info');

    return createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title && title !== 'undefined' ? `${title} | ${appName}` : appName),
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
        setup: ({ App, props }) => {
            /* eslint-disable */
            // @ts-expect-error
            global.route<RouteName> = (name, params, absolute) =>
                route(name, params as any, absolute, {
                    // @ts-expect-error
                    ...page.props.ziggy,
                    // @ts-expect-error
                    location: new URL(page.props.ziggy.location),
                });
            /* eslint-enable */

            return <App {...props} />;
        },
    });
});
