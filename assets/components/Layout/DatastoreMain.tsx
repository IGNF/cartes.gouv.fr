import { useHead } from "@unhead/react";
import { PropsWithChildren } from "react";

/** contenu d’une page rendue dans le panneau des entrepôts (DatastorePanelMain) : titre du document */
export default function DatastoreMain({ children, title }: PropsWithChildren<{ title?: string }>) {
    useHead({
        titleTemplate: "%s | cartes.gouv.fr",
        title: title,
    });

    return children;
}
