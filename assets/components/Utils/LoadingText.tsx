import { ReactNode } from "react";

type LoadingTextProps = {
    message?: ReactNode;
};

const LoadingText = ({ message }: LoadingTextProps) => {
    return <h1>{message ? message : "Chargement..."}</h1>;
};

export default LoadingText;
