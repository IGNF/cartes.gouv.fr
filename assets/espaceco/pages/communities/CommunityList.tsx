import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import { GetResponse } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import api from "../../../espaceco/api";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import Pagination from "../../../components/Utils/Pagination";
import { fr } from "@codegouvfr/react-dsfr";
import LoadingText from "../../../components/Utils/LoadingText";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import Wait from "../../../components/Utils/Wait";
import { useTranslation } from "../../../i18n/i18n";

const limit = 10;

type QueryParams = {
    name: string;
    currentPage: number;
};

const CommunityList: FC = () => {
    const [params, setParams] = useState<QueryParams>({ name: "", currentPage: 1 });

    const { t: tCommon } = useTranslation("Common");

    // const { data /*, isError, error*/ } = useInfiniteQuery<
    //     GetResponse<CommunityResponseDTO>,
    //     CartesApiException,
    //     InfiniteData<GetResponse<CommunityResponseDTO>, number>,
    //     string[],
    //     number
    // >({
    //     queryKey: RQKeys.community_list("", currentPage, limit),
    //     queryFn: ({ pageParam, signal }) => api.community.get(pageParam, limit, signal),
    //     initialPageParam: 1,
    //     getNextPageParam: (lastPage /*, allPages, lastPageParam, allPageParams*/) => lastPage.nextPage,
    //     getPreviousPageParam: (firstPage /*, allPages, firstPageParam, allPageParams*/) => firstPage.previousPage,
    // });

    const communityQuery = useQuery<GetResponse<CommunityResponseDTO>, CartesApiException>({
        queryKey: RQKeys.community_list(params.name, params.currentPage, limit),
        queryFn: ({ signal }) => api.community.get(params.name, params.currentPage, limit, signal),
        staleTime: 20000,
        retry: false,
        enabled: params.name.length === 0 || params.name.length > 3,
    });

    console.log(communityQuery.data);

    return (
        <div className={fr.cx("fr-container")}>
            {communityQuery.isLoading ? (
                <Wait>
                    <div>
                        <LoadingIcon className={fr.cx("fr-ml-2w")} largeIcon={true} />
                        <span className={fr.cx("fr-ml-1v")}>{tCommon("loading")}</span>
                    </div>
                </Wait>
            ) : (
                // <LoadingText as={"h3"} />
                communityQuery.data?.content.length && (
                    <>
                        <ul>{communityQuery.data?.content.map((community) => <li key={community.id}>{community.name}</li>)}</ul>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                            <Pagination
                                size={"large"}
                                count={communityQuery.data.totalPages}
                                page={params.currentPage}
                                onChange={(_, page) => setParams({ ...params, currentPage: page })}
                                /*getPageLinkProps={(pageNumber) => {
                        return {
                            onClick: () => setParams({ ...params, currentPage: pageNumber }),
                        };
                    }}*/
                            />
                        </div>
                    </>
                )
            )}
        </div>
    );
};

export default CommunityList;
