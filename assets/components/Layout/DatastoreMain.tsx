import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { useHead } from "@unhead/react";
import { PropsWithChildren } from "react";

import { type MainProps } from "./Main";

export type DatastoreMainProps = PropsWithChildren<
    Pick<MainProps, "noticeProps" | "title"> & {
        datastoreId?: string;
        communityId?: string;
    }
>;

/** contenu d’une page rendue dans le panneau des entrepôts (DatastorePanelMain) : titre du document et notice */
export default function DatastoreMain({ children, noticeProps, title }: DatastoreMainProps) {
    useHead({
        titleTemplate: "%s | cartes.gouv.fr",
        title: title,
    });

    return (
        <>
            {noticeProps && <Notice isClosable {...noticeProps} />}
            {children}
        </>
    );
}
