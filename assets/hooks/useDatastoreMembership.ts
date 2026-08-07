import { useParams } from "@tanstack/react-router";

import useMembership from "./useMembership";

/**
 * Appartenance de l'utilisateur à la communauté liée à l'entrepôt courant.
 * Null si l'appartenance est introuvable (données périmées) : dégrade en "aucun droit" au lieu de lever une erreur.
 */
const useDatastoreMembership = () => {
    // ce hook n'est appelé que sous le layout datastore
    const { datastoreId } = useParams({ from: "/_private/tableau-de-bord/entrepots/$datastoreId" });

    return useMembership({ datastoreId });
};

export default useDatastoreMembership;
