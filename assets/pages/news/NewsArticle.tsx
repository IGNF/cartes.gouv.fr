import { fr } from "@codegouvfr/react-dsfr";
import { useColors } from "@codegouvfr/react-dsfr/useColors";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { FC } from "react";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";
import articles from "../../data/actualites.json";
import functions from "../../functions";
import { type NewsArticle } from "../../types/newsArticle";

type NewsArticleProps = {
    slug: string;
};

const NewsArticle: FC<NewsArticleProps> = ({ slug }) => {
    const newsArticle: NewsArticle = articles[slug];

    const theme = useColors();

    const badges = newsArticle?.tags?.map((tag, i) => (
        <Badge key={`${slug}_tag_${i}`} className={fr.cx("fr-mr-2v")}>
            {tag}
        </Badge>
    ));

    return (
        <AppLayout navItems={defaultNavItems}>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>{badges}</div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                <h1>{newsArticle?.title}</h1>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                <p>{newsArticle.short_description}</p>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                <p
                    style={{
                        fontStyle: "italic",
                        color: theme.decisions.text.mention.grey.default,
                    }}
                >
                    <i className="ri-article-line" />
                    &nbsp;Publié le {functions.date.format(newsArticle.date)}
                </p>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                <img src={newsArticle.thumbnail_url} width="100%" alt="illustration de l'article" />
            </div>

            <div className={fr.cx("fr-grid-row", "fr-mt-2w")}>
                <div className={fr.cx("fr-col")}>{newsArticle.content?.split("\n")?.map((paragraphe, i) => <p key={i}>{paragraphe}</p>)}</div>
            </div>
        </AppLayout>
    );
};

export default NewsArticle;
