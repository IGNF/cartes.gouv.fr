import { fr } from "@codegouvfr/react-dsfr";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";
import articles from "../../data/actualites.json";
import functions from "../../functions";
import { appRoot, routes } from "../../router/router";
import { type NewsArticle } from "../../types/newsArticle";

type NewsListItemProps = {
    slug: string;
    newsArticle: NewsArticle;
};

const NewsListItem: FC<NewsListItemProps> = ({ slug, newsArticle }) => {
    const SHORT_DESC_MAX_CHAR = 120;

    const tags = newsArticle?.tags?.map((tag, i) => <Tag key={`${slug}_tag_${i}`}>{tag}</Tag>);

    return (
        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
            <Card
                start={<div className={fr.cx("fr-tags-group")}>{tags}</div>}
                desc={
                    newsArticle?.short_description && newsArticle?.short_description.length > SHORT_DESC_MAX_CHAR
                        ? newsArticle?.short_description.substring(0, 100) + "..."
                        : newsArticle?.short_description
                }
                detail={newsArticle?.date && functions.date.format(newsArticle?.date)}
                enlargeLink
                imageAlt={newsArticle?.thumbnail_alt}
                imageUrl={`${appRoot}/${newsArticle.thumbnail_url}`}
                linkProps={routes.news_article({ slug }).link}
                title={newsArticle?.title}
                titleAs="h2"
            />
        </div>
    );
};
NewsListItem.displayName = symToStr({ NewsListItem });

const NewsList = () => {
    return (
        <AppLayout navItems={defaultNavItems} documentTitle="Actualités">
            <div className={fr.cx("fr-container")}>
                <h1>Actualités</h1>

                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    {Object.entries(articles)?.map(([slug, article]) => <NewsListItem key={slug} slug={slug} newsArticle={article} />)}
                </div>
            </div>
        </AppLayout>
    );
};

NewsList.displayName = symToStr({ NewsList });

export default NewsList;
