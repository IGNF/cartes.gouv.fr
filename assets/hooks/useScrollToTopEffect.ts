import { useEffect } from "react";

const useScrollToTopEffect = (dep: unknown, delay: number = 300) =>
    useEffect(() => {
        const timeout = setTimeout(() => {
            window?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }, delay);

        return () => {
            clearTimeout(timeout);
        };
    }, [delay, dep]);

export default useScrollToTopEffect;
