import { Outlet, useParams } from "@tanstack/react-router";

import SandboxDatastoreExplanation from "@/entrepot/pages/datasheet/DatasheetList/SandboxDatastoreExplanation";
import useUserQuery from "@/hooks/queries/useUserQuery";
import useMembership from "@/hooks/useMembership";
import useRequiredRights from "@/hooks/useRequiredRights";
import { useTranslation } from "@/i18n";
import Forbidden from "@/pages/error/Forbidden";
import { hasAccess } from "@/utils/membership";
import DatastorePanelMain from "./DatastorePanelMain";
import DatastoreTertiaryNavigation from "./DatastoreTertiaryNavigation";
import PageTitle from "./PageTitle";

/** espace de travail d’un entrepôt : panneau, nom de l’entrepôt et onglets restent montés entre les onglets */
export default function DatastoreTabsLayout() {
    const { t: tCommon } = useTranslation("Common");
    // rendu sous l’URL de l’entrepôt ou sous celle de la communauté
    const params = useParams({ strict: false });
    const membership = useMembership({ datastoreId: params.datastoreId, communityId: params.communityId?.toString() });
    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();

    if (!membership) return null;

    const datastoreId = membership.community?.datastore;
    // communauté sans entrepôt : pas d’onglets possibles (suite séparée)
    if (!datastoreId) throw new Error("La communauté n’a pas d’entrepôt");

    return (
        <DatastorePanelMain>
            <PageTitle title={tCommon("datastore_name", { name: membership.community?.name, isSandbox: membership.isSandbox })}>
                {membership.isSandbox && <SandboxDatastoreExplanation />}
            </PageTitle>
            <DatastoreTertiaryNavigation datastoreId={datastoreId} />
            {hasAccess(user, { datastoreId }, requiredRights) ? <Outlet /> : <Forbidden />}
        </DatastorePanelMain>
    );
}
