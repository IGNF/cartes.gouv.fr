import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { symToStr } from "tsafe/symToStr";

import { type NewsArticle } from "../../@types/newsArticle";
import AppLayout from "../../components/Layout/AppLayout";
import LoadingText from "../../components/Utils/LoadingText";
import { useTranslation } from "../../i18n/i18n";
import SymfonyRouting from "../../modules/Routing";
import { routes } from "../../router/router";
import PageNotFound from "../error/PageNotFound";

type NewsArticleProps = {
    slug: string;
};

const NewsArticle: FC<NewsArticleProps> = ({ slug }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");

    const articleQuery = useQuery({
        queryKey: ["articles", "slug", slug],
        queryFn: async ({ signal }) => {
            const url = SymfonyRouting.generate("cartesgouvfr_s3_gateway_get_content", {
                path: `articles/${slug}.html`,
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

    const documentTitle = useMemo(() => {
        if (articleQuery.data === undefined) return undefined;

        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(articleQuery.data, "text/html");

        return htmlDoc.querySelector("h1")?.innerText;
    }, [articleQuery.data]);

    // @ts-expect-error fausse alerte
    if (articleQuery.error?.code === 404) {
        return <PageNotFound />;
    }

    return (
        <AppLayout
            documentTitle={documentTitle}
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [{ label: tBreadcrumb("news"), linkProps: routes.news_list().link }],
                currentPageLabel: documentTitle,
            }}
        >
            {articleQuery.isLoading && (
                <div className={fr.cx("fr-container")}>
                    <LoadingText message="Actualités" as="h1" withSpinnerIcon={true} />
                </div>
            )}

            {articleQuery.error && (
                <div className={fr.cx("fr-container")}>
                    <Alert severity={"error"} title={tCommon("error")} description={articleQuery.error?.message} className={fr.cx("fr-my-3w")} />
                </div>
            )}

            {articleQuery.data && (
                <div className={fr.cx("fr-grid-row")}>
                    <div
                        className={fr.cx("fr-col-12", "fr-col-md-8")}
                        dangerouslySetInnerHTML={{
                            __html: articleQuery.data,
                        }}
                    />
                </div>
            )}
        </AppLayout>
    );
};

NewsArticle.displayName = symToStr({ NewsArticle });

export default NewsArticle;
