import { useRef, useEffect } from "react";

const useDocumentTitle = (documentTitle?: string) => {
    const siteTitle = useRef<string>(document.getElementById("root")?.dataset?.siteTitle ?? "cartes.gouv.fr");

    useEffect(() => {
        document.title = documentTitle ? `${documentTitle} | ${siteTitle.current}` : siteTitle.current;
    }, [documentTitle]);

    useEffect(
        () => () => {
            document.title = siteTitle.current;
        },
        []
    );
};

export default useDocumentTitle;
