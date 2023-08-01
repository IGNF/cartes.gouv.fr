import { useRef, useEffect } from "react";

const useDocumentTitle = (title: string, prevailOnUnmount: boolean = false) => {
    const defaultTitle = useRef(document.title);

    useEffect(() => {
        document.title = title;
    }, [title]);

    useEffect(
        () => () => {
            if (!prevailOnUnmount) {
                document.title = defaultTitle.current;
            }
        },
        [prevailOnUnmount]
    );
};

export default useDocumentTitle;
