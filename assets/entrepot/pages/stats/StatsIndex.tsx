import { fr } from "@codegouvfr/react-dsfr";
import Tile from "@codegouvfr/react-dsfr/Tile";

import Main from "@/components/Layout/Main";
import { useTranslation } from "@/i18n";
import { routes } from "@/router/router";
import { statsConfig } from "./statsConfig";
import type { StatsScope } from "./stats.types";

export default function StatsIndex() {
    const { t } = useTranslation("Stats");

    const scopes = Object.keys(statsConfig) as StatsScope[];

    return (
        <Main title={t("scope_selection_title")}>
            <h1>{t("scope_selection_title")}</h1>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-3w")}>
                {scopes.map((scope) => (
                    <div className={fr.cx("fr-col-12", "fr-col-md-4")} key={scope}>
                        <Tile title={t("scope_title", { scope })} linkProps={routes.stats_by_scope({ scope }).link} desc={t("scope_desc", { scope })} />
                    </div>
                ))}
            </div>
        </Main>
    );
}
