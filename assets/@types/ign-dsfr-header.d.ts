export {};

declare module "ign-dsfr-header/dist/ign-dsfr-header.js" {
    const noop: unknown;
    export default noop;
}

declare module "ign-dsfr-header/dist/ign-dsfr-header" {
    const noop: unknown;
    export default noop;
}

declare global {
    interface IgnDsfrHeaderMenuLinkItem {
        label: string;
        href: string;
        icon?: string;
    }

    interface IgnDsfrHeaderMenuItem {
        label: string;
        icon?: string;
        connectionMenu?: boolean;
        links?: IgnDsfrHeaderMenuLinkItem[];
    }

    interface IgnDsfrHeaderElement extends HTMLElement {
        minimized: boolean;
        menuItems: IgnDsfrHeaderMenuItem[];
    }

    namespace JSX {
        interface IntrinsicElements {
            "ign-dsfr-header": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                minimized?: boolean;
            };
        }
    }
}
