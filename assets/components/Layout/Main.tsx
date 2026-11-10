import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb, BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { useHead } from "@unhead/react";
import { PropsWithChildren, memo } from "react";

import { IUseAlert } from "@/hooks/useAlert";
import useBreadcrumb from "@/hooks/useBreadcrumb";
import SessionExpiredAlert from "../Utils/SessionExpiredAlert";

export interface MainProps {
    customBreadcrumbProps?: BreadcrumbProps;
    noticeProps?: IUseAlert;
    title?: string;
    classes?: Partial<Record<"container", string>>;
    /** séparateur sous le fil d’Ariane : à la largeur du conteneur ou de la page */
    breadcrumbSeparator?: "container" | "fullWidth";
}

function Main(props: PropsWithChildren<MainProps>) {
    const { children, customBreadcrumbProps, noticeProps, title, classes, breadcrumbSeparator } = props;

    useHead({
        titleTemplate: "%s | cartes.gouv.fr",
        title: title,
    });
    const breadcrumbProps = useBreadcrumb(customBreadcrumbProps);

    const container = classes?.container ?? fr.cx("fr-container");
    // avec séparateur, 24 px au-dessus et au-dessous du fil d’Ariane comme la maquette
    const breadcrumb = breadcrumbProps && <Breadcrumb {...breadcrumbProps} className={fr.cx(breadcrumbSeparator && "fr-my-3w")} />;
    // la ligne de fr-hr est un fond : il lui faut une hauteur non nulle
    const separator = <hr className={fr.cx("fr-hr", "fr-pb-1v")} />;

    return (
        <main id="main" role="main">
            {/* doit être le premier élément atteignable après le lien d'évitement (Accessibilité) : https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/bandeau-d-information-importante */}
            {noticeProps && <Notice isClosable {...noticeProps} />}

            {breadcrumbSeparator === "fullWidth" && (
                <>
                    <div className={container}>{breadcrumb}</div>
                    {separator}
                </>
            )}
            <div className={container}>
                {breadcrumbSeparator !== "fullWidth" && breadcrumb}
                {breadcrumbSeparator === "container" && separator}

                <SessionExpiredAlert />

                {children}
            </div>
        </main>
    );
}

export default memo(Main);
