import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useMemo } from "react";

import { DatasheetDetailed, Metadata } from "@/@types/app";
import DatasheetMain from "@/components/Layout/Datasheet/DatasheetMain";
import TertiaryNavigation from "@/components/Layout/TertiaryNavigation";
import LoadingText from "@/components/Utils/LoadingText";
import api from "@/entrepot/api";
import useCatalogueDatasheetUrl from "@/hooks/useCatalogueDatasheetUrl";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { routes } from "@/router/router";
import { useStyles } from "tss-react";
import { defaultMetadataValues } from "../../forms/metadataSchema";
import DatasheetHeader from "./DatasheetHeader";

const MetadataForm = lazy(() => import("../../forms/MetadataForm"));

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
    });
    const datasheet = datasheetQuery.data;

    const metadataQuery = useQuery<Metadata, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });

    const { catalogueDatasheetUrl } = useCatalogueDatasheetUrl(datastoreId, datasheetName);

    const isPublished = useMemo(
        () => metadataQuery.data?.endpoints?.length !== undefined && metadataQuery.data?.endpoints?.length > 0,
        [metadataQuery.data?.endpoints?.length]
    );

    const { css, cx } = useStyles();

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
                    className={cx(
                        fr.cx("fr-container--fluid", "fr-py-10v"),
                        css({
                            backgroundColor: fr.colors.decisions.background.alt.grey.default,
                        })
                    )}
                >
                    <div className={cx(fr.cx("fr-container"))}>
                        <Suspense fallback={<LoadingText withSpinnerIcon={true} as="p" />}>
                            {(() => {
                                switch (activeTab) {
                                    case DatasheetViewActiveTabEnum.Description:
                                        return (
                                            <MetadataForm
                                                defaultValues={defaultMetadataValues}
                                                onSubmit={async (_values) => {
                                                    // TODO : appel API backend (PATCH) une fois le contrat défini
                                                }}
                                                renderTopActions={({ isSubmitting }) => (
                                                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mb-4w")}>
                                                        <Button priority="secondary" type="submit" disabled={isSubmitting}>
                                                            Enregistrer
                                                        </Button>
                                                    </div>
                                                )}
                                            />
                                        );
                                }
                            })()}
                        </Suspense>
                    </div>
                </div>
            }
        />
    );
}
