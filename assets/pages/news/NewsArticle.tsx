import { fr } from "@codegouvfr/react-dsfr";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import { type NewsArticle } from "../../@types/newsArticle";
import articles from "../../data/actualites.json";
import { useTranslation } from "../../i18n/i18n";
import { appRoot, routes } from "../../router/router";
import { formatDateFromISO } from "../../utils";
import PageNotFound from "../error/PageNotFound";
import Main from "../../components/Layout/Main";

type NewsArticleProps = {
    slug: string;
};

const NewsArticle: FC<NewsArticleProps> = ({ slug }) => {
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");

    const newsArticle: NewsArticle | undefined = articles[slug];

    if (newsArticle === undefined) {
        return <PageNotFound />;
    }

    const tags = newsArticle?.tags?.map((tag, i) => (
        <Tag key={`${slug}_tag_${i}`} className={fr.cx("fr-mr-2v")}>
            {tag}
        </Tag>
    ));

    return (
        <Main
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [{ label: tBreadcrumb("news"), linkProps: routes.news_list().link }],
                currentPageLabel: newsArticle?.breadcrumb ?? newsArticle.title,
            }}
            title={newsArticle?.title}
        >
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <div className={fr.cx("fr-tags-group")}>{tags}</div>
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <h1>{newsArticle?.title}</h1>
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <p dangerouslySetInnerHTML={{ __html: newsArticle.short_description ?? "" }} />
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <p
                            style={{
                                fontStyle: "italic",
                                color: fr.colors.decisions.text.mention.grey.default,
                            }}
                        >
                            <i className="ri-article-line" />
                            &nbsp;Publié le {formatDateFromISO(newsArticle.date)}
                        </p>
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <figure className={fr.cx("fr-content-media")} role="group" aria-label={newsArticle?.thumbnail_caption}>
                            <div className={fr.cx("fr-content-media__img")}>
                                <img
                                    className={fr.cx("fr-responsive-img")}
                                    src={`${appRoot}/${newsArticle.thumbnail_url}`}
                                    alt={newsArticle?.thumbnail_alt}
                                    role="presentation"
                                    data-fr-js-ratio="true"
                                />
                            </div>
                            <figcaption className={fr.cx("fr-content-media__caption")}>{newsArticle?.thumbnail_caption}</figcaption>
                        </figure>
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-mt-2w")}>
                        <div className={fr.cx("fr-col")} dangerouslySetInnerHTML={{ __html: newsArticle.content }} />
                    </div>
                </div>
            </div>
        </Main>
    );
};

NewsArticle.displayName = symToStr({ NewsArticle });

export default NewsArticle;
