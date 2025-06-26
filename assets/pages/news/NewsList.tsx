import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect } from "react";
import { symToStr } from "tsafe/symToStr";

import Main from "../../components/Layout/Main";
import LoadingText from "../../components/Utils/LoadingText";
import { useTranslation } from "../../i18n/i18n";
import SymfonyRouting from "../../modules/Routing";
import { routes } from "../../router/router";

// NOTE pour que la commande "react-dsfr update-icons" inclue l'icone article dans les assets qui est utilisée dans les articles
// fr-icon-article-line

type NewsListProps = {
    page: number;
    tag?: string;
};
const NewsList: FC<NewsListProps> = ({ page = 0, tag }) => {
    const { t: tCommon } = useTranslation("Common");

    const articlesListQuery = useQuery({
        queryKey: ["articles", "list", tag, page],
        queryFn: async ({ signal }) => {
            const url = SymfonyRouting.generate("cartesgouvfr_s3_gateway_get_content", {
                path: tag ? `articles/list/tags/${tag}/${page}.html` : `articles/list/${page}.html`,
            });
            const response = await fetch(url, { signal });

            if (!response.ok) {
                return Promise.reject({
                    message: "Fetching articles failed",
                    code: response.status,
                });
            }

            const text = await response.text();
            return text;
        },
    });

    // @ts-expect-error fausse alerte
    if (articlesListQuery.error?.code === 404) {
        routes.news_list({ page: 0 }).push();
    }

    // gestion des liens de navigation côté client pour les tags et les cartes d'articles
    useEffect(() => {
        const handleTagClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName === "A" && target.classList?.contains("fr-tag")) {
                event.preventDefault();
                const href = (target as HTMLAnchorElement).href;
                const tag = href.split("/")?.[5];
                if (tag) {
                    routes.news_list_by_tag({ page: 0, tag }).push();
                } else {
                    routes.news_list({ page: 0 }).push();
                }
            }
        };

        const handleCardClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName === "A" && target.parentElement?.className.includes("fr-card")) {
                event.preventDefault();
                const href = (target as HTMLAnchorElement).href;
                const slug = href.split("/")?.[4];
                if (slug) {
                    routes.news_article({ slug }).push();
                }
            }
        };

        document.addEventListener("click", handleTagClick);
        document.addEventListener("click", handleCardClick);

        return () => {
            document.removeEventListener("click", handleTagClick);
            document.removeEventListener("click", handleCardClick);
        };
    }, []);

    return (
        <Main title="Actualités">
            {articlesListQuery.isLoading && <LoadingText message="Actualités" as="h1" withSpinnerIcon={true} />}

            {articlesListQuery.error && (
                <Alert severity={"error"} title={tCommon("error")} description={articlesListQuery.error?.message} className={fr.cx("fr-my-3w")} />
            )}

            {articlesListQuery.data && (
                <div
                    tabIndex={-1}
                    dangerouslySetInnerHTML={{
                        __html: articlesListQuery.data,
                    }}
                />
            )}
        </Main>
    );
};

NewsList.displayName = symToStr({ NewsList });

export default NewsList;
