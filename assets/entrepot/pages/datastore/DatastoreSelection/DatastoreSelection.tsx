import DatastoreMain from "@/components/Layout/DatastoreMain";
import { fr } from "@codegouvfr/react-dsfr";
import Card from "@codegouvfr/react-dsfr/Card";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";

import { ListHeader } from "@/components/Layout/ListHeader";
import useDatastoreSelection from "@/hooks/useDatastoreSelection";
import { usePagination } from "@/hooks/usePagination";
import { useTranslation } from "@/i18n";
import { routes, useRoute } from "@/router/router";

import placeholder16x9 from "@/img/placeholder.16x9.png";
import sandboxDatastoreThumbnailSvg from "@/img/sandbox-datastore-thumbnail.svg";

export default function DatastoreSelection() {
    const { t: tCommon } = useTranslation("Common");
    const { datastoreList, addUserToSandbox, sandboxDatastore, userMemberOfSandbox, query } = useDatastoreSelection();

    const { params } = useRoute();
    const page = params["page"] ? parseInt(params["page"]) : 1;
    const limit = params["limit"] ? parseInt(params["limit"]) : 20;

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
                {paginatedItems.map((datastore, i) => (
                    <div key={datastore._id + i} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                        <Card
                            imageUrl={datastore.is_sandbox === true ? sandboxDatastoreThumbnailSvg : placeholder16x9}
                            imageAlt=""
                            title={datastore._id === sandboxDatastore?._id ? tCommon("sandbox") : datastore.name}
                            titleAs="h6"
                            linkProps={
                                datastore.is_sandbox === true && !userMemberOfSandbox
                                    ? { ...routes.datasheet_list({ datastoreId: sandboxDatastore!._id }).link, onClick: () => addUserToSandbox() }
                                    : routes.datasheet_list({ datastoreId: datastore._id }).link
                            }
                            endDetail="Voir"
                            enlargeLink={true}
                            size="small"
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
                            ...routes.datastore_selection({ page: pageNumber, limit: limit }).link,
                        })}
                        defaultPage={page}
                    />
                </div>
            )}
        </DatastoreMain>
    );
}
