import { AlertProps } from "@codegouvfr/react-dsfr/Alert";

export interface INewAlert {
    title: string;
    description?: string;
    link: { url?: string; label?: string };
    severity: AlertProps["severity"];
    details: string;
    date: Date;
    visibility: {
        homepage: boolean;
        contact: boolean;
        map: boolean;
        serviceLevel: boolean;
    };
}

export interface IAlert extends INewAlert {
    id: string;
}
