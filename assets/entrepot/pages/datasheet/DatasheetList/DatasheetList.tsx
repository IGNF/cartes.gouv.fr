import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import SelectNext from "@codegouvfr/react-dsfr/SelectNext";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

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

    return (
        <Main title="Mes données">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12")}>
                    <h1>
                        {t("title", { datastoreName: datastore?.name })}
                        {(isFetching || datasheetListQuery?.isFetching) && <LoadingIcon className={fr.cx("fr-ml-2w")} largeIcon={true} />}
                    </h1>

                    {datastore?.is_sandbox === true && t("sandbox_datastore_explanation")}
                </div>
            </div>

            {/* on attend de savoir si création de nouvelle possible ou pas avant d'afficher les boutons */}
            {metadataEndpoint && (
                <>
                    {datasheetCreationImpossible && (
                        <Alert severity="warning" title={t("datasheet_creation_impossible")} description={t("metadata_endpoint_quota_reached")} />
                    )}

                    <div className={fr.cx("fr-grid-row", "fr-mt-4v")}>
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
                                {
                                    children: t("refresh_datasheet_list"),
                                    onClick: () => datasheetListQuery.refetch(),
                                    nativeButtonProps: {
                                        "aria-disabled": datasheetListQuery.isFetching,
                                    },
                                    priority: "secondary",
                                    disabled: datasheetListQuery.isFetching,
                                },
                            ]}
                            inlineLayoutWhen="sm and up"
                        />
                    </div>
                </>
            )}

            {datasheetListQuery.data === undefined ? (
                <Skeleton count={12} rectangleHeight={100} />
            ) : (
                <>
                    <p>{t("last_refresh_date", { dataUpdatedAt: datasheetListQuery.dataUpdatedAt })}</p>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12")}>
                            <SearchBar
                                label={tCommon("search")}
                                onButtonClick={(text) => {
                                    setSearchDatasheetName(text);
                                    routes.datasheet_list({ datastoreId }).replace();
                                }}
                                allowEmptySearch={true}
                            />
                        </div>
                    </div>

                    {/* <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                            <Chec
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md-4")}></div>
                    </div> */}

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                            <SelectNext
                                label={null}
                                options={[
                                    {
                                        value: FilterEnum.PUBLISHED.toString(),
                                        label: t("filter_option", { filter: FilterEnum.PUBLISHED }),
                                    },
                                    {
                                        value: FilterEnum.NOT_PUBLISHED.toString(),
                                        label: t("filter_option", { filter: FilterEnum.NOT_PUBLISHED }),
                                    },
                                ]}
                                nativeSelectProps={{
                                    "aria-label": t("filter_label"),
                                    onClick: (e) => {
                                        const selectedFilter = Number(e.currentTarget.value);
                                        if (isNaN(selectedFilter) || selectedFilter === 0) return;

                                        setFilters((prev) => (prev.includes(selectedFilter) ? [...prev] : [...prev, selectedFilter]));
                                        e.currentTarget.value = "";
                                        routes.datasheet_list({ datastoreId }).replace();
                                    },
                                }}
                                placeholder={t("filter_placeholder")}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                            <ul className={fr.cx("fr-tags-group")}>
                                {filters.map((filter) => (
                                    <li key={filter}>
                                        <Tag
                                            dismissible
                                            nativeButtonProps={{
                                                onClick: () => {
                                                    setFilters((prev) => prev.filter((f) => f !== filter));
                                                    routes.datasheet_list({ datastoreId }).replace();
                                                },
                                            }}
                                        >
                                            {t("filter_option", { filter: Number(filter) })}
                                        </Tag>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--right", "fr-mb-4v")}>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-8")}>
                            <SelectNext
                                label={null}
                                options={[
                                    {
                                        label: t("sort_option", { sort: SortByEnum.NAME }),
                                        value: SortByEnum.NAME.toString(),
                                    },
                                    {
                                        label: t("sort_option", { sort: SortByEnum.NB_SERVICES }),
                                        value: SortByEnum.NB_SERVICES.toString(),
                                    },
                                ]}
                                nativeSelectProps={{
                                    "aria-label": t("sort_label"),
                                    value: sort.by.toString(),
                                    onChange: (e) => {
                                        const selectedSortBy = Number(e.currentTarget.value);

                                        if (isNaN(selectedSortBy) || selectedSortBy === 0) return;
                                        setSort((prev) => ({ ...prev, by: selectedSortBy }));
                                    },
                                }}
                                placeholder={t("sort_placeholder")}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-4")}>
                            <SelectNext
                                label={null}
                                options={[
                                    {
                                        label: t("sort_order_option", { sortOrder: SortOrderEnum.ASCENDING }),
                                        value: SortOrderEnum.ASCENDING.toString(),
                                    },
                                    {
                                        label: t("sort_order_option", { sortOrder: SortOrderEnum.DESCENDING }),
                                        value: SortOrderEnum.DESCENDING.toString(),
                                    },
                                ]}
                                nativeSelectProps={{
                                    "aria-label": t("sort_order_label"),
                                    value: sort.order.toString(),
                                    onChange: (e) => {
                                        const selectedSortOrder = Number(e.currentTarget.value);
                                        if (isNaN(selectedSortOrder) || selectedSortOrder === 0) return;
                                        setSort((prev) => ({ ...prev, order: selectedSortOrder }));
                                    },
                                }}
                                placeholder={t("sort_order_placeholder")}
                            />
                        </div>
                    </div>

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
                </>
            )}
        </Main>
    );
};

export default DatasheetList;
