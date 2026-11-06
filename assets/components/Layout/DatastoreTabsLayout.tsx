import { Outlet } from "@tanstack/react-router";

import { useDatastore } from "@/contexts/datastore";
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
    const { datastore } = useDatastore();
    const isSandbox = useMembership({ datastoreId: datastore._id })?.isSandbox === true;
    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();

    return (
        <DatastorePanelMain>
            <PageTitle title={tCommon("datastore_name", { name: datastore.name, isSandbox })}>{isSandbox && <SandboxDatastoreExplanation />}</PageTitle>
            <DatastoreTertiaryNavigation datastoreId={datastore._id} />
            {hasAccess(user, { datastoreId: datastore._id }, requiredRights) ? <Outlet /> : <Forbidden />}
        </DatastorePanelMain>
    );
}
