import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import SelectNext from "@codegouvfr/react-dsfr/SelectNext";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { FC, useMemo } from "react";
import { tss } from "tss-react";
import { useToggle } from "@mantine/hooks";

import DatastoreMain from "@/components/Layout/DatastoreMain";
import DatastoreTertiaryNavigation from "@/components/Layout/DatastoreTertiaryNavigation";
import { ListHeader } from "@/components/Layout/ListHeader";
import PageTitle from "@/components/Layout/PageTitle";
import { datastoreSuspenseQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import { FilterEnum, useFilters } from "@/hooks/useFilters";
import { usePagination } from "@/hooks/usePagination";
import { useSearch } from "@/hooks/useSearch";
import { searchAwareActiveOptions } from "@/router/AppLink";
import { SortOrderEnum, useSort } from "@/hooks/useSort";
import { Datasheet, EndpointTypeEnum } from "../../../../@types/app";
import Skeleton from "../../../../components/Utils/Skeleton";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import api from "../../../api";
import { SortByEnum } from "./DatasheetList.types";
import DatasheetListItem from "./DatasheetListItem";
import NoData from "./NoData";
import SandboxDatastoreExplanation from "./SandboxDatastoreExplanation";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import useDatastoreMembership from "@/hooks/useDatastoreMembership";

const filterTests = {
    [FilterEnum.ENABLED]: (d: Datasheet) => d.nb_publications > 0,
    [FilterEnum.DISABLED]: (d: Datasheet) => d.nb_publications === 0,
};

const route = getRouteApi("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/");

type DatasheetListProps = {
    datastoreId: string;
};
const DatasheetList: FC<DatasheetListProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatasheetList");
    const { data: datastore } = useSuspenseQuery(datastoreSuspenseQueryOptions(datastoreId));
    const { t: tCommon } = useTranslation("Common");

    const datasheetListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_list(datastoreId),
        queryFn: ({ signal }) => api.datasheet.getList(datastoreId, { signal }),
        staleTime: 60000,
    });
    const { data: datasheetList, dataUpdatedAt, isFetching, isLoading, refetch } = datasheetListQuery;

    const metadataEndpoint = useMemo(
        () => datastore?.endpoints?.find((endpoint) => endpoint.endpoint.type === EndpointTypeEnum.METADATA),
        [datastore?.endpoints]
    );

    const datasheetCreationImpossible = Boolean(
        metadataEndpoint && metadataEndpoint?.quota && metadataEndpoint?.use && metadataEndpoint?.quota <= metadataEndpoint?.use
    );

    const searchParams = route.useSearch();
    const { page, limit } = searchParams;
    const navigate = useNavigate();

    const [showFilters, toggleShowFilters] = useToggle();

    // filtre et tri
    const { search, searchedItems } = useSearch(datasheetList ?? [], searchParams.search ?? "");
    const { filteredItems, filters } = useFilters(searchedItems, searchParams, ["published"], filterTests);
    const { sortBy, sortOrder, sortedItems } = useSort(filteredItems, searchParams, ["name", "nb_publications"]);
    const { paginatedItems, totalPages } = usePagination(sortedItems, page, limit);

    // useFilters ne produit que des valeurs scalaires pour published
    const published = filters.published as FilterEnum;

    const { classes, cx } = useStyles();

    const membership = useDatastoreMembership();

    return (
        <DatastoreMain title={t("title", { datastoreName: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name })} datastoreId={datastoreId}>
            <PageTitle title={t("title", { datastoreName: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name })}>
                {datastore?.is_sandbox === true && <SandboxDatastoreExplanation />}
            </PageTitle>

            <DatastoreTertiaryNavigation datastoreId={datastoreId} communityId={datastore.community._id} />

            {datasheetList && datasheetList?.length > 0 && (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-6v", "fr-mb-16v")}>
                        <div
                            className={fr.cx("fr-col-12", "fr-py-0")}
                            style={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <strong className={fr.cx("fr-text--xl", "fr-m-0", "fr-mr-2v")}>Fiches de données</strong>
                            <Badge severity="info" noIcon={true}>
                                {filteredItems.length ?? 0}
                            </Badge>
                            {membership?.can(CommunityMemberDtoRightsEnum.UPLOAD, CommunityMemberDtoRightsEnum.PROCESSING) && (
                                <Button
                                    linkProps={
                                        datasheetCreationImpossible
                                            ? { href: undefined, "aria-hidden": true }
                                            : {
                                                  to: "/tableau-de-bord/entrepots/$datastoreId/donnees/televersement" as const,
                                                  params: { datastoreId },
                                              }
                                    }
                                    iconId="fr-icon-add-line"
                                    iconPosition="right"
                                    className={fr.cx("fr-ml-auto", datasheetCreationImpossible && "fr-hidden")}
                                >
                                    {t("create_datasheet")}
                                </Button>
                            )}
                        </div>
                    </div>

                    {metadataEndpoint && datasheetCreationImpossible && (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                            <div className={fr.cx("fr-col")}>
                                <Alert
                                    severity="warning"
                                    title={t("datasheet_creation_impossible")}
                                    as="h2"
                                    description={t("metadata_endpoint_quota_reached")}
                                />
                            </div>
                        </div>
                    )}

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-2v")}>
                        <div
                            className={fr.cx("fr-col-12")}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: fr.spacing("4v"),
                            }}
                        >
                            <SearchBar
                                label={tCommon("search")}
                                onButtonClick={(text) => {
                                    if (!isLoading) {
                                        navigate({
                                            to: "/tableau-de-bord/entrepots/$datastoreId/donnees",
                                            params: { datastoreId },
                                            search: { search: text, sortBy, sortOrder, published },
                                            replace: true,
                                        });
                                    }
                                }}
                                allowEmptySearch={true}
                                renderInput={(props) => <input {...props} disabled={isLoading} />}
                                defaultValue={search}
                            />
                            <Button priority="secondary" iconId="fr-icon-equalizer-line" onClick={() => toggleShowFilters()}>
                                Filtres
                            </Button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className={cx(classes.filterRoot, fr.cx("fr-my-6v"))}>
                            <div className={classes.filterSelect}>
                                <SelectNext
                                    label={t("filter_label")}
                                    options={[
                                        {
                                            label: t("filter_option", { filter: FilterEnum.ALL }),
                                            value: FilterEnum.ALL.toString(),
                                        },
                                        {
                                            label: t("filter_option", { filter: FilterEnum.ENABLED }),
                                            value: FilterEnum.ENABLED.toString(),
                                        },
                                        {
                                            label: t("filter_option", { filter: FilterEnum.DISABLED }),
                                            value: FilterEnum.DISABLED.toString(),
                                        },
                                    ]}
                                    nativeSelectProps={{
                                        value: filters.published?.toString() ?? FilterEnum.ALL.toString(),
                                        onChange: (event) => {
                                            const value = event.target.value;
                                            if (value === FilterEnum.ALL.toString()) {
                                                navigate({
                                                    to: "/tableau-de-bord/entrepots/$datastoreId/donnees",
                                                    params: { datastoreId },
                                                    search: { search, sortBy, sortOrder },
                                                    replace: true,
                                                });
                                            } else {
                                                const selectedPublished = value === FilterEnum.ENABLED.toString() ? FilterEnum.ENABLED : FilterEnum.DISABLED;
                                                navigate({
                                                    to: "/tableau-de-bord/entrepots/$datastoreId/donnees",
                                                    params: { datastoreId },
                                                    search: { search, sortBy, sortOrder, published: selectedPublished },
                                                    replace: true,
                                                });
                                            }
                                        },
                                    }}
                                    placeholder={t("filter_placeholder")}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className={classes.filterSelect}>
                                <SelectNext
                                    label={t("sort_label")}
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
                                            navigate({
                                                to: "/tableau-de-bord/entrepots/$datastoreId/donnees",
                                                params: { datastoreId },
                                                search: { search, sortBy: selectedSortBy, sortOrder: selectedSortOrder, published },
                                                replace: true,
                                            });
                                        },
                                    }}
                                    placeholder={t("sort_placeholder")}
                                    disabled={isLoading}
                                />
                            </div>
                            {/* <div className={classes.filterApplyBtn}>
                                <Button>Valider</Button>
                            </div> */}
                        </div>
                    )}
                </>
            )}

            {isLoading ? (
                <Skeleton count={6} rectangleHeight={200} />
            ) : (
                <>
                    {datasheetList && datasheetList.length > 0 ? (
                        <>
                            <ListHeader
                                nbResults={{
                                    displayed: paginatedItems.length,
                                    total: filteredItems.length,
                                }}
                                dataUpdatedAt={dataUpdatedAt}
                                isFetching={isFetching}
                                refetch={refetch}
                            />

                            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                                {paginatedItems.map((datasheet: Datasheet) => (
                                    <div className={fr.cx("fr-col-12")} key={datasheet.name}>
                                        <DatasheetListItem datastoreId={datastoreId} datasheet={datasheet} />
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-6v")}>
                                    <Pagination
                                        count={totalPages}
                                        showFirstLast={true}
                                        getPageLinkProps={(pageNumber) => ({
                                            to: "/tableau-de-bord/entrepots/$datastoreId/donnees",
                                            params: { datastoreId },
                                            search: { page: pageNumber, limit, search, sortBy, sortOrder, published },
                                            activeOptions: searchAwareActiveOptions,
                                        })}
                                        defaultPage={page}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <NoData datastoreId={datastoreId} />
                    )}
                </>
            )}
        </DatastoreMain>
    );
};

export default DatasheetList;

const useStyles = tss.withName({ DatasheetList }).create({
    filterRoot: {
        display: "flex",
        flexDirection: "column",
        gap: fr.spacing("4v"),
        [fr.breakpoints.up("sm")]: {
            flexDirection: "row",
            alignItems: "center",
        },
    },
    filterSelect: {
        width: "100%",
        [fr.breakpoints.up("sm")]: {
            width: "auto",
            flex: 1,
        },
    },
    // filterApplyBtn: {
    //     [fr.breakpoints.up("sm")]: {
    //         flex: 0,
    //         alignSelf: "flex-end",
    //     },
    // },
});
