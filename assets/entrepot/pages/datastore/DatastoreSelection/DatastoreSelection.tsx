import DatastoreMain from "@/components/Layout/DatastoreMain";
import { fr } from "@codegouvfr/react-dsfr";
import { getRouteApi } from "@tanstack/react-router";
import Card from "@codegouvfr/react-dsfr/Card";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";

import { ListHeader } from "@/components/Layout/ListHeader";
import useDatastoreSelection from "@/hooks/useDatastoreSelection";
import { usePagination } from "@/hooks/usePagination";
import { useTranslation } from "@/i18n";
import { searchAwareActiveOptions } from "@/router/AppLink";

import placeholder16x9 from "@/img/placeholder.16x9.png";
import sandboxDatastoreThumbnailSvg from "@/img/sandbox-datastore-thumbnail.svg";

const routeApi = getRouteApi("/_private/_panneau/tableau-de-bord/entrepots/");

export default function DatastoreSelection() {
    const { t: tCommon } = useTranslation("Common");
    const { datastoreList, addUserToSandbox, query } = useDatastoreSelection();

    const { page, limit } = routeApi.useSearch();

    const { paginatedItems, totalPages } = usePagination(datastoreList, page, limit);

    return (
        <DatastoreMain title="Entrepôts">
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col-12", "fr-col-sm-4")}>
                    <SearchBar />
                </div>
            </div>

            <ListHeader
                nbResults={{
                    displayed: paginatedItems.length,
                    total: datastoreList.length,
                }}
                dataUpdatedAt={query.dataUpdatedAt}
                refetch={query.refetch}
                isFetching={query.isFetching}
            />

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                {paginatedItems.map((datastore) => (
                    <div key={datastore.community_id} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                        <Card
                            imageUrl={datastore.is_sandbox === true ? sandboxDatastoreThumbnailSvg : placeholder16x9}
                            imageAlt=""
                            title={tCommon("datastore_name", { name: datastore.name, isSandbox: datastore.is_sandbox })}
                            titleAs="h6"
                            linkProps={
                                datastore._id !== undefined
                                    ? { to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId: datastore._id } }
                                    : {
                                          href: "#",
                                          onClick: (e) => {
                                              e.preventDefault();
                                              addUserToSandbox();
                                          },
                                      }
                            }
                            endDetail="Voir"
                            enlargeLink={true}
                            size="small"
                            data-sandbox={datastore.is_sandbox === true ? "true" : undefined}
                            data-user-member-of-sandbox={datastore.is_sandbox === true && datastore._id !== undefined}
                        />
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-6v")}>
                    <Pagination
                        count={totalPages}
                        showFirstLast={true}
                        getPageLinkProps={(pageNumber) => ({
                            to: ".",
                            search: (prev) => ({ ...prev, page: pageNumber }),
                            activeOptions: searchAwareActiveOptions,
                        })}
                        defaultPage={page}
                    />
                </div>
            )}
        </DatastoreMain>
    );
}
