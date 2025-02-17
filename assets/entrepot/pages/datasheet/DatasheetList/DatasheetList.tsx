import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Highlight from "@codegouvfr/react-dsfr/Highlight";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import SelectNext from "@codegouvfr/react-dsfr/SelectNext";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { useStyles } from "tss-react";

import { Datasheet, EndpointTypeEnum } from "../../../../@types/app";
import Main from "../../../../components/Layout/Main";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import Skeleton from "../../../../components/Utils/Skeleton";
import { useDatastore } from "../../../../contexts/datastore";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { routes, useRoute } from "../../../../router/router";
import api from "../../../api";
import { FilterEnum, Sort, SortByEnum, SortOrderEnum } from "./DatasheetList.types";
import DatasheetListItem from "./DatasheetListItem";

const getFilteredList = (list: Datasheet[], filters: FilterEnum[], filterName?: string) => {
    if (filterName) {
        list = list.filter((d) => d.name.toLowerCase().includes(filterName.toLowerCase()));
    }

    if (filters.length === 0) {
        return list;
    }

    let filtered: Datasheet[] = [];

    if (filters.includes(FilterEnum.PUBLISHED)) {
        filtered = [...filtered, ...list.filter((d) => d.nb_publications > 0)];
    }

    if (filters.includes(FilterEnum.NOT_PUBLISHED)) {
        filtered = [...filtered, ...list.filter((d) => d.nb_publications === 0)];
    }
    return filtered;
};

const getSortedList = (list: Datasheet[], sort: Sort) => {
    return list.sort((a, b) => {
        switch (sort.by) {
            case SortByEnum.NB_SERVICES:
                return (a.nb_publications - b.nb_publications) * sort.order;

            case SortByEnum.NAME:
            default:
                return a.name.localeCompare(b.name) * sort.order;
        }
    });
};

