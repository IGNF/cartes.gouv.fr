import { fr } from "@codegouvfr/react-dsfr";
import Tile from "@codegouvfr/react-dsfr/Tile";

import Main from "@/components/Layout/Main";
import { routes } from "@/router/router";
import { statsConfig, StatsScope } from "./statsConfig";

export default function StatsIndex() {
    const scopes = Object.entries(statsConfig) as [StatsScope, (typeof statsConfig)[StatsScope]][];

    return (
        <Main title="Statistiques">
            <h1>Statistiques</h1>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-3w")}>
                {scopes.map(([scope, { label }]) => (
                    <div className={fr.cx("fr-col-12", "fr-col-md-4")} key={scope}>
                        <Tile title={label} linkProps={routes.stats_by_scope({ scope }).link} />
                    </div>
                ))}
            </div>
        </Main>
    );
}
