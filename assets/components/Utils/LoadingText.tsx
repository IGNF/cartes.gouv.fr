import { memo, ReactNode } from "react";

import LoadingIcon from "./LoadingIcon";

type LoadingTextProps = {
    message?: ReactNode;
    as?: `h${1 | 2 | 3 | 4 | 5 | 6}` | "p";
    withSpinnerIcon?: boolean;
    className?: string;
};

const LoadingText = ({ message, className = "", as: HtmlTag = "h1", withSpinnerIcon = false }: LoadingTextProps) => {
    return (
        <HtmlTag className={className}>
            {message ? message : "Chargement..."} {withSpinnerIcon && <LoadingIcon largeIcon={HtmlTag !== "p"} />}
        </HtmlTag>
    );
};

export default memo(LoadingText);
