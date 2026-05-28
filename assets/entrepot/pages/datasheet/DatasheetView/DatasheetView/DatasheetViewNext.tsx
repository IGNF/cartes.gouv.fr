import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { DatasheetDetailed, Metadata } from "@/@types/app";
import DatasheetMain from "@/components/Layout/Datasheet/DatasheetMain";
import api from "@/entrepot/api";
import useCatalogueDatasheetUrl from "@/hooks/useCatalogueDatasheetUrl";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import DatasheetHeader from "./DatasheetHeader";
import TertiaryNavigation from "@/components/Layout/TertiaryNavigation";
import { routes } from "@/router/router";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";

export enum DatasheetViewActiveTabEnum {
    Description = "description",
    Preview = "preview",
    Annexes = "annexes",
    Dataset = "dataset",
    Wfs = "wfs",
    Wms = "wms",
    Tms = "tms",
    Wmts = "wmts",
}

const tabs: Array<{ label: string; value: DatasheetViewActiveTabEnum }> = [
    { label: "Description", value: DatasheetViewActiveTabEnum.Description },
    { label: "Aperçu", value: DatasheetViewActiveTabEnum.Preview },
    { label: "Annexes", value: DatasheetViewActiveTabEnum.Annexes },
    { label: "Données", value: DatasheetViewActiveTabEnum.Dataset },
    { label: "Flux WFS", value: DatasheetViewActiveTabEnum.Wfs },
    { label: "Flux WMS", value: DatasheetViewActiveTabEnum.Wms },
    { label: "Flux TMS", value: DatasheetViewActiveTabEnum.Tms },
    { label: "Flux WMTS", value: DatasheetViewActiveTabEnum.Wmts },
];

type DatasheetViewProps = {
    datastoreId: string;
    datasheetName: string;
    activeTab: string;
};

export default function DatasheetViewNext(props: DatasheetViewProps) {
    const { datastoreId, datasheetName, activeTab = DatasheetViewActiveTabEnum.Description } = props;

    const datasheetQuery = useQuery<DatasheetDetailed, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
        // enabled: !datasheetDeleteMutation.isPending,
    });
    const datasheet = datasheetQuery.data;

    const metadataQuery = useQuery<Metadata, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        // enabled: !datasheetDeleteMutation.isPending,
        staleTime: 60000,
        retry: false,
    });
    const metadata = metadataQuery.data;

    const { catalogueDatasheetUrl } = useCatalogueDatasheetUrl(datastoreId, datasheetName);

    const isPublished = useMemo(() => metadata?.endpoints?.length !== undefined && metadata?.endpoints?.length > 0, [metadata?.endpoints?.length]);

    return (
        <DatasheetMain
            title={`Données ${datasheetName}`}
            header={
                <>
                    <DatasheetHeader
                        name={datasheetName}
                        thumbnailUrl={datasheet?.thumbnail?.url}
                        catalogLink={catalogueDatasheetUrl}
                        published={isPublished}
                        loading={datasheetQuery.isLoading}
                    />

                    <TertiaryNavigation
                        items={tabs.map((tab) => ({
                            text: tab.label,
                            linkProps: routes.datastore_datasheet_view_next({ datastoreId, datasheetName, activeTab: tab.value }).link,
                            isActive: activeTab === tab.value,
                        }))}
                    />
                </>
            }
            content={
                <div
                    className={fr.cx("fr-container", "fr-p-10v")}
                    style={{
                        backgroundColor: fr.colors.decisions.background.contrast.grey.default,
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                    }}
                >
                    <section
                        className={fr.cx("fr-grid-row", "fr-grid-row--no-gutters", "fr-p-6v")}
                        style={{
                            backgroundColor: fr.colors.decisions.background.default.grey.default,
                        }}
                    >
                        <form className={fr.cx("fr-col")}>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                <h2 className={fr.cx("fr-h6", "fr-m-0")}>Description</h2>
                                <Button priority="secondary" className={fr.cx("fr-ml-auto")}>
                                    Enregistrer
                                </Button>
                            </div>

                            <Input label={"Nom de la fiche de données"} />

                            <Input label={"Description"} />
                        </form>
                    </section>

                    <section
                        className={fr.cx("fr-grid-row", "fr-grid-row--no-gutters", "fr-p-6v")}
                        style={{
                            backgroundColor: fr.colors.decisions.background.default.grey.default,
                        }}
                    >
                        <form className={fr.cx("fr-col")}>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                <h2 className={fr.cx("fr-h6", "fr-m-0")}>Producteur</h2>
                                <Button priority="secondary" className={fr.cx("fr-ml-auto")}>
                                    Enregistrer
                                </Button>
                            </div>

                            <Input label={"Nom de la fiche de données"} />

                            <Input label={"Description"} />
                        </form>
                    </section>
                </div>
            }
        />
    );
}
