import { useMutation } from "@tanstack/react-query";

import { routes } from "@/router/router";
import api from "../entrepot/api";
import { CartesApiException } from "../modules/jsonFetch";
import { useAuthStore } from "../stores/AuthStore";
import { useSandboxDatastoreQuery } from "./queries/useSandboxDatastoreQuery";
import useUserQuery from "./queries/useUserQuery";

type DatastoreSelectionInfo = {
    _id: string;
    technical_name: string;
    name: string;
    community_id: string;
    is_sandbox?: boolean;
};
const useDatastoreSelection = () => {
    const user = useAuthStore((state) => state.user);
    let datastoreList: DatastoreSelectionInfo[] = [];

    const communitiesMember = user?.communities_member ?? [];

    const sandboxDatastoreQuery = useSandboxDatastoreQuery();
    const { data: sandboxDatastore } = sandboxDatastoreQuery;

    const userQuery = useUserQuery();

    const { mutate: addUserToSandbox } = useMutation<undefined, CartesApiException>({
        mutationFn: () => {
            return api.user.addToSandbox();
        },
        onSuccess: () => {
            if (sandboxDatastore?._id) {
                routes.datasheet_list({ datastoreId: sandboxDatastore._id }).push();
            }
        },
    });

    // création de la liste des entrepôts
    datastoreList = communitiesMember
        .filter((cm) => cm.community !== undefined && cm.community.datastore !== undefined)
        .map((cm) => ({
            _id: cm.community!.datastore,
            technical_name: cm.community!.technical_name,
            name: cm.community!.name!,
            community_id: cm.community!._id,
            is_sandbox: cm.community?.datastore === sandboxDatastore?._id,
        }));

    const userMemberOfSandbox = sandboxDatastore !== undefined && datastoreList.find((ds) => ds._id === sandboxDatastore._id) !== undefined;

    // ajout de l'entrepôt sandbox si l'utilisateur ne fait pas encore partie de cet entrepôt
    if (sandboxDatastore !== undefined && !userMemberOfSandbox) {
        datastoreList.unshift({
            _id: sandboxDatastore._id,
            technical_name: sandboxDatastore.technical_name,
            name: sandboxDatastore.name,
            community_id: sandboxDatastore.community._id,
            is_sandbox: true,
        });
    }

    // tri alphabétique
    datastoreList.sort((a, b) => a.name.localeCompare(b.name));

    // tri pour positionner le datastore bac à sable en premier
    const sortedDatastoreList = datastoreList.sort((a, b) => {
        if (a._id === sandboxDatastore?._id) return -1;
        if (b._id === sandboxDatastore?._id) return 1;
        return 0;
    });

    const refetch = () => {
        sandboxDatastoreQuery.refetch();
        userQuery.refetch();
    };

    const query = {
        isFetching: sandboxDatastoreQuery.isFetching || userQuery.isFetching,
        refetch,
        dataUpdatedAt: Math.max(sandboxDatastoreQuery.dataUpdatedAt, userQuery.dataUpdatedAt),
    };

    return {
        datastoreList: sortedDatastoreList,
        addUserToSandbox,
        sandboxDatastore,
        userMemberOfSandbox,
        query,
    };
};

export default useDatastoreSelection;
