import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Highlight from "@codegouvfr/react-dsfr/Highlight";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import SelectNext from "@codegouvfr/react-dsfr/SelectNext";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import { Datasheet, EndpointTypeEnum } from "../../../../@types/app";
import Main from "../../../../components/Layout/Main";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import Skeleton from "../../../../components/Utils/Skeleton";
import { useDatastore } from "../../../../contexts/datastore";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../router/router";
import api from "../../../api";
import DatasheetListItem from "./DatasheetListItem";
import { usePagination } from "@/hooks/usePagination";
import PageTitle from "@/components/Layout/PageTitle";
import { useSearch } from "@/hooks/useSearch";
import { FilterEnum, useFilters } from "@/hooks/useFilters";
import { SortOrderEnum, useSort } from "@/hooks/useSort";
import { SortByEnum } from "./DatasheetList.types";

const filterTests = {
    [FilterEnum.ENABLED]: (d: Datasheet) => d.nb_publications > 0,
    [FilterEnum.DISABLED]: (d: Datasheet) => d.nb_publications === 0,
};

type DatasheetListProps = {
    datastoreId: string;
};
const DatasheetList: FC<DatasheetListProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatasheetList");
    const { datastore, isFetching: isDatastoreFetching } = useDatastore();
    const { t: tCommon } = useTranslation("Common");

    const datasheetListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_list(datastoreId),
        queryFn: ({ signal }) => api.datasheet.getList(datastoreId, { signal }),
        staleTime: 60000,
        enabled: datastore !== undefined,
    });
    const { data, dataUpdatedAt, isFetching, isLoading, refetch } = datasheetListQuery;

    const metadataEndpoint = useMemo(
        () => datastore?.endpoints?.find((endpoint) => endpoint.endpoint.type === EndpointTypeEnum.METADATA),
        [datastore?.endpoints]
    );

    const datasheetCreationImpossible = Boolean(
        metadataEndpoint && metadataEndpoint?.quota && metadataEndpoint?.use && metadataEndpoint?.quota <= metadataEndpoint?.use
    );

    // filtre et tri
    const { search, searchedItems } = useSearch(data ?? []);
    const { filteredItems, filters } = useFilters(searchedItems, ["published"], filterTests);
    const { sortBy, sortOrder, sortedItems } = useSort(filteredItems, ["name", "nb_publications"]);
    const { limit, page, paginatedItems, totalPages } = usePagination(sortedItems);

    return (
        <Main title={t("title", { datastoreName: datastore?.name })}>
            <PageTitle
                buttons={[
                    {
                        children: t("create_datasheet"),
                        linkProps: datasheetCreationImpossible
                            ? { href: undefined, "aria-hidden": true }
                            : routes.datastore_datasheet_upload({ datastoreId: datastoreId }).link,
                        iconId: "fr-icon-add-line",
                        className: fr.cx(datasheetCreationImpossible && "fr-hidden"),
                    },
                ]}
                showButtons={metadataEndpoint && !datasheetCreationImpossible}
                title={
                    <>
                        {t("title", { datastoreName: datastore?.name })}
                        {(isDatastoreFetching || isFetching) && <LoadingIcon className={fr.cx("fr-ml-2w")} largeIcon={true} />}
                    </>
                }
            >
                {datastore?.is_sandbox === true && <Highlight>{t("sandbox_datastore_explanation") ?? ""}</Highlight>}
            </PageTitle>

            {metadataEndpoint && datasheetCreationImpossible && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    <div className={fr.cx("fr-col")}>
                        <Alert severity="warning" title={t("datasheet_creation_impossible")} as="h2" description={t("metadata_endpoint_quota_reached")} />
                    </div>
                </div>
            )}

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-2v")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8", "fr-col-offset-md-2")}>
                    <SearchBar
                        label={tCommon("search")}
                        onButtonClick={(text) => {
                            if (!isLoading) {
                                routes.datasheet_list({ ...filters, datastoreId, search: text, sortBy, sortOrder }).replace();
                            }
                        }}
                        allowEmptySearch={true}
                        big
                        renderInput={({ className, id, placeholder, type }) => (
                            <input className={className} id={id} placeholder={placeholder} type={type} disabled={isLoading} />
                        )}
                    />
                </div>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-2v")}>
                <div className={fr.cx("fr-col-12", "fr-col-sm")}>
                    <RadioButtons
                        legend={<h2 className={fr.cx("fr-h5")}>{t("filter_label")}</h2>}
                        options={[
                            {
                                label: t("filter_option", { filter: FilterEnum.ALL }),
                                nativeInputProps: {
                                    value: FilterEnum.ALL.toString(),
                                    checked: filters.published === FilterEnum.ALL,
                                    onChange: () => {
                                        routes.datasheet_list({ datastoreId, search, sortBy, sortOrder }).replace();
                                    },
                                },
                            },
                            {
                                label: t("filter_option", { filter: FilterEnum.ENABLED }),
                                nativeInputProps: {
                                    value: FilterEnum.ENABLED.toString(),
                                    checked: filters.published === FilterEnum.ENABLED,
                                    onChange: () => {
                                        routes
                                            .datasheet_list({ ...filters, datastoreId, search, sortBy, sortOrder, published: FilterEnum.ENABLED })
                                            .replace();
                                    },
                                },
                            },
                            {
                                label: t("filter_option", { filter: FilterEnum.DISABLED }),
                                nativeInputProps: {
                                    value: FilterEnum.DISABLED.toString(),
                                    checked: filters.published === FilterEnum.DISABLED,
                                    onChange: () => {
                                        routes
                                            .datasheet_list({ ...filters, datastoreId, search, sortBy, sortOrder, published: FilterEnum.DISABLED })
                                            .replace();
                                    },
                                },
                            },
                        ]}
                        orientation="horizontal"
                        disabled={isLoading}
                    />
                </div>
                <div className={fr.cx("fr-col-12", "fr-col-sm")}>
                    <SelectNext
                        label={<h2 className={fr.cx("fr-h5")}>{t("sort_label")}</h2>}
                        options={[
                            {
                                label: t("sort_option", { sort: SortByEnum.NAME, sortOrder: SortOrderEnum.ASCENDING }),
                                value: `name|${SortOrderEnum.ASCENDING}`,
                            },
                            {
                                label: t("sort_option", { sort: SortByEnum.NAME, sortOrder: SortOrderEnum.DESCENDING }),
                                value: `name|${SortOrderEnum.DESCENDING}`,
                            },
                            {
                                label: t("sort_option", { sort: SortByEnum.NB_SERVICES, sortOrder: SortOrderEnum.ASCENDING }),
                                value: `nb_publications|${SortOrderEnum.ASCENDING}`,
                            },
                            {
                                label: t("sort_option", { sort: SortByEnum.NB_SERVICES, sortOrder: SortOrderEnum.DESCENDING }),
                                value: `nb_publications|${SortOrderEnum.DESCENDING}`,
                            },
                        ]}
                        nativeSelectProps={{
                            "aria-label": t("sort_label"),
                            value: `${sortBy}|${sortOrder}`,
                            onChange: (e) => {
                                const selectedSort = e.currentTarget.value?.split("|");
                                const selectedSortBy = selectedSort?.[0];
                                const selectedSortOrder = Number(selectedSort?.[1]);
                                if (!selectedSortBy || isNaN(selectedSortOrder) || selectedSortOrder === 0) return;
                                routes.datasheet_list({ ...filters, datastoreId, search, sortBy: selectedSortBy, sortOrder: selectedSortOrder }).replace();
                            },
                        }}
                        placeholder={t("sort_placeholder")}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {isLoading ? (
                <Skeleton count={12} rectangleHeight={100} />
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
                        <div
                            className={fr.cx("fr-col")}
                            style={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <h2 className={fr.cx("fr-text--sm", "fr-mb-0")}>{t("nb_results", { nb: filteredItems.length })}</h2>
                            <span
                                className={fr.cx("fr-text--sm", "fr-mb-0", "fr-mr-2v")}
                                style={{
                                    marginLeft: "auto",
                                }}
                            >
                                {t("last_refresh_date", { dataUpdatedAt })}
                            </span>
                            <Button
                                title={t("refresh_datasheet_list")}
                                onClick={() => refetch()}
                                iconId="ri-refresh-line"
                                nativeButtonProps={{
                                    "aria-disabled": isFetching,
                                }}
                                disabled={isFetching}
                                size="small"
                                className={isFetching ? "frx-icon-spin" : ""}
                            />
                        </div>
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-4v")}>
                        <div className={fr.cx("fr-col")}>
                            {paginatedItems.map((datasheet: Datasheet) => (
                                <DatasheetListItem key={datasheet.name} datastoreId={datastoreId} datasheet={datasheet} />
                            ))}

                            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-6v")}>
                                <Pagination
                                    count={totalPages}
                                    showFirstLast={true}
                                    getPageLinkProps={(pageNumber) => ({
                                        ...routes.datasheet_list({ ...filters, datastoreId, page: pageNumber, limit: limit, search, sortBy, sortOrder }).link,
                                    })}
                                    defaultPage={page}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Main>
    );
};

export default DatasheetList;
