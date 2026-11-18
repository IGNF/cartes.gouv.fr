import { useHead } from "@unhead/react";
import { PropsWithChildren } from "react";

/** contenu d’une page rendue dans un SidePanelMain : titre du document */
export default function SidePanelPage({ children, title }: PropsWithChildren<{ title?: string }>) {
    useHead({
        titleTemplate: "%s | cartes.gouv.fr",
        title: title,
    });

    return children;
}
