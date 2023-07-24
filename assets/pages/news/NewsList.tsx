import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { FC } from "react";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";
import articles from "../../data/actualites.json";
import functions from "../../functions";
import { routes } from "../../router/router";
import { type NewsArticle } from "../../types/newsArticle";

type NewsListItemProps = {
    slug: string;
    newsArticle: NewsArticle;
};

const NewsListItem: FC<NewsListItemProps> = ({ slug, newsArticle }) => {
    const SHORT_DESC_MAX_CHAR = 120;

    const badges = newsArticle?.tags?.map((tag, i) => <Badge key={`${slug}_tag_${i}`}>{tag}</Badge>);

    return (
        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
            <Card
                badges={badges}
                desc={
                    newsArticle?.short_description && newsArticle?.short_description.length > SHORT_DESC_MAX_CHAR
                        ? newsArticle?.short_description.substring(0, 100) + "..."
                        : newsArticle?.short_description
                }
                detail={newsArticle?.date && functions.date.format(newsArticle?.date)}
                enlargeLink
                imageAlt="illustration de l'article"
                imageUrl={newsArticle?.thumbnail_url}
                linkProps={routes.news_article({ slug }).link}
                title={newsArticle?.title}
            />
        </div>
    );
};

const NewsList = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <div className={fr.cx("fr-container", "fr-pt-8v", "fr-pt-18v", "fr-mb-md-8v")}>
                <h1>Actualités</h1>

                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    {Object.entries(articles)?.map(([slug, article]) => <NewsListItem key={slug} slug={slug} newsArticle={article} />)}
                </div>
            </div>
        </AppLayout>
    );
};

export default NewsList;
