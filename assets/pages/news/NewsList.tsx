import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { symToStr } from "tsafe/symToStr";

import Main from "../../components/Layout/Main";
import LoadingText from "../../components/Utils/LoadingText";
import { useTranslation } from "../../i18n/i18n";
import SymfonyRouting from "../../modules/Routing";

// pour que la commande "react-dsfr update-icons" inclue l'icone article dans les assets
// fr-icon-article-line

const NewsList = () => {
    const { t: tCommon } = useTranslation("Common");

    const articlesListQuery = useQuery({
        queryKey: ["articles"],
        queryFn: async () => {
            const url = SymfonyRouting.generate("cartesgouvfr_s3_gateway_get_content", {
                path: "articles/articles.html",
            });
            const response = await fetch(url);

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
