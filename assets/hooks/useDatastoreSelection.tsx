import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { sandboxCommunityId } from "@/env";
import { findMembership } from "@/utils";
import api from "../entrepot/api";
import { CartesApiException } from "../modules/jsonFetch";
import useUserQuery from "./queries/useUserQuery";

type DatastoreSelectionInfo = {
    /** absent uniquement pour l'entrée sandbox tant que l'utilisateur n'en est pas membre */
    _id?: string;
    name?: string;
    community_id: string;
    is_sandbox?: boolean;
};

const collator = new Intl.Collator("fr");

const useDatastoreSelection = () => {
    const navigate = useNavigate();
    const userQuery = useUserQuery();
    const { data: user } = userQuery;

    const { mutate: addUserToSandbox } = useMutation<undefined, CartesApiException>({
        mutationFn: () => {
            return api.user.addToSandbox();
        },
        onSuccess: async () => {
            // attendre le rafraîchissement de user_me AVANT de naviguer, sinon le gate refuse l'accès
            const { data: freshUser } = await userQuery.refetch();
            const datastoreId = sandboxCommunityId !== null ? findMembership(freshUser, { communityId: sandboxCommunityId })?.community?.datastore : undefined;
            if (datastoreId) {
                navigate({ to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId } });
            }
        },
    });

    // liste des entrepôts, entièrement depuis user.communities_member (aucune requête)
    const datastoreList: DatastoreSelectionInfo[] = useMemo(() => {
        const list: DatastoreSelectionInfo[] = (user?.communities_member ?? [])
            .filter((cm) => cm.community !== undefined && cm.community.datastore !== undefined)
            .map((cm) => ({
                _id: cm.community!.datastore,
                name: cm.community!.name!,
                community_id: cm.community!._id,
                is_sandbox: sandboxCommunityId !== null && cm.community!._id === sandboxCommunityId,
            }));

        // entrée sandbox proposée même sans appartenance (l'utilisateur la rejoint au clic)
        if (sandboxCommunityId !== null && list.find((ds) => ds.is_sandbox === true) === undefined) {
            list.push({ community_id: sandboxCommunityId, is_sandbox: true });
        }

        // sandbox en premier, puis ordre alphabétique
        return list.sort((a, b) => (b.is_sandbox === true ? 1 : 0) - (a.is_sandbox === true ? 1 : 0) || collator.compare(a.name ?? "", b.name ?? ""));
    }, [user?.communities_member]);

    const query = useMemo(
        () => ({
            isFetching: userQuery.isFetching,
            refetch: userQuery.refetch,
            dataUpdatedAt: userQuery.dataUpdatedAt,
        }),
        [userQuery.isFetching, userQuery.refetch, userQuery.dataUpdatedAt]
    );

    return {
        datastoreList,
        addUserToSandbox,
        query,
    };
};

export default useDatastoreSelection;