type DatasheetListProps = {
    datastoreId: string;
};
const DatasheetList: FC<DatasheetListProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatasheetList");
    const { datastore, isFetching } = useDatastore();
    const { t: tCommon } = useTranslation("Common");

    const { params } = useRoute();
    const pagination = {
        page: params["page"] ? parseInt(params["page"]) : 1,
        limit: params["limit"] ? parseInt(params["limit"]) : 20,
    };

    const datasheetListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_list(datastoreId),
        queryFn: ({ signal }) => api.datasheet.getList(datastoreId, { signal }),
        staleTime: 60000,
        enabled: datastore !== undefined,
    });

    const metadataEndpoint = useMemo(
        () => datastore?.endpoints?.find((endpoint) => endpoint.endpoint.type === EndpointTypeEnum.METADATA),
        [datastore?.endpoints]
    );

    const datasheetCreationImpossible = Boolean(
        metadataEndpoint && metadataEndpoint?.quota && metadataEndpoint?.use && metadataEndpoint?.quota <= metadataEndpoint?.use
    );

    // filtre et tri
    const [searchDatasheetName, setSearchDatasheetName] = useState<string | undefined>();
    const [filters, setFilters] = useState<FilterEnum[]>([]);
    const [sort, setSort] = useState<Sort>({ by: SortByEnum.NAME, order: SortOrderEnum.ASCENDING });

    const datasheetList = getSortedList(getFilteredList(datasheetListQuery.data ?? [], filters, searchDatasheetName), sort);

    const { css } = useStyles();

    return (
        <Main title={t("title", { datastoreName: datastore?.name })}>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-lg-8")}>
                    <h1>
                        {t("title", { datastoreName: datastore?.name })}
                        {(isFetching || datasheetListQuery?.isFetching) && <LoadingIcon className={fr.cx("fr-ml-2w")} largeIcon={true} />}
                    </h1>
                    {datastore?.is_sandbox === true && <Highlight>{t("sandbox_datastore_explanation") ?? ""}</Highlight>}
                </div>
                <div
                    className={fr.cx("fr-col-12", "fr-col-lg-4", "fr-col--top")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {/* on attend de savoir si création de nouvelle fiche possible ou pas avant d'afficher le ou les boutons */}
                    {metadataEndpoint && !datasheetCreationImpossible && (
                        <div
                            className={css({
                                marginLeft: "inherit",
                                [fr.breakpoints.up("lg")]: {
                                    marginLeft: "auto",
                                },
                            })}
                        >
                            <ButtonsGroup
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
                                inlineLayoutWhen="sm and up"
                            />
                        </div>
                    )}
                </div>
            </div>

            {metadataEndpoint && datasheetCreationImpossible && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    <div className={fr.cx("fr-col")}>
                        <Alert severity="warning" title={t("datasheet_creation_impossible")} as="h2" description={t("metadata_endpoint_quota_reached")} />
                    </div>
                </div>
            )}

            {datasheetListQuery.data === undefined ? (
                <Skeleton count={12} rectangleHeight={100} />
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-2v")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-8", "fr-col-offset-md-2")}>
                            <SearchBar
                                label={tCommon("search")}
                                onButtonClick={(text) => {
                                    setSearchDatasheetName(text);
                                    routes.datasheet_list({ datastoreId }).replace();
                                }}
                                allowEmptySearch={true}
                                big
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
                                            checked: filters.length === 0,
                                            onChange: () => {
                                                setFilters([]);
                                                routes.datasheet_list({ datastoreId }).replace();
                                            },
                                        },
                                    },
                                    {
                                        label: t("filter_option", { filter: FilterEnum.PUBLISHED }),
                                        nativeInputProps: {
                                            value: FilterEnum.PUBLISHED.toString(),
                                            checked: filters.includes(FilterEnum.PUBLISHED),
                                            onChange: () => {
                                                setFilters([FilterEnum.PUBLISHED]);
                                                routes.datasheet_list({ datastoreId }).replace();
                                            },
                                        },
                                    },
                                    {
                                        label: t("filter_option", { filter: FilterEnum.NOT_PUBLISHED }),
                                        nativeInputProps: {
                                            value: FilterEnum.NOT_PUBLISHED.toString(),
                                            checked: filters.includes(FilterEnum.NOT_PUBLISHED),
                                            onChange: () => {
                                                setFilters([FilterEnum.NOT_PUBLISHED]);
                                                routes.datasheet_list({ datastoreId }).replace();
                                            },
                                        },
                                    },
                                ]}
                                orientation="horizontal"
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm")}>
                            <SelectNext
                                label={<h2 className={fr.cx("fr-h5")}>{t("sort_label")}</h2>}
                                options={[
                                    {
                                        label: t("sort_option", { sort: SortByEnum.NAME, sortOrder: SortOrderEnum.ASCENDING }),
                                        value: `${SortByEnum.NAME}_${SortOrderEnum.ASCENDING}`,
                                    },
                                    {
                                        label: t("sort_option", { sort: SortByEnum.NAME, sortOrder: SortOrderEnum.DESCENDING }),
                                        value: `${SortByEnum.NAME}_${SortOrderEnum.DESCENDING}`,
                                    },
                                    {
                                        label: t("sort_option", { sort: SortByEnum.NB_SERVICES, sortOrder: SortOrderEnum.ASCENDING }),
                                        value: `${SortByEnum.NB_SERVICES}_${SortOrderEnum.ASCENDING}`,
                                    },
                                    {
                                        label: t("sort_option", { sort: SortByEnum.NB_SERVICES, sortOrder: SortOrderEnum.DESCENDING }),
                                        value: `${SortByEnum.NB_SERVICES}_${SortOrderEnum.DESCENDING}`,
                                    },
                                ]}
                                nativeSelectProps={{
                                    "aria-label": t("sort_label"),
                                    value: `${sort.by}_${sort.order}`,
                                    onChange: (e) => {
                                        const selectedSort = e.currentTarget.value?.split("_");
                                        const selectedSortBy = Number(selectedSort?.[0]);
                                        const selectedSortOrder = Number(selectedSort?.[1]);

                                        if (isNaN(selectedSortBy) || selectedSortBy === 0 || isNaN(selectedSortOrder) || selectedSortOrder === 0) return;
                                        setSort((prev) => ({ ...prev, by: selectedSortBy, order: selectedSortOrder }));
                                    },
                                }}
                                placeholder={t("sort_placeholder")}
                            />
                        </div>
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
                        <div
                            className={fr.cx("fr-col")}
                            style={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <h2 className={fr.cx("fr-text--sm", "fr-mb-0")}>{t("nb_results", { nb: datasheetList.length })}</h2>
                            <span
                                className={fr.cx("fr-text--sm", "fr-mb-0", "fr-mr-2v")}
                                style={{
                                    marginLeft: "auto",
                                }}
                            >
                                {t("last_refresh_date", { dataUpdatedAt: datasheetListQuery.dataUpdatedAt })}
                            </span>
                            <Button
                                title={t("refresh_datasheet_list")}
                                onClick={() => datasheetListQuery.refetch()}
                                iconId="ri-refresh-line"
                                nativeButtonProps={{
                                    "aria-disabled": datasheetListQuery.isFetching,
                                }}
                                disabled={datasheetListQuery.isFetching}
                                size="small"
                                className={datasheetListQuery.isFetching ? "frx-icon-spin" : ""}
                            />
                        </div>
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-4v")}>
                        <div className={fr.cx("fr-col")}>
                            {datasheetList
                                ?.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)
                                .map((datasheet: Datasheet) => <DatasheetListItem key={datasheet.name} datastoreId={datastoreId} datasheet={datasheet} />)}

                            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-6v")}>
                                <Pagination
                                    count={Math.ceil(datasheetList.length / pagination.limit)}
                                    showFirstLast={true}
                                    getPageLinkProps={(pageNumber) => ({
                                        ...routes.datasheet_list({ datastoreId, page: pageNumber, limit: pagination.limit }).link,
                                    })}
                                    defaultPage={pagination.page}
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
