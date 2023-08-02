import { FC } from "react";

type TextWithLinkProps = {
    text: string;
    linkText: string;
    linkHref: string;
};
const TextWithLink: FC<TextWithLinkProps> = ({ text, linkText, linkHref }) => {
    return (
        <>
            {text}&nbsp;
            <a href={linkHref} target="_blank" title={linkText + " - ouvre une nouvelle fenêtre"} rel="noreferrer">
                {linkText}
            </a>
        </>
    );
};

export default TextWithLink;
