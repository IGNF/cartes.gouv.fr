import { DependencyList, useEffect } from "react";

const useScrollToTopEffect = (deps: DependencyList = [], delay: number = 300) =>
    useEffect(() => {
        const timeout = setTimeout(() => {
            window?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }, delay);

        return () => {
            clearTimeout(timeout);
        };
    }, [delay, deps]);

export default useScrollToTopEffect;
