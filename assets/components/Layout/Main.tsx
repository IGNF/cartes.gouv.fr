import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb, BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { useHead } from "@unhead/react";
import { PropsWithChildren, ReactNode, memo } from "react";
import { useStyles } from "tss-react";

import { IUseAlert } from "@/hooks/useAlert";
import useBreadcrumb from "@/hooks/useBreadcrumb";
import SessionExpiredAlert from "../Utils/SessionExpiredAlert";

export interface MainProps {
    customBreadcrumbProps?: BreadcrumbProps;
    noticeProps?: IUseAlert;
    title?: string;
    classes?: Partial<Record<"container", string>>;
    /** trait sous le fil d’Ariane, à la largeur du conteneur */
    breadcrumbSeparator?: boolean;
    /** contenu pleine largeur sous le conteneur (ex : fond coloré des onglets) */
    fullWidthContent?: ReactNode;
}

function Main(props: PropsWithChildren<MainProps>) {
    const { children, customBreadcrumbProps, noticeProps, title, classes, breadcrumbSeparator, fullWidthContent } = props;

    useHead({
        titleTemplate: "%s | cartes.gouv.fr",
        title: title,
    });
    const breadcrumbProps = useBreadcrumb(customBreadcrumbProps);

    const { css } = useStyles();
    const breadcrumb = breadcrumbProps && (
        <Breadcrumb
            {...breadcrumbProps}
            classes={{
                root: breadcrumbSeparator
                    ? css({
                          margin: 0,
                          marginBottom: fr.spacing("10v"),
                          padding: `${fr.spacing("3w")} 0`,
                          borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                      })
                    : undefined,
            }}
        />
    );

    return (
        <main id="main" role="main">
            {/* doit être le premier élément atteignable après le lien d'évitement (Accessibilité) : https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/bandeau-d-information-importante */}
            {noticeProps && <Notice isClosable {...noticeProps} />}

            <div className={classes?.container ?? fr.cx("fr-container")}>
                {breadcrumb}

                <SessionExpiredAlert />

                {children}
            </div>
            {fullWidthContent}
        </main>
    );
}

export default memo(Main);
