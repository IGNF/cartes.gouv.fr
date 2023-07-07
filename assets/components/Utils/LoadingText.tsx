import { ReactNode } from "react";

type LoadingTextProps = {
    message?: ReactNode;
};

const LoadingText = ({ message }: LoadingTextProps) => {
    return <h2>{message ? message : "Chargement..."}</h2>;
};

export default LoadingText;
