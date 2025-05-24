import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
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
};
const NewsList: FC<NewsListProps> = ({ page = 0 }) => {
    const { t: tCommon } = useTranslation("Common");

    const articlesListQuery = useQuery({
        queryKey: ["articles", "list", page],
        queryFn: async ({ signal }) => {
            const url = SymfonyRouting.generate("cartesgouvfr_s3_gateway_get_content", {
                path: `articles/list/${page}.html`,
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
        routes.news_list({ page: 0 }).replace();
    }

    return (
        <Main title="Actualités">
            {articlesListQuery.isLoading && <LoadingText message="Actualités" as="h1" withSpinnerIcon={true} />}

            {articlesListQuery.error && (
                <Alert severity={"error"} title={tCommon("error")} description={articlesListQuery.error?.message} className={fr.cx("fr-my-3w")} />
            )}

            {articlesListQuery.data && (
                <div
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
