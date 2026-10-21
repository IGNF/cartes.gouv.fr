import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { useHead } from "@unhead/react";
import { ReactNode, memo } from "react";
import { useStyles } from "tss-react";

import useBreadcrumb from "@/hooks/useBreadcrumb";
import SessionExpiredAlert from "../../Utils/SessionExpiredAlert";
import { MainProps } from "../Main";

export type DatasheetMainProps = MainProps & {
    header: ReactNode;
    content: ReactNode;
};

function DatasheetMain(props: DatasheetMainProps) {
    const { header, content, customBreadcrumbProps, noticeProps, title } = props;

    useHead({
        titleTemplate: "%s | cartes.gouv.fr",
        title: title,
    });
    const breadcrumbProps = useBreadcrumb(customBreadcrumbProps);

    const { css } = useStyles();

    return (
        <main id="main" role="main">
            {/* doit être le premier élément atteignable après le lien d'évitement (Accessibilité) : https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/bandeau-d-information-importante */}
            {noticeProps && <Notice isClosable {...noticeProps} />}

            <div className={fr.cx("fr-container--fluid")}>
                <div className={fr.cx("fr-container")}>
                    {breadcrumbProps && (
                        <Breadcrumb
                            {...breadcrumbProps}
                            classes={{
                                root: css({
                                    margin: "0",
                                    marginBottom: fr.spacing("10v"),
                                    padding: "1.5rem 0",
                                    borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                                }),
                            }}
                        />
                    )}

                    <SessionExpiredAlert />

                    {header}
                </div>

                {content}
            </div>
        </main>
    );
}

export default memo(DatasheetMain);
