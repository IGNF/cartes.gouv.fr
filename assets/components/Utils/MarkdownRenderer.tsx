import { FC, HTMLAttributes } from "react";
import { symToStr } from "tsafe/symToStr";
import markdownit from "markdown-it";

import "../../sass/components/tiptap.scss";

const md = markdownit({
    breaks: true,
    html: false,
    linkify: true,
    quotes: ["«\xA0", "\xA0»", "‹\xA0", "\xA0›"],
    typographer: true,
});
// markdown-it 15 ne relie plus par défaut les adresses sans protocole
md.linkify.set({ fuzzyLink: true });

export const renderMarkdown = (content: string): string => md.render(content);

interface MarkdownRendererProps extends HTMLAttributes<HTMLDivElement> {
    content: string;
}

const MarkdownRenderer: FC<MarkdownRendererProps> = (props) => {
    const { className, content, ...rest } = props;
    const result = renderMarkdown(content);
    const classNames = ["fr-tiptap"];
    if (className) {
        classNames.push(className);
    }
    return <div {...rest} className={classNames.join(" ")} dangerouslySetInnerHTML={{ __html: result }} />;
};
MarkdownRenderer.displayName = symToStr({ MarkdownRenderer });

export default MarkdownRenderer;
