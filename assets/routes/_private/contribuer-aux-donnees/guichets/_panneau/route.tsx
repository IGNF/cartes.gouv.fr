import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import SidePanelHeader from "@/components/Layout/SidePanelHeader";
import SidePanelMain from "@/components/Layout/SidePanelMain";
import CommunityListFilters from "@/espaceco/pages/communities/CommunityListFilters";
import { useTranslation } from "@/i18n/i18n";

export const Route = createFileRoute("/_private/contribuer-aux-donnees/guichets/_panneau")({
    component: PanelLayout,
});

function PanelLayout() {
    const { t } = useTranslation("EspaceCoCommunityList");

    return (
        <SidePanelMain
            panel={
                <div>
                    <SidePanelHeader iconId="fr-icon-message-2-fill" title={t("panel_title")} description={t("panel_description")} />
                    <Badge severity="success" noIcon className={fr.cx("fr-mb-4v")}>
                        {t("beta_badge")}
                    </Badge>
                    <CommunityListFilters />
                </div>
            }
        >
            <Outlet />
        </SidePanelMain>
    );
}
