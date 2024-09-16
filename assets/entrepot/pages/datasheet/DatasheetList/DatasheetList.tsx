import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { getLink } from "@codegouvfr/react-dsfr/link";
import { useQuery } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC, ReactNode, useMemo } from "react";

import { Datasheet, EndpointTypeEnum } from "../../../../@types/app";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import Skeleton from "../../../../components/Utils/Skeleton";
import { Translations, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../router/router";
import api from "../../../api";
import DatasheetListItem from "./DatasheetListItem";

const { Link } = getLink();

type DatasheetListProps = {
    datastoreId: string;
};
const DatasheetList: FC<DatasheetListProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatasheetList");

    const datastoreQuery = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const datasheetListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_list(datastoreId),
        queryFn: ({ signal }) => api.datasheet.getList(datastoreId, { signal }),
        staleTime: 30000,
        refetchInterval: 30000,
        enabled: datastoreQuery.data !== undefined,
    });

    const metadataEndpoint = useMemo(
        () => datastoreQuery.data?.endpoints.find((endpoint) => endpoint.endpoint.type === EndpointTypeEnum.METADATA),
        [datastoreQuery.data?.endpoints]
    );

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle="Mes données">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col")}>
                    <h1>
                        {t("title", { datastoreName: datastoreQuery?.data?.name })}
                        {(datastoreQuery?.isFetching || datasheetListQuery?.isFetching) && <LoadingIcon className={fr.cx("fr-ml-2w")} largeIcon={true} />}
                    </h1>

                    {datastoreQuery.data?.is_sandbox === true && t("sandbox_datastore_explanation")}
                </div>
            </div>

            {metadataEndpoint && (
                <div className={fr.cx("fr-grid-row")}>
                    {metadataEndpoint?.quota && metadataEndpoint?.use && metadataEndpoint?.quota === metadataEndpoint?.use ? (
                        <Alert severity="warning" title={t("datasheet_creation_impossible")} description={t("metadata_endpoint_quota_reached")} />
                    ) : (
                        <Button linkProps={routes.datastore_datasheet_upload({ datastoreId: datastoreId }).link} iconId={"fr-icon-add-line"}>
                            {t("create_datasheet")}
                        </Button>
                    )}
                </div>
            )}

            {datasheetListQuery.data === undefined ? (
                <Skeleton count={12} rectangleHeight={100} />
            ) : (
                datasheetListQuery?.data?.map((datasheet: Datasheet) => (
                    <DatasheetListItem key={datasheet.name} datastoreId={datastoreId} datasheet={datasheet} />
                ))
            )}
        </DatastoreLayout>
    );
};

export default DatasheetList;

export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { datastoreName?: string }; R: string }
    | "create_datasheet"
    | "datasheet_creation_impossible"
    | "metadata_endpoint_quota_reached"
    | { K: "services_published"; P: { nbServices?: number }; R: string }
    | "no_services_published"
    | { K: "sandbox_datastore_explanation"; R: ReactNode }
>()({
    DatasheetList,
});

export const DatasheetListFrTranslations: Translations<"fr">["DatasheetList"] = {
    title: ({ datastoreName }) => `Données ${datastoreName ?? ""}`,
    create_datasheet: "Créer une fiche de données",
    datasheet_creation_impossible: "Création d’une nouvelle fiche de données impossible",
    metadata_endpoint_quota_reached: "Quota du point d’accès de métadonnées atteint",
    services_published: ({ nbServices }) => `Publié (${nbServices})`,
    no_services_published: "Non publié",
    sandbox_datastore_explanation: (
        <p>
            {"Cet espace permet de tester les fonctions d’alimentation et de diffusion de la Géoplateforme. Les conditions d'utilisation sont "}{" "}
            <Link {...routes.terms_of_service().link}>décrites à cette page.</Link>
        </p>
    ),
};

export const DatasheetListEnTranslations: Translations<"en">["DatasheetList"] = {
    title: undefined,
    create_datasheet: undefined,
    datasheet_creation_impossible: undefined,
    metadata_endpoint_quota_reached: undefined,
    services_published: undefined,
    no_services_published: undefined,
    sandbox_datastore_explanation: undefined,
};
