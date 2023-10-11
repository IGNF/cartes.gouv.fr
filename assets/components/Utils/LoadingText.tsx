import { ReactNode } from "react";

type LoadingTextProps = {
    message?: ReactNode;
    as?: `h${1 | 2 | 3 | 4 | 5 | 6}` | "p";
};

const LoadingText = ({ message, as: HtmlTag = "h1" }: LoadingTextProps) => {
    return <HtmlTag>{message ? message : "Chargement..."}</HtmlTag>;
};

export default LoadingText;
