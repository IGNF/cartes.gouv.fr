import { fr } from "@codegouvfr/react-dsfr";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import AppLayout from "../../components/Layout/AppLayout";
import articles from "../../data/actualites.json";
import { appRoot } from "../../router/router";
import { type NewsArticle } from "../../@types/newsArticle";
import { formatDateFromISO } from "../../utils";
import PageNotFound from "../error/PageNotFound";

type NewsArticleProps = {
    slug: string;
};

const NewsArticle: FC<NewsArticleProps> = ({ slug }) => {
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
        <AppLayout documentTitle={newsArticle?.title}>
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
        </AppLayout>
    );
};

NewsArticle.displayName = symToStr({ NewsArticle });

export default NewsArticle;
